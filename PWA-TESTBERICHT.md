# PWA – Build- und Testbericht

Geprüfter Quellcode: `d8439b5740df038fec7ebaecbbebf5e83e120d9c`.

[Testlauf und Veröffentlichungsstatus](https://github.com/rodriges17/SalsaApp/actions/runs/39165957892)

## Ergebnis

**4 Logiktests und 10 Browser-Tests erfolgreich, 0 Fehler.** Browser-Tests liefen auf einem GitHub-macOS-Runner mit Playwright 1.64.1, Chrome/Android-Ansicht und WebKit/iPhone-Ansicht. Die fünf Szenarien wurden in beiden Browsern ausgeführt:

1. Mehrfachimport mit bestätigten Vorschauen; Player, Geschwindigkeit, Fit/Crop, Schleifen, Videowechsel, manueller Ansichtswechsel, Neustart und Offline-Wiedergabe.
2. Umbenennen und Reihenfolge, abgebrochener Ersatz, Mindestvideozahl, Weiterbearbeiten/Verwerfen und Löschen aller lokalen Kopien.
3. Ungültige Medien dürfen nicht gespeichert werden; ein veralteter Entwurf überschreibt keine parallelen Änderungen und hinterlässt keine neuen Videokopien.
4. Simulierter Quotenfehler beim zweiten Video: keine neue Figur, keine Video-Datensätze und keine übrig gebliebenen Mediendateien.
5. Offline-Neustart und lokale Wiedergabe unabhängig von vorheriger Player-Nutzung.

Screenshots von Übersicht und gedrehter Player-Ansicht wurden visuell geprüft. Die Testvideos sind synthetische H.264-Clips in Hoch- und Querformat. Nutzervideos werden nicht hochgeladen und sind nicht im Repository enthalten.

[Browser-Ergebnisse und Screenshots](https://github.com/rodriges17/SalsaApp/actions/runs/39165957892/artifacts/12150597453)

## Veröffentlichung: ein Repository-Schritt fehlt

Das Pages-Paket wurde erfolgreich erzeugt. Die erstmalige Aktivierung wurde von GitHub abgelehnt:

> Create Pages site failed: Resource not accessible by integration

Der Workflow hat Pages-Schreibrechte, aber keine Berechtigung zur initialen Administration. Die GitHub-Anbindung bietet diesen Einstellungsbefehl nicht an; der zusätzliche Browserzugriff ist mit einer Zeitüberschreitung abgebrochen. Es ist noch keine live erreichbare PWA bestätigt.

Im [Repository](https://github.com/rodriges17/SalsaApp) **Settings → Pages → Build and deployment → Source → GitHub Actions** wählen. Danach im oben verlinkten Workflow-Lauf **Re-run jobs → Re-run failed jobs** ausführen. Solange das Pages-Artefakt vorhanden ist, wird nur der fehlgeschlagene Veröffentlichungsschritt wiederholt; die bereits erfolgreichen Tests müssen dafür nicht neu laufen. Das Pages-Artefakt dieses Laufs läuft am 19.10.2026 um 21:03 UTC ab. Danach den kompletten Workflow über „Run workflow“ neu starten.

Nach erfolgreicher Veröffentlichung lautet die erwartete Adresse:

https://rodriges17.github.io/SalsaApp/

## Installation auf dem iPhone

Die veröffentlichte Adresse in Safari öffnen → Teilen → **Zum Home-Bildschirm** → als Web-App öffnen. Die installierte App über ihr Symbol starten und dort Videos importieren. Vor Offline-Nutzung auf **„Offline bereit“** warten.

## Grenzen

Kein Test auf einem physischen iPhone oder Android-Gerät. Die echte Home-Screen-Installation, große Originalvideos, Speicherquoten und Stromsparverhalten sind zusätzlich auf dem Gerät zu prüfen. Der Formatknopf dreht die Ansicht; eine systemweite Ausrichtungssperre ist im iPhone-Browser nicht zuverlässig verfügbar. Empfang aus dem iPhone-Teilen-Menü ist nicht möglich; Import erfolgt innerhalb der App.

Videos liegen separat in Cache Storage, Metadaten und Verweise in IndexedDB. Neue Medien werden vor dem Metadaten-Commit bereitgestellt und bei Fehlern entfernt; bestehende Medien erst nach erfolgreichem Commit gelöscht. Der Service Worker aktualisiert ausschließlich den getrennten App-Cache. Website-Daten löschen entfernt die lokalen Kopien. Eine Speicher-Persistenzanfrage ist möglich, ihre Bewilligung liegt beim Browser. Originaldateien bleiben unverändert; es gibt kein Backup.
