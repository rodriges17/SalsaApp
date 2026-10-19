# PWA – Build- und Testbericht

Geprüfter Quellcode: `cd9e102c76840da31be6947aa5a56d7a6b1924b4`.
Stand: 19.10.2026.

[Testlauf und Veröffentlichung](https://github.com/rodriges17/SalsaAppIOS/actions/runs/39180954479)

## Ergebnis

**12 Logiktests und 16 Browser-Tests erfolgreich, 0 Fehler.** GitHub Pages wurde erfolgreich veröffentlicht. Die Live-Adresse liefert den Service Worker `2026-10-19-sharing-v2` einschließlich des neuen Paketmoduls.

**App:** https://rodriges17.github.io/SalsaAppIOS/

Browser-Tests liefen auf einem GitHub-macOS-Runner mit Playwright 1.64.1, Chrome in Android-Ansicht und WebKit in iPhone-Ansicht. Acht Szenarien wurden in beiden Browsern ausgeführt:

1. Mehrfachimport mit bestätigten Vorschauen; Player, Geschwindigkeit, Fit/Crop, Schleifen, Videowechsel, manueller Ansichtswechsel, Neustart und Offline-Wiedergabe.
2. Umbenennen und Reihenfolge, abgebrochener Ersatz, Mindestvideozahl, Weiterbearbeiten/Verwerfen und Löschen aller lokalen Kopien.
3. Ungültige Medien dürfen nicht gespeichert werden; ein veralteter Entwurf überschreibt keine parallelen Änderungen und hinterlässt keine neuen Videokopien.
4. Simulierter Quotenfehler beim zweiten Video: keine neue Figur, keine Video-Datensätze und keine übrig gebliebenen Mediendateien.
5. Offline-Neustart und lokale Wiedergabe unabhängig von vorheriger Player-Nutzung.
6. ZIP-Download und Offline-Import: bestätigte Vorschauen, Originalbytes und Metadaten bleiben erhalten, Lernstand wird Neu, Wiederholungsimport mit Abbruch oder ausdrücklicher weiterer Kopie.
7. Export einer Video-Teilmenge, Verwerfen des Imports und fehlerhafte ZIP-Datei lassen die vorhandene Bibliothek unverändert.
8. Vorbereitete ZIP-Datei wird an die simulierte System-Teilen-API übergeben; bei deren Fehler bleibt der Download verfügbar.

Die acht neuen Paket-Logiktests prüfen Originalbytes/Metadaten, Ausschluss von Lernstand/IDs, Auswahl, Wiederholungserkennung, 250-MiB-Grenze, beschädigte ZIPs, Pfadmanipulation, doppelte Einträge, komprimierte Einträge, unbekannte Version, ungültige Metadaten, Abbruch, CRC32-Referenzwert und Dateinamen. Zusätzlich bestanden die vier bisherigen Logiktests sowie Syntaxprüfung und `git diff --check`.

Browser-Bericht, Traces und Screenshots liegen als `pwa-browser-results` im verlinkten Workflow. Die Testvideos sind synthetische H.264-Clips in Hoch- und Querformat. Nutzervideos sind nicht im Repository enthalten.

## Teilen und Importieren

**⋮ → Figur teilen → Videos auswählen → ZIP vorbereiten → ZIP teilen** oder **ZIP speichern**. Gespeicherte ZIP-Dateien in WhatsApp als Dokument anhängen. Empfänger speichern den Anhang in Dateien und wählen in der PWA **Figur importieren**. Jede neue Videodatei braucht eine bestätigte Vorschau; erst Figur speichern erstellt die neue lokale Kopie.

Das Paket enthält ausgewählte Originalvideos, Name, Beschreibung, Tags, Videonamen und Reihenfolge. Kein persönlicher Lernstand. Maximal 250 MiB (UI: 250 MB), 100 Videos. Details zum versionierten Austauschformat stehen in README.md. Native Android- und iOS-App unterstützen dieses Format noch nicht.

## Installation und Aktualisierung

In Safari öffnen → Teilen → **Zum Home-Bildschirm**. Die installierte App über ihr Symbol starten und dort Videos importieren. Vor Offline-Nutzung auf **Offline bereit** warten.

Bei einer bereits installierten PWA die App online öffnen, schließen und erneut öffnen, damit der neue Service Worker die aktualisierte Oberfläche ausliefert. Website-Daten nicht löschen: Darin liegen die lokalen Videos.

## Grenzen

Keine Tests auf physischen iPhones oder Android-Geräten und keine echte WhatsApp-Übertragung. Das System-Teilen wurde im Browser simuliert, Download/Import dagegen vollständig ausgeführt. Die Home-Screen-Installation, große Originalvideos, Speicherquoten, tatsächliche Teilen-Ziele und Stromsparverhalten sind zusätzlich auf Geräten zu prüfen.

Videos liegen separat in Cache Storage, Metadaten und Verweise in IndexedDB. Neue Medien werden vor dem Metadaten-Commit bereitgestellt und bei Fehlern entfernt; bestehende Medien erst nach erfolgreichem Commit gelöscht. Der Service Worker aktualisiert ausschließlich den getrennten App-Cache. Website-Daten löschen entfernt die lokalen Kopien. Eine Speicher-Persistenzanfrage ist möglich, ihre Bewilligung liegt beim Browser.

ZIP-Pakete sind manuelle Kopien einzelner Figuren mit ausgewählten Videos, kein automatisches vollständiges Backup. Der Wiederholungsfingerabdruck ist keine Authentizitätsprüfung. Die App stellt auf iPhones kein Ziel für empfangene Dateien im System-Teilen-Menü bereit; Import erfolgt innerhalb der PWA.

## Korrektur des Import-Buttons

Die feste untere Leiste hatte `pointer-events: none`; nur der ursprüngliche Hinzufügen-Button besaß eine Ausnahme. Nun erhalten alle Buttons der Leiste `pointer-events: auto`. Die Importtests klicken den sichtbaren Button und warten auf den Dateiauswahldialog, statt das versteckte Datei-Input direkt zu befüllen. Auch Wiederholungsimport, fehlerhafte Datei und Offline-Import durchlaufen diesen Weg. Alle 28 Tests des oben verlinkten Laufs sind erfolgreich. Die Version sharing-v2 wurde live bestätigt.
