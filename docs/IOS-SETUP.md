# Step by Step: iOS vorbereiten und später verteilen

Stand: 22. Oktober 2026. Repository: https://github.com/rodriges17/SalsaAppIOS

## Was bereits ohne Apple-Konto funktioniert

Das Repo enthält eine native SwiftUI/UIKit/AVFoundation-App für iPhone ab iOS 17,
einschließlich Videos, privater Offline-Bibliothek, Importvorschau, Lernplayer und
Teilen-Erweiterung. Wir verwenden diese vorhandene Implementierung weiter;
Capacitor ist dafür nicht erforderlich.

GitHub Actions generiert das Xcode-Projekt mit XcodeGen, baut App und Erweiterung,
führt Unit- und iPhone-Simulator-UI-Tests aus und erstellt:

| Artefakt | Zweck |
| --- | --- |
| `StepByStep-iOS-Simulator` | App für einen kompatiblen iOS-Simulator auf einem Mac |
| `SalsaTrainer-unsigned-device-archive` | Gerätearchiv als Vorbereitung auf Apple-Signierung |
| `ios-test-results` | Build-/Testprotokolle und `.xcresult` mit UI-Screenshots |
| `SalsaTrainer-Xcode-source` | Generiertes Xcode-Projekt mit Quellen |

Artefakte werden sieben Tage gespeichert. Simulator-App und unsigniertes Archiv
sind **nicht auf einem iPhone installierbar**. Der tatsächlich grüne Actions-Lauf
ist der Nachweis für den jeweiligen Build, nicht allein das Vorhandensein der YAML-Datei.

## Cloud-Build-Anbieter und Kosten

USD-Listenpreise, geprüft am 22.10.2026; lokale Steuern/Preise können abweichen.

| Anbieter | Einstieg | Bezahlte Nutzung | Einschätzung für dieses Repo |
| --- | --- | --- | --- |
| GitHub Actions | Standard-Runner für öffentliche Repos kostenlos | Private Repos: Plan-Kontingent, danach Standard-macOS 0,062 USD/Minute; größere Runner separat | Empfehlung: Repo ist öffentlich, bestehender Workflow, kein weiterer Anbieter nötig |
| Codemagic | Einzelpersonen: 500 macOS-M2-Minuten/Monat kostenlos | M2 0,095 USD/Minute, M4 0,114 USD/Minute; Team-Pay-as-you-go hat eigene Tarifbedingungen | Gute Alternative mit mobiler Signierungsverwaltung |
| Xcode Cloud | 25 Rechenstunden/Monat in der Apple-Developer-Mitgliedschaft enthalten | 100 Stunden 49,99 USD/Monat, 250 Stunden 99,99 USD/Monat | Apple-Integration; Ersteinrichtung setzt Xcode und Mitgliedschaft voraus |
| Bitrise | Hobby kostenlos, kleines Build-Kontingent | Starter ab 99 USD/Monat oder 89 USD/Monat bei jährlicher Abrechnung | Für unseren Einstieg kostenpflichtig nicht erforderlich |

Beispiel für zusätzlich berechnete 200 macOS-Minuten: GitHub 12,40 USD, Codemagic
M2 19 USD. Das sind Rechenbeispiele; bei diesem öffentlichen Repo bzw. innerhalb
des Codemagic-Einzelpersonen-Kontingents fällt dieser Minutenpreis nicht an.

Die Apple-Developer-Mitgliedschaft (99 USD/Jahr bzw. lokaler Preis) kommt für
TestFlight/App Store unabhängig vom Build-Anbieter hinzu. Ein Cloud-Build ersetzt
keine Apple-Signierung. Es wurde kein kostenpflichtiger Dienst gebucht.

Quellen:
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/billing/reference/actions-runner-pricing
- https://codemagic.io/pricing/
- https://developer.apple.com/xcode-cloud/
- https://developer.apple.com/xcode-cloud/get-started/
- https://bitrise.io/pricing
- https://developer.apple.com/programs/whats-included/

## Was Patrick später bereitstellen muss

1. Apple Account mit Zwei-Faktor-Authentifizierung und Apple Developer Program.
   Registrierung und Vertragsannahmen erledigt der Kontoinhaber selbst.
2. Ein echtes iPhone für Tests. Ein eigener Mac ist bei GitHub-Cloud-Builds nicht
   erforderlich; für direkte lokale Xcode-Entwicklung wäre er hilfreich.
3. Im Developer Portal zwei explizite App-IDs registrieren:
   `com.rodriges17.SalsaTrainer` und `com.rodriges17.SalsaTrainer.Share`.
   Die IDs sind Vorschläge, erst nach erfolgreicher Registrierung verbindlich.
4. App Group `group.com.rodriges17.SalsaTrainer` registrieren und beiden IDs zuweisen.
   Bei geänderten IDs `ios/project.yml`, `scripts/prepare-signing.py` und die Gruppe
   gemeinsam anpassen. Bestehende Bibliotheken nicht durch einen Gruppenwechsel verlieren.
