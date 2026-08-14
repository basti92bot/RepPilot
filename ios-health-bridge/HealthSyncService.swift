import Foundation
import Supabase

@MainActor
final class HealthSyncService: ObservableObject {
    @Published var isBusy = false
    @Published var isSignedIn = false
    @Published var status = "Bereit"
    @Published var lastImported = 0

    private let health = HealthKitManager()
    private let supabase = SupabaseConfig.client

    init() {
        isSignedIn = supabase.auth.currentSession != nil
    }

    func signIn(email: String, password: String) async {
        guard !email.isEmpty, !password.isEmpty else {
            status = "E-Mail und Passwort eingeben."
            return
        }
        isBusy = true
        defer { isBusy = false }
        do {
            try await supabase.auth.signIn(email: email, password: password)
            isSignedIn = true
            status = "Angemeldet."
        } catch {
            status = error.localizedDescription
        }
    }

    func syncLastSixMonths() async {
        guard supabase.auth.currentSession != nil else {
            isSignedIn = false
            status = "Bitte zuerst mit deinem RepPilot-Account anmelden."
            return
        }
        isBusy = true
        defer { isBusy = false }
        do {
            status = "HealthKit-Berechtigung wird geprüft …"
            try await health.requestReadAuthorization()

            let since = Calendar.current.date(byAdding: .month, value: -6, to: Date()) ?? Date(timeIntervalSinceNow: -180 * 86400)
            status = "Läufe werden aus Apple Health gelesen …"
            let workouts = try await health.fetchRunningWorkouts(since: since)
            guard !workouts.isEmpty else {
                lastImported = 0
                status = "Keine Lauftrainings in den letzten 6 Monaten gefunden."
                return
            }

            status = "\(workouts.count) Lauftrainings werden an RepPilot übertragen …"
            let response: HealthImportResponse = try await supabase.functions.invoke(
                "healthkit-import",
                options: FunctionInvokeOptions(body: HealthImportRequest(workouts: workouts))
            )
            lastImported = response.imported
            status = "Fertig: \(response.imported) Apple-Workouts synchronisiert."
        } catch {
            status = error.localizedDescription
        }
    }

    func signOut() async {
        isBusy = true
        defer { isBusy = false }
        do {
            try await supabase.auth.signOut()
            isSignedIn = false
            status = "Abgemeldet."
        } catch {
            status = error.localizedDescription
        }
    }
}
