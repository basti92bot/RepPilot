import Foundation

struct HealthWorkoutPayload: Codable, Sendable {
    let healthkit_uuid: String
    let activity_type: String
    let source_name: String?
    let source_bundle_id: String?
    let device_model: String?
    let started_at: String
    let finished_at: String
    let duration_seconds: Int
    let distance_km: Double?
    let active_energy_kcal: Double?
    let avg_heart_rate_bpm: Double?
    let max_heart_rate_bpm: Double?
    let step_count: Int?
    let cadence_spm: Double?
    let avg_speed_mps: Double?
    let running_power_w: Double?
    let stride_length_m: Double?
    let ground_contact_ms: Double?
    let vertical_oscillation_cm: Double?
    let elevation_gain_m: Double?
    let route_available: Bool
    let metadata: [String: String]
}

struct HealthImportRequest: Codable, Sendable {
    let workouts: [HealthWorkoutPayload]
}

struct HealthImportResponse: Decodable, Sendable {
    let imported: Int
}