5. Ein Apple-Distribution-Zertifikat samt privatem Schlüssel als passwortgeschützte
   PKCS#12-Datei und zwei App-Store-Connect-Provisioning-Profile erzeugen. Beide Profile
   müssen dieselbe Team-ID, die passende App-ID und die App Group enthalten und
   zum Distribution-Zertifikat passen. Bei Bedarf können Schlüssel und CSR später
   in einer geschützten Cloud-Umgebung erzeugt werden; keine Zugangsdaten im Chat senden.
6. In App Store Connect einen App-Eintrag für die Haupt-App erstellen, deutsche
   Testinformationen und Kontaktadresse ergänzen. Für Uploads einen API-Key mit
   geeigneter Rolle (z.B. App Manager) einrichten.

### GitHub-Konfiguration für den vorbereiteten Release-Workflow

Repository → Settings → Secrets and variables → Actions:

| Typ | Name | Inhalt |
| --- | --- | --- |
| Variable | `IOS_TEAM_ID` | Apple-Team-ID, zehn Zeichen |
| Secret | `IOS_DISTRIBUTION_P12_BASE64` | Base64 der Distribution-PKCS#12-Datei |
| Secret | `IOS_DISTRIBUTION_P12_PASSWORD` | Passwort dieser Datei |
| Secret | `IOS_APP_PROFILE_BASE64` | Base64 des Haupt-App-Profils |
| Secret | `IOS_SHARE_PROFILE_BASE64` | Base64 des Erweiterungsprofils |
| Variable | `APPSTORE_ISSUER_ID` | Issuer ID des App-Store-Connect-Team-API-Keys |
| Variable | `APPSTORE_API_KEY_ID` | Key ID |
| Secret | `APPSTORE_API_PRIVATE_KEY` | Vollständiger privater `.p8`-Schlüssel, kein Base64 |

Die letzten drei Einträge werden nur für den Upload benötigt. Zertifikate,
Schlüssel und Profile gehören niemals in Git, öffentliche Artefakte oder Logs.
Der Workflow bereitet die Signierung in einem temporären Schlüsselbund vor,
prüft beide Profile auf Team, exakte App-ID, Ablaufdatum, App Group und
App-Store-Verteilung und räumt die privaten Dateien auch bei Fehlern wieder auf.
Xcode prüft anschließend die tatsächliche Signatur und Zertifikat-/Profilzuordnung.
Bei fehlender Konfiguration bricht der Workflow ab, ohne Ersatzidentität anzulegen.

### Ablauf nach Einrichtung

1. Der normale Workflow **iOS build and tests** muss für den gewünschten Commit grün sein.
2. Actions → **iOS signed build and optional TestFlight upload** → Run workflow auf
   `main`. Standardmäßig bleibt **upload_to_testflight** aus: Es wird nur eine
   signierte App-Store-IPA gebaut, noch nichts an Apple hochgeladen.
3. Erst nach Hardware-/Freigabeprüfung den Upload ausdrücklich aktivieren.
   Der Upload macht die App nicht automatisch im App Store öffentlich. Verarbeitung,
   TestFlight-Testgruppen und gegebenenfalls Apples Beta-Prüfung folgen in App Store Connect.
4. Installieren über die TestFlight-App. Ein App-Store-IPA-Download lässt sich nicht
   wie eine Android-APK direkt installieren. TestFlight-Builds gelten höchstens 90 Tage.

Der signierte Gerätebuild/Export und Upload sind bis zur Einrichtung echter
Apple-Zugangsdaten **vorbereitet, aber nicht end-to-end verifiziert**. Weder Apple-Konto,
Bundle-IDs noch Signierungsprofile sind bislang für dieses Projekt eingerichtet.

## Vor einem echten TestFlight-Release noch prüfen

- Import aus Fotos, Dateien und iCloud Drive sowie Empfang in der Teilen-Erweiterung.
- Große Videos, Speicherplatzfehler, Hintergrund/Neustart und Bibliotheksdaten beim Update.
- Wiedergabegeschwindigkeiten, A–B, Fit/Crop und manuelle Ausrichtung auf echtem iPhone.
- App-Group-Signierung auf Gerät, Datenschutzangaben und App-Store-Metadaten.
- Funktionsabgleich mit SalsaAppCloud: Die bestehende Swift-App hat noch keine
  Cloud-Bibliothek, kein gemeinsames ZIP-/Backup-Format und keine direkt angebundene
  Geräteordner-Bibliothek. Auch das UI ist bisher nur in Name, Farben und Logo angeglichen.
  Diese Punkte benötigen eigene Implementierung und Gerätetests; der Simulator-Build
  ist kein Nachweis vollständiger PWA-Parität.

Die vorhandene `pwa/` in diesem Repo bleibt als ältere, eigenständige PWA erhalten.
Aktuelle Web-Entwicklung erfolgt in https://github.com/rodriges17/SalsaAppCloud.
