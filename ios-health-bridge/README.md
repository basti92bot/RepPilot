# RepPilot HealthKit Bridge

Kleine native iPhone-App, die Lauftrainings aus Apple Health/HealthKit liest und in RepPilot synchronisiert.

## Architektur

Apple Watch / Fitness → HealthKit → RepPilot Health Bridge → Supabase Edge Function `healthkit-import` → `apple_workouts` → RepPilot Web-App.

Die Bridge ist **read-only für HealthKit**. Sie schreibt keine Daten zurück in Apple Health.

## Xcode-Setup

1. In Xcode ein neues **iOS App**-Projekt mit SwiftUI anlegen, z. B. `RepPilotHealthBridge`.
2. Deployment Target auf iOS 17 oder neuer setzen.
3. Die Swift-Dateien aus diesem Ordner zum App-Target hinzufügen.
4. Unter **Package Dependencies** `https://github.com/supabase/supabase-swift` hinzufügen und das Produkt `Supabase` dem Target zuweisen.
5. Unter **Signing & Capabilities** die Capability **HealthKit** hinzufügen.
6. Die Datei `RepPilotHealthBridge.entitlements` verwenden oder die von Xcode erzeugte HealthKit-Entitlement-Datei beibehalten.
7. In den Target-Infos folgende Privacy Description eintragen:
   - `Privacy - Health Share Usage Description` (`NSHealthShareUsageDescription`): `RepPilot liest deine freigegebenen Lauftrainings, um Distanz, Pace und Trainingsmetriken in RepPilot anzuzeigen.`
8. App auf einem echten iPhone starten. HealthKit funktioniert nicht vollständig im normalen Browser/PWA-Kontext.

## Nutzung

1. Mit demselben E-Mail-/Passwort-Account anmelden, den du in RepPilot verwendest.
2. `Läufe synchronisieren` antippen.
3. HealthKit-Zugriff auf Workouts und gewünschte Laufmetriken erlauben.
4. Die Bridge liest die letzten sechs Monate an Lauftrainings und sendet sie in Batches an die Edge Function.
5. RepPilot Web-App öffnen → Profil → Apple Health → `Aktualisieren`.

## Synchronisierte Felder

- HealthKit Workout UUID (Duplikatschutz)
- Start / Ende / Dauer
- Distanz
- aktive Kalorien
- durchschnittliche und maximale Herzfrequenz
- Schritte und daraus berechnete Kadenz
- Laufgeschwindigkeit
- Running Power
- Schrittlänge
- Bodenkontaktzeit
- vertikale Oszillation
- Quelle / Gerät

Nicht vorhandene oder von HealthKit nicht freigegebene Metriken werden als `null` übertragen.

## Sicherheit

- Die Edge Function verlangt einen gültigen Supabase-JWT.
- `apple_workouts` hat Row Level Security und ist pro `auth.uid()` isoliert.
- Die native App nutzt nur den öffentlichen Supabase Publishable Key; der Service-Role-Key bleibt ausschließlich serverseitig in Supabase.
- Upserts laufen über `(user_id, healthkit_uuid)`, damit derselbe Apple-Workout nicht doppelt angelegt wird.
