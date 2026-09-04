# Bildquellen v11.8.120

Die 19 aktiven Originalmotive stammen aus dem wiedergefundenen Paket `RepPilot-Uebungsbilder-2026-09-04.zip`. Die 24 Ergänzungen gehören zum gleichen anatomischen Stil. Die provisorische sitzende Bauchrotation wurde nach der Klarstellung des Nutzers durch eine kniende Rotationsmaschine ersetzt.

Die App-Dateien sind native 1254 × 1254 Pixel. PNG → WebP wurde mit ImageMagick `webp:lossless=true` ohne Skalierung durchgeführt. `compare -metric AE` ergab für jede Datei 0 abweichende Pixel. Prüfsummen und Herkunft stehen im Manifest. Eingebrannte Titel werden ausschließlich durch das CSS-Bildfenster verdeckt. Originaldateien werden nicht beschnitten oder hochskaliert.

## Korrigierte Bauchrotation

Bestätigung: kniend, Hüfte bzw. Becken drehen. Generiert am 2026-09-04 anhand der originalen Brustpresse als Stilreferenz. Verwendeter Prompt:

Use case: scientific-educational. Create one high-resolution square exercise illustration for RepPilot. Supplied image is a STYLE REFERENCE ONLY, not the exercise to reproduce. Match exactly this original series: realistic grayscale anatomical male with short dark hair, finely shaded striated muscles, black training shorts, gray shoes, silver gym equipment and black pads, white background, coral-red oblique muscle highlights. No title, no labels, no text, no logos. Show TWO side-by-side full-body start/end positions on a KNEELING ROTARY TORSO MACHINE. USER CLARIFICATION: the athlete KNEELS and rotates HIPS/PELVIS, not sitting with feet planted. Both knees and shins rest visibly on a padded knee cradle rotating about a VERTICAL axis. Thighs nearly vertical, hips over knees, feet behind the shins, neither foot stands on the floor. Chest supported against a FIXED upright torso pad at chest height, both hands hold FIXED handles in front, upper torso and shoulders remain pointing forward throughout. LEFT pose knee platform, pelvis and thighs centered facing forward. RIGHT pose padded knee cradle and BOTH knees and pelvis have rotated together roughly 30 degrees to one side about vertical axis, while chest, shoulders, hands and upper apparatus stay fixed facing forward. Same front three-quarter camera in both images, visibly show the rotated knees/pelvis instead of changing the camera. Clear padded knee platform and pivot column underneath, mechanically plausible weight stack linkage. No chair seat under buttocks, no seated posture, no waist bending or crunching, no jump, no extreme twist. Highlight lateral abdominal obliques coral-red, others grayscale. Large complete figures, no cropped knees/feet or machine. Preserve the polished detailed original anatomy style.

## Prüfen

`node smoke-test.js` enthält die fokussierten Bildtests. `node pwa-reliability-test.js` prüft Einbindung und Versionierung. `node live-deployment-test.mjs` verifiziert ausgelieferte Dateien einschließlich aller 43 Bild-Prüfsummen und nativen Abmessungen. Die bestehende GitHub-CI führt außerdem `browser-e2e-test.mjs` aus.
