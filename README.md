# Salsa Trainer für iPhone

Native, private Offline-App für eigene Salsa-Videos. SwiftUI / UIKit / AVFoundation, iPhone mit **iOS 17 oder neuer**. Kein Server, Login, Tracking oder Cloud-Backup. Videos und Metadaten bleiben im lokalen App-Group-Speicher; der Bibliotheksordner wird vom Gerätebackup ausgeschlossen. Deinstallation beider Komponenten löscht die Daten.

## Funktionen

- Übersicht im ursprünglichen dunklen Design: Vorschau, Dauer, Videoanzahl, Suche, Lernstände „Neu / Am Üben / Sitzt“, Tags und Sortierung.
- Neue Figuren und Bearbeiten/Löschen über das Kontextmenü (lange auf eine Figur drücken).
- Titel, Beschreibung, Lernstand und Tags; mehrere Videos pro Figur mit Namen, Reihenfolge, Ersetzen und Entfernen. Mindestens ein Video bleibt erforderlich.
- Import aus Fotos oder Dateien; vor Übernahme jedes neue Video abspielen/prüfen und bestätigen. Eine temporäre Stagingkopie ist für iOS-Dateifreigaben notwendig. Erst „Figur speichern“ erzeugt dauerhafte private Kopien. Originaldateien werden nicht verändert.
- Erstes Video liefert Vorschaubild und Dauer. Videos können in beliebiger Reihenfolge bestätigt werden; „Alle neuen Videos prüfen“ führt durch die noch offenen Vorschauen.
- Zurück oben links; Warnung bei ungespeicherten Änderungen. Speichern sperrt die Bedienung während der Kopie. Fehlgeschlagene Importe rollen alle neuen Dateien zurück. Gleichzeitige Änderungen aus App und Erweiterung werden erkannt.
- Lernplayer startet im Hochformat; manueller Hoch-/Querformatwechsel, Fit/Crop ohne Verzerrung, Videowahl, 0,25×/0,5×/0,75×/1×, −5 Sekunden, Gesamtloop und A–B-Loop (gegenseitig ausschließend). Videowechsel löscht A/B und beginnt bei 0, die übrigen Einstellungen bleiben bestehen. Hintergrund pausiert; Bildschirm bleibt während Wiedergabe an.
- Teilen aus Fotos/Dateien → „Salsa Trainer“: neue oder bestehende Figur wählen, Videos prüfen und speichern. Der Import läuft im iOS-Teilen-Fenster; danach kehrt iOS zur Quell-App zurück. Die Haupt-App aktualisiert ihre Übersicht beim Öffnen. Die Erweiterung öffnet nicht eigenmächtig die Haupt-App.

## Build ohne eigenen Mac

Unter **Actions → iOS build and tests** läuft der Build auf einem GitHub-macOS-Runner. Der Workflow generiert das Xcode-Projekt, führt Unit-/UI-Tests aus und archiviert App und Teilen-Erweiterung für echte iPhones ohne Signierung. Die Artefakte enthalten Testprotokolle, `.xcresult`, Xcode-Quellprojekt und ein **unsigniertes `.xcarchive`**.

**Das Archiv ist noch nicht auf einem iPhone installierbar. Es ist keine installierbare IPA und kein TestFlight-Link.** Für die Installation muss ein Apple-Entwicklerkonto mit gültigen Signierungsprofilen eingerichtet werden. Für TestFlight ist eine Apple-Developer-Program-Mitgliedschaft nötig. GitHub kann die Apple-Signierung nicht ersetzen. macOS-Runner eines privaten Repositories können GitHub-Actions-Kontingent verbrauchen.

## Lokal auf einem Mac

```sh
brew install xcodegen
cd ios
xcodegen generate
open SalsaTrainer.xcodeproj
```

In Xcode für **SalsaTrainer und SalsaShare** dasselbe Entwicklerteam setzen. Bundle-IDs bei Bedarf eindeutig anpassen. App Group `group.com.rodriges17.SalsaTrainer` für beide Targets beim Apple-Konto registrieren und in beiden Signierungsprofilen aktivieren. Bei geänderter Gruppe zusätzlich `APP_GROUP` im Projekt und `AppGroupIdentifier` in beiden Info-Plists anpassen. Kein Fallback auf getrennte Speicherorte: fehlende App-Group-Berechtigung erzeugt eine sichtbare Fehlermeldung.

Für ein TestFlight-Release das vorhandene App-Icon prüfen, Release auf einem echten Gerät prüfen und in Xcode **Product → Archive → Distribute App → App Store Connect** verwenden. Zertifikate, private Schlüssel und Provisioning-Profile gehören nicht ins Repository. Es ist noch kein Apple-Konto und keine Signierungsidentität mit diesem Projekt verbunden.

## Tests und Grenzen

`LibraryTests`: Byte-identische Kopie, unveränderte Originale, Bestätigungspflicht, Rollback bei zweitem Video, Umbenennen/Reihenfolge/Entfernen, Konflikterkennung, fehlende Quelle, Mindestvideozahl/fremde Dateien, Löschen, Pfadprüfung, Loopgrenzen echtes AVFoundation-Video sowie Videowechsel mit Beibehaltung der Lerneinstellungen und Pausieren während eines Sprungs. `NavigationTests`: Übersicht, Editor, Speichersperre ohne Video Verwerfen-Dialog sowie Multi-Video-Player, Fit/Crop und manueller Hoch-/Querformatwechsel mit synthetischen Videos.

Der tatsächliche CI-Status steht unter Actions; nur ein grüner Lauf bestätigt Build und Tests. Hardware-Tests (insbesondere echte Fotos-/Dateien-Freigabe, große Videos, Geräteausrichtung, A–B-Wiedergabe und App-Group-Signierung) bleiben vor TestFlight erforderlich. Android-Daten werden nicht automatisch auf iOS übertragen.
