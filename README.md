# Step by Step – native iPhone-App

Die iOS-Vorbereitung läuft in **https://github.com/rodriges17/SalsaAppIOS**.
Die vorhandene native Swift-App wird weiterverwendet. Name und Tanzpaar-Logo
entsprechen jetzt Step by Step. Der kostenlose GitHub-macOS-Workflow baut und
testet ohne Apple-Konto im Simulator und liefert zusätzlich ein unsigniertes
Gerätearchiv. Ein eigener Mac ist dafür nicht nötig.

**[Aktuelle Einrichtung, Cloud-Anbieter/Kosten und TestFlight-Vorbereitung](docs/IOS-SETUP.md)**

Der separate manuelle Workflow `ios-testflight.yml` ist für spätere echte
Signierungsdaten vorbereitet. Er läuft nicht automatisch und lädt standardmäßig
nichts hoch. Ohne Apple-Developer-Mitgliedschaft und Signierung gibt es noch
keine auf einem iPhone installierbare Version. Die native Swift-App hat noch
nicht den vollständigen Funktionsumfang der aktuellen SalsaAppCloud-PWA;
die offenen Punkte sind im Einrichtungsdokument benannt.

Die folgenden Abschnitte beschreiben die lokale PWA und die native iOS-Basis.
Die Variante mit Cloud-Speicher wird in **SalsaAppCloud** entwickelt.

## Lokale PWA: aktueller Stand ohne Cloud-Speicher

Adresse: **https://rodriges17.github.io/SalsaAppIOS/**

Die PWA enthält die lokalen Funktionen der aktuellen SalsaAppCloud-Version:
Figuren und mehrere Videos, Importvorschau, Suche/Tags/Lernstände, Sortierung,
Lernplayer mit Geschwindigkeit, Fit/Crop, Hoch-/Queransicht, Gesamt-/A–B-Loop,
ZIP-Austausch und vollständige Backups einschließlich Lernständen. In geeigneten
Browsern können verwaltete Geräteordner verbunden und Figuren zwischen App-Speicher
und Ordner übertragen werden. Videos werden beim Lernen erst bei Bedarf geladen.

UI: Step-by-Step-Logo im Titel und Figuren-Tab, Hell/Dunkel, feststehender Header
mit „Deine Schritte. Dein Tempo.“ unter dem Titel, fixierte Suche und Filter,
kompakte Navigation am unteren Rand, vollständig erreichbares Menü der letzten
Figur, Zoom-Sperre und Speicherort-bezogener Löschhinweis. Cloud-Navigation,
Anmeldung, Bibliotheken, Upload/Download und Backend-Konfiguration sind nicht enthalten.
Die CSP erlaubt ausschließlich lokale App-Ressourcen und lokale Medien.

Nach dem ersten Laden funktioniert die App offline. Auf iPhone/iPad über Safari
→ Teilen → Zum Home-Bildschirm installieren. Frei wählbare Geräteordner hängen von
Browserunterstützung und erteilten Berechtigungen ab; Chrome auf Android kann nach
Sitzungsende erneut eine Freigabe verlangen. Interner Speicher und ausgewählte
Geräteordner sind getrennte Speicherorte. Original-Importdateien bleiben erhalten.

Vorhandene lokale Figuren bleiben im bisherigen IndexedDB-/Mediencache-Namensraum;
App-ID, URL und Scope bleiben gleich. Updates aktualisieren nur App-Dateien. Bei
verfügbarer neuer Version **Update laden** wählen. Website-Daten löschen entfernt
intern gespeicherte Figuren; regelmäßige vollständige Backups schützen die Daten.

`npm test` prüft lokale Logik, Ordner, Austauschformat und Backup-Transaktionen.
`npm run test:browser` prüft Chrome und WebKit, einschließlich Offline-Update mit
bestehenden Medien, Geräteordner, Backup/Restore, Touch-Import, Zoom und UI.
GitHub Actions veröffentlicht nach bestandenen Tests und prüft die Live-Seite.

Abgleich am 23.10.2026 mit SalsaAppCloud `3e810d144187b56c4d1439cfceab031d65e4d756`:
Die lokalen Speicher-, Ordner-, Player-, ZIP- und Backup-Module sind übernommen.
Prüfsummen werden schneller berechnet; bereits geprüfte unveränderte Ordnervideos
werden beim Speichern von Metadaten nicht vollständig erneut gelesen. Externe
Änderungen werden weiterhin erkannt. Während des Speicherns erscheinen sofort
„Figur inkl. Video(s) werden gespeichert...“ und ein Fortschrittsindikator.
Zurück-Pfeile sind einheitlich ausgerichtet; kompakte feste Zeilen lassen auch im
Querformat Platz für die Figuren. Die überflüssige Offline-Zeile ist aus der
Übersicht entfernt; Offline-Informationen stehen in den Einstellungen.
Cloud-Cache, Anmeldung und Cloud-Bibliotheken gehören ausschließlich zur Cloud-Variante.

---

## Native Swift-App für iPhone

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

