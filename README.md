# RepPilot v11.8.123

## Läuferstabi, Ski und Home

- Alle 8 Läuferstabi- und 10 Ski-Übungen zeigen Bilder in Übersicht und laufender Routine.
- 15 neue hochauflösende Motive im bisherigen Anatomie-Stil, native 1254 × 1254 Pixel.
- Übungs-Icons entfernt. Reihenfolge: Übungsname, Bild, Umfang und Anleitung.
- Alle drei Home-Übungsübersichten zeigen zusätzlich die schon vorhandenen Bilder.
- Prüfung umfasst nun 60 unterschiedliche Übungsnamen und 58 lokale Motive, einschließlich Home, Läuferstabi und Ski.
- Neue Motive, Herkunft und Prüfsummen: `training-image-manifest.json`. Prompts: `docs/training-images-v11.8.122-prompts.json`.
- Zusätzliche Regressionstests: `node training-images-test.js` sowie vollständige Routinen im Browser-Test.


Das Emoji-Icon neben dem Namen der aktuellen Übung ist entfernt. Die Überschrift steht allein über dem Bild. RepPilot-Logo und vorhandene hochauflösende Übungsbilder bleiben unverändert.

## Übungsillustrationen

- 44 Kraftübungen, 43 unterschiedliche Motive einschließlich Home-/Studio-Wadenheben.
- Native 1254 × 1254 Pixel, verlustfrei als WebP eingebunden; kein Hochskalieren von Vorschaubildern.
- 19 wiedergefundene Originalmotive und 24 Ergänzungen im gleichen anatomischen Stil.
- Bauch Rotation: kniend auf rotierendem Kniepolster, Hüfte/Becken drehen bei gestütztem Oberkörper.
- Pro Übung genau eine sichtbare Überschrift. Bei Originalen wird nur der beschriftete untere Rand im Bildfenster ausgeblendet; die Bilddateien bleiben unverändert in voller Auflösung.
- Versionsgebundene URLs und Offline-Cache für sämtliche Bilder; Trainingsdaten und Anmeldung bleiben unverändert.

Zuordnungen und Bildausschnitte: `exercise-image-spec.json`. Herkunft und Datei-Prüfsummen: `exercise-image-manifest.json`.

Prüfen: `node smoke-test.js`, `node exercise-images-test.js`, `node pwa-reliability-test.js`. Der GitHub-Workflow führt zusätzlich die bestehenden Browser- und Live-Deployment-Tests aus.
