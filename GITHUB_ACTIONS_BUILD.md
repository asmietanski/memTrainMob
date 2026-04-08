# Budowanie aplikacji Android za pomocą GitHub Actions

## Dlaczego GitHub Actions?

- ✅ **Darmowe** - GitHub Actions daje 2000 minut/miesiąc za darmo
- ✅ **Bez limitów EAS** - Nie musisz czekać na reset limitu EAS
- ✅ **Automatyczne buildy** - Build uruchamia się przy każdym push do main/master
- ✅ **Archiwa APK** - Każdy build jest zapisywany jako artifact

## Konfiguracja

### 1. Przygotowanie repozytorium

Workflow jest już skonfigurowany w `.github/workflows/build-android.yml`

### 2. Konfiguracja keystore (dla signed APK)

Jeśli chcesz podpisane APK (wymagane do publikacji w Google Play):

1. Wygeneruj keystore lokalnie:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Zakoduj keystore do base64:
```bash
base64 my-release-key.keystore > keystore.base64
```

3. Dodaj secrets w GitHub:
   - Idź do: Settings → Secrets and variables → Actions → New repository secret
   - Dodaj następujące secrets:
     - `KEYSTORE_BASE64` - zawartość pliku keystore.base64
     - `KEYSTORE_PASSWORD` - hasło do keystore
     - `KEY_ALIAS` - alias klucza (np. "my-key-alias")
     - `KEY_PASSWORD` - hasło do klucza

### 3. Uruchomienie buildu

#### Automatycznie:
Build uruchomi się automatycznie przy:
- Push do branch `main` lub `master`
- Pull request do `main` lub `master`

#### Ręcznie:
1. Idź do zakładki "Actions" w repozytorium GitHub
2. Wybierz workflow "Build Android APK"
3. Kliknij "Run workflow"
4. Wybierz branch i kliknij "Run workflow"

## Pobieranie APK

### Z Artifacts (każdy build):
1. Idź do zakładki "Actions"
2. Kliknij na konkretny workflow run
3. Przewiń w dół do sekcji "Artifacts"
4. Pobierz "app-release"

### Z Releases (tylko main/master):
1. Idź do zakładki "Releases"
2. Znajdź najnowszy release
3. Pobierz plik APK z sekcji "Assets"

## Instalacja APK na urządzeniu

### Metoda 1: Bezpośrednia instalacja
1. Pobierz APK na urządzenie Android
2. Otwórz plik APK
3. Zezwól na instalację z nieznanych źródeł (jeśli system poprosi)
4. Zainstaluj aplikację

### Metoda 2: Przez ADB
```bash
adb install app-release.apk
```

## Troubleshooting

### Build fails z błędem "Gradle"
- Sprawdź czy `android/` folder jest w `.gitignore`
- Jeśli tak, usuń go z `.gitignore` lub użyj `expo prebuild` lokalnie i commitnij

### Build fails z błędem "signing"
- Upewnij się, że wszystkie secrets są poprawnie skonfigurowane
- Sprawdź czy keystore jest poprawnie zakodowany w base64

### APK nie instaluje się
- Sprawdź czy wersja Android na urządzeniu jest >= minSdkVersion (21)
- Sprawdź czy masz włączoną instalację z nieznanych źródeł

## Porównanie: EAS vs GitHub Actions

| Feature | EAS Build | GitHub Actions |
|---------|-----------|----------------|
| Koszt | Limit 30 buildów/miesiąc (Free) | 2000 minut/miesiąc (Free) |
| Czas buildu | ~5-10 min | ~10-15 min |
| Konfiguracja | Prosta (eas.json) | Średnia (workflow YAML) |
| Signing | Automatyczne | Wymaga konfiguracji |
| Artifacts | 30 dni | 90 dni (configurable) |
| Kolejka | Może być długa | Zazwyczaj szybka |

## Następne kroki

1. **Commit i push zmian:**
```bash
git add .github/workflows/build-android.yml
git commit -m "Add GitHub Actions workflow for Android builds"
git push
```

2. **Sprawdź build:**
   - Idź do zakładki "Actions" w GitHub
   - Obserwuj postęp buildu

3. **Pobierz APK:**
   - Po zakończeniu buildu, pobierz APK z Artifacts lub Releases

## Dodatkowe opcje

### Build tylko na żądanie
Jeśli chcesz budować tylko ręcznie, zmień w workflow:
```yaml
on:
  workflow_dispatch:  # Tylko ręczne uruchomienie
```

### Build dla różnych wariantów
Możesz dodać buildy dla debug/release/preview:
```yaml
strategy:
  matrix:
    variant: [debug, release]
```

### Notyfikacje
Możesz dodać notyfikacje (email, Slack, Discord) po zakończeniu buildu.