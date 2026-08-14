import Foundation
import HealthKit

final class HealthKitManager {
    private let store = HKHealthStore()
    private let iso = ISO8601DateFormatter()

    private func quantityType(_ identifier: HKQuantityTypeIdentifier) -> HKQuantityType? {
        HKObjectType.quantityType(forIdentifier: identifier)
    }

    private var readTypes: Set<HKObjectType> {
        var types: Set<HKObjectType> = [HKObjectType.workoutType()]
        [
            HKQuantityTypeIdentifier.distanceWalkingRunning,
            .activeEnergyBurned,
            .heartRate,
            .stepCount,
            .runningSpeed,
            .runningPower,
            .runningStrideLength,
            .runningGroundContactTime,
            .runningVerticalOscillation
        ].compactMap(quantityType).forEach { types.insert($0) }
        return types
    }

    func requestReadAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw HealthBridgeError.healthDataUnavailable
        }
        try await withCheckedThrowingContinuation { continuation in
            store.requestAuthorization(toShare: [], read: readTypes) { success, error in
                if let error { continuation.resume(throwing: error); return }
                if success { continuation.resume(returning: ()) }
                else { continuation.resume(throwing: HealthBridgeError.authorizationFailed) }
            }
        }
    }

    func fetchRunningWorkouts(since startDate: Date) async throws -> [HealthWorkoutPayload] {
        let workouts: [HKWorkout] = try await withCheckedThrowingContinuation { continuation in
            let activity = HKQuery.predicateForWorkouts(with: .running)
            let date = HKQuery.predicateForSamples(withStart: startDate, end: nil, options: .strictStartDate)
            let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [activity, date])
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: HKObjectType.workoutType(),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, error in
                if let error { continuation.resume(throwing: error); return }
                continuation.resume(returning: samples as? [HKWorkout] ?? [])
            }
            store.execute(query)
        }
        return workouts.map(payload)
    }

    private func sum(_ workout: HKWorkout, _ id: HKQuantityTypeIdentifier, unit: HKUnit) -> Double? {
        guard let type = quantityType(id), let q = workout.statistics(for: type)?.sumQuantity() else { return nil }
        return q.doubleValue(for: unit)
    }

    private func average(_ workout: HKWorkout, _ id: HKQuantityTypeIdentifier, unit: HKUnit) -> Double? {
        guard let type = quantityType(id), let q = workout.statistics(for: type)?.averageQuantity() else { return nil }
        return q.doubleValue(for: unit)
    }

    private func maximum(_ workout: HKWorkout, _ id: HKQuantityTypeIdentifier, unit: HKUnit) -> Double? {
        guard let type = quantityType(id), let q = workout.statistics(for: type)?.maximumQuantity() else { return nil }
        return q.doubleValue(for: unit)
    }

    private func payload(_ workout: HKWorkout) -> HealthWorkoutPayload {
        let km = sum(workout, .distanceWalkingRunning, unit: .meterUnit(with: .kilo))
        let kcal = sum(workout, .activeEnergyBurned, unit: .kilocalorie())
        let bpm = HKUnit.count().unitDivided(by: .minute())
        let stepsDouble = sum(workout, .stepCount, unit: .count())
        let steps = stepsDouble.map { Int($0.rounded()) }
        let cadence: Double? = {
            guard let steps, workout.duration > 0 else { return nil }
            return Double(steps) / (workout.duration / 60.0)
        }()
        let speedUnit = HKUnit.meterUnit(with: .none).unitDivided(by: .second())

        return HealthWorkoutPayload(
            healthkit_uuid: workout.uuid.uuidString,
            activity_type: "running",
            source_name: workout.sourceRevision.source.name,
            source_bundle_id: workout.sourceRevision.source.bundleIdentifier,
            device_model: workout.device?.model,
            started_at: iso.string(from: workout.startDate),
            finished_at: iso.string(from: workout.endDate),
            duration_seconds: max(1, Int(workout.duration.rounded())),
            distance_km: km,
            active_energy_kcal: kcal,
            avg_heart_rate_bpm: average(workout, .heartRate, unit: bpm),
            max_heart_rate_bpm: maximum(workout, .heartRate, unit: bpm),
            step_count: steps,
            cadence_spm: cadence,
            avg_speed_mps: average(workout, .runningSpeed, unit: speedUnit),
            running_power_w: average(workout, .runningPower, unit: .watt()),
            stride_length_m: average(workout, .runningStrideLength, unit: .meterUnit(with: .none)),
            ground_contact_ms: average(workout, .runningGroundContactTime, unit: .secondUnit(with: .milli)),
            vertical_oscillation_cm: average(workout, .runningVerticalOscillation, unit: .meterUnit(with: .centi)),
            elevation_gain_m: nil,
            route_available: false,
            metadata: [:]
        )
    }
}

enum HealthBridgeError: LocalizedError {
    case healthDataUnavailable
    case authorizationFailed

    var errorDescription: String? {
        switch self {
        case .healthDataUnavailable: return "HealthKit ist auf diesem Gerät nicht verfügbar."
        case .authorizationFailed: return "HealthKit-Berechtigung wurde nicht erteilt."
        }
    }
}
