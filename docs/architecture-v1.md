# RepPilot: Erweiterbare Architektur (v1)

## Ziel

Neue Ideen ergänzen, ohne den Trainingskern bei jedem Release neu zu schreiben.

## Ab sofort

- `exercise-catalog.js`: stabile Übungs-IDs, Muskelgruppen, Geräteklassen, Suche und Bildauflösung.
- `custom-plan-store.js`: versionierte, pro Benutzer getrennte Planentwürfe. Pro Plan sind bis zu 7 Trainingstage und 30 Übungen je Tag möglich.
- `architecture-test.js`: Tests für die komplette vorhandene Übungsauswahl, korrekte Bilder, Validierung, Planänderungen, Kontotrennung und Schutz beschädigter Daten.
- Bestehende Trainingspläne, Trainingsverläufe, Cloud-Tabellen und Bildschirmnavigation bleiben unverändert.
- Eigene Pläne sind aktuell **noch kein sichtbares Feature**. Sie werden weder automatisch aktiviert noch mit der Cloud synchronisiert.

## Regeln für neue Funktionen

1. Neue Übungen erhalten eine eigene, dauerhafte ID im Übungskatalog. Niemals IDs aus veränderlichen Anzeigenamen ableiten.
2. Bildpfade über `RepPilotExerciseCatalog.imageFor(id, context)` auflösen, nicht in weiteren Komponenten duplizieren.
3. Neue Plan-UI auf `RepPilotCustomPlans` aufbauen. Den bestehenden `WORKOUTS`-Kern erst nach vollständigem E2E-Test integrieren.
4. Schemaänderungen über nachvollziehbare Migrationen umsetzen. Nicht unterstützte oder beschädigte Nutzerdaten niemals überschreiben.
5. Benutzerbezogene Daten nach Nutzerkennung trennen. Cloud-Synchronisierung als eigener Adapter, nicht als versteckte Nebenwirkung.
6. Free/Pro-Berechtigungen später serverseitig durchsetzen, nicht über eine reine JavaScript-Sperre.
7. Jeder Release erhöht App-, Manifest-, Service-Worker- und Testversion konsistent. PWA-Installierbarkeit, Icons, Navigation und Offlinebilder testen.

## Geplante Module

- Planeditor: eigene Trainingstage, Übungssuche, Reihenfolge, Satz- und Pausenvorgaben.
- Planprüfung: Satzvolumen, Muskelgruppen und Regeneration als transparente Hinweise.
- Cloud-Adapter: Synchronisierung von Entwürfen pro Konto mit Konfliktbehandlung.
- Native Hülle: Capacitor, iOS und Android, nach Stabilitäts- und Datenschutzprüfung.
- Abonnements: serverseitige Berechtigungen und Store-konforme Abrechnung.

Die folgenden Punkte sind eine Roadmap. Sie sind nicht durch dieses Release umgesetzt.
