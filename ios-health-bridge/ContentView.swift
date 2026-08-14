import SwiftUI

struct ContentView: View {
    @StateObject private var sync = HealthSyncService()
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("RepPilot Cloud") {
                    if sync.isSignedIn {
                        Label("Angemeldet", systemImage: "checkmark.circle.fill")
                        Button("Abmelden", role: .destructive) {
                            Task { await sync.signOut() }
                        }
                    } else {
                        TextField("E-Mail", text: $email)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()
                        SecureField("Passwort", text: $password)
                        Button("Anmelden") {
                            Task { await sync.signIn(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password) }
                        }
                        .disabled(sync.isBusy)
                    }
                }

                Section("Apple Health") {
                    Text("Die Bridge liest nur Lauftrainings, für die du HealthKit-Zugriff freigibst. Es werden keine Daten in Apple Health geschrieben.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)

                    Button {
                        Task { await sync.syncLastSixMonths() }
                    } label: {
                        Label("Läufe synchronisieren", systemImage: "heart.text.square")
                    }
                    .disabled(sync.isBusy || !sync.isSignedIn)

                    if sync.lastImported > 0 {
                        LabeledContent("Letzter Import", value: "\(sync.lastImported) Workouts")
                    }
                }

                Section("Status") {
                    if sync.isBusy {
                        ProgressView()
                    }
                    Text(sync.status)
                }
            }
            .navigationTitle("RepPilot Health")
        }
    }
}