## Figuren zwischen PWAs teilen

In der Figurenübersicht **⋮ → Figur teilen** wählen. Alle Videos sind zunächst ausgewählt; einzelne können abgewählt werden. **ZIP vorbereiten** erstellt ein Paket mit unveränderten Originalvideos, Name, Beschreibung, Tags, Videonamen und Reihenfolge. Persönlicher Lernstand und interne IDs werden nicht übertragen. Maximal 250 MiB (in der Oberfläche „250 MB“), 100 Videos.

Danach **ZIP teilen** wählen, wenn das Gerät Datei-Teilen unterstützt. WhatsApp wird im Systemdialog gewählt. Alternativ **ZIP speichern** und in WhatsApp als **Dokument** anhängen. Die App lädt dabei keine Videos auf einen eigenen Server hoch.

Empfänger speichern den Anhang in „Dateien“, öffnen die PWA und wählen **Figur importieren**. Alle neuen Videos müssen in der Vorschau bestätigt werden. Erst **Figur speichern** legt eine neue lokale Figur an, mit Lernstand **Neu**. Vorhandene Figuren werden nicht überschrieben. Bei einem wiedererkannten Paket fragt die App nach, ob eine weitere Kopie angelegt werden soll. Ein Abbruch legt keine dauerhaften Videos an.

Der ZIP-Austausch funktioniert zwischen den PWAs und der aktuellen Android-App. Die native Swift-iOS-App unterstützt das Format noch nicht. Direktes Teilen und die Zuverlässigkeit großer Pakete müssen zusätzlich auf echten Smartphones geprüft werden.

### Austauschformat v1

Standard-ZIP, Methode STORE (keine Komprimierung), UTF-8-Dateinamen, ohne ZIP64, Verschlüsselung, Kommentare, Extra-Felder oder Data Descriptors. Enthalten sind `figure.json` und `videos/1.mp4` usw. `figure.json` enthält `format: "salsa-figure"`, `version: 1`, `title`, `description`, `tags` und `videos: [{path, name, type, size}]`. Unterstützte MIME-Typen: MP4, QuickTime, M4V, WebM, Ogg. Das jeweilige Gerät muss das Video zusätzlich abspielen können.

Der Import prüft Größe, Struktur, Pfade, Anzahl, CRC32-Prüfsummen und Schema vor dem Öffnen des Entwurfs. Fremde oder nachträglich neu komprimierte ZIP-Dateien werden abgewiesen. Der Wiederholungshinweis verwendet SHA-256 über normalisierte Metadaten, Größen und CRC32; er ist keine Authentizitätsprüfung. Der Fingerabdruck wird zusammen mit der Figur gespeichert und beim Bearbeiten erhalten.


ZIP-Speichern (23.10.2026): Ein eigener Button startet den Speicherort-Dialog,
wenn der Browser ihn unterstützt; sonst wird der Browser-Download unmittelbar
im Tippen ausgelöst. Status und Spinner zeigen ZIP-Erstellung und Dateiübergabe.
Fehler und Abbruch lassen die vorbereitete ZIP zum Wiederholen erhalten.
„Download angefordert“ bestätigt die Übergabe an den Browser, nicht dessen
Speicherabschluss. Die native Android-App übergibt Dateien in begrenzten Blöcken an den nativen
Speichern-/Teilen-Dialog. Lernstände bleiben vom Figur-ZIP ausgeschlossen.

### Figur-ZIP und Dateiübergabe

`pwa/figure-zip.js` bündelt Videoauswahl, ZIP-Erstellung, Abbruch, vorbereitetes Archiv und Wiederholung. Die Oberfläche liest Zustände und löst Aktionen aus; sie verwaltet keine zweite Kopie des Exportzustands. Änderungen der Auswahl verwerfen das vorbereitete Archiv. Schließen bricht die Erstellung ab; während der Dateiübergabe bleibt der Dialog offen.

`pwa/file-delivery.js` führt Speichern und Teilen aus, verhindert parallele Übergaben und hält Status sowie Fehler für einen erneuten Versuch bereit. Der Picker beziehungsweise die native Übergabe startet synchron im ursprünglichen Klick. Browser-Downloads werden als angefordert gemeldet; nur ein erfolgreich geschriebener Picker-Stream wird als gespeichert bestätigt. Der Download-Link bleibt im aktiven Dialog und seine URL lange genug zum Einlesen erhalten.

Das vollständige Backup behält `backup-workflow.js` und sein eigenes Archivformat einschließlich Lernständen. Nur die Übergabe fertiger Sicherungsteile verwendet dasselbe Datei-Modul. Android verwendet einen gemeinsamen Adapter mit kleinen Blöcken und Abbruchsignal, auch für die älteren nativen Ansichten.

Verhaltenstests liegen in `web-tests/figure-zip.test.js`; Browserprüfungen schützen zusätzlich echte Downloads, Picker-Aktivierung und Wiederholungen. Archivtests prüfen unveränderte Videodaten sowie die getrennte Behandlung persönlicher Lernstände.
