# Lielais Ābols — Android

Dzīves simulators Manhetenā (New York Nights stilā). Spēle ir HTML/JS, kas iepakota Android lietotnē (WebView).

- Spēles faili: `app/src/main/assets/www/`
- Android kods: `app/src/main/java/lv/ostmala/dinastija/MainActivity.java`
- Būvēšana: `.github/workflows/android.yml` (GitHub Actions)

## Testa APK lejupielāde
1. Repozitorijā atver **Actions** → jaunāko **Android build** palaidienu.
2. Sadaļā **Artifacts** lejupielādē `ostmalas-dinastija-testa-apk` (zip), izarhivē.
3. Pārsūti `app-debug.apk` uz telefonu un instalē (atļauj „instalēt no nezināmiem avotiem”).

## Play veikalam (AAB)
1. Izveido paraksta atslēgu (vienreiz, glabā drošā vietā — bez tās vairs nevarēs atjaunināt lietotni):
   ```
   keytool -genkeypair -v -keystore release.jks -alias ostmala -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 release.jks > release.b64
   ```
2. GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `ANDROID_KEYSTORE_BASE64` — `release.b64` saturs
   - `ANDROID_KEYSTORE_PASSWORD` — atslēgu krātuves parole
   - `ANDROID_KEY_ALIAS` — `ostmala`
   - `ANDROID_KEY_PASSWORD` — atslēgas parole
3. Palaid būvējumu vēlreiz (Actions → Android build → Run workflow). Artefaktā `ostmalas-dinastija-play-veikalam` būs `app-release.aab` — to augšupielādē Google Play Console.

Versijas numurs pieaug automātiski ar katru būvējumu. Target SDK 36 (Play prasība no 2026. gada 31. augusta).
