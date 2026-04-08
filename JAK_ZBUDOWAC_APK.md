# Jak zbudować APK za pomocą GitHub Actions

## Krok 1: Push zmian do GitHub

```bash
git add .
git commit -m "Fix SuperMemo algorithm and add GitHub Actions"
git push
```

## Krok 2: Sprawdź build w GitHub

1. Otwórz repozytorium na GitHub
2. Kliknij zakładkę **"Actions"** (u góry)
3. Zobaczysz uruchomiony workflow "Build Android APK"
4. Kliknij na niego, żeby zobaczyć postęp
5. Poczekaj ~10-15 minut aż build się zakończy

## Krok 3: Pobierz APK

1. Po zakończeniu buildu, przewiń w dół strony
2. W sekcji **"Artifacts"** zobaczysz plik `app-release-XXX`
3. Kliknij na niego, żeby pobrać (to będzie plik ZIP)
4. Rozpakuj ZIP - w środku znajdziesz `app-release.apk`

## Krok 4: Zainstaluj APK na telefonie

### Opcja A: Bezpośrednio na telefonie
1. Prześlij plik APK na telefon (email, Dysk Google, itp.)
2. Otwórz plik APK na telefonie
3. System poprosi o zezwolenie na instalację z nieznanych źródeł
4. Zaakceptuj i zainstaluj

### Opcja B: Przez ADB (jeśli masz telefon podłączony do komputera)
```bash
adb install app-release.apk
```

## To wszystko!

Nie musisz:
- ❌ Konfigurować keystore
- ❌ Publikować w Google Play
- ❌ Płacić za EAS Build
- ❌ Czekać na reset limitu EAS

Każdy push do GitHub automatycznie zbuduje nowy APK, który możesz pobrać i zainstalować.

## Troubleshooting

**Q: Build się nie uruchomił po push**
A: Sprawdź czy pushowałeś do branch `main` lub `master`. Możesz też uruchomić ręcznie:
   - Idź do Actions → Build Android APK → Run workflow

**Q: Build failed**
A: Sprawdź logi w GitHub Actions, żeby zobaczyć błąd. Najczęstsze problemy:
   - Brak pliku `android/` - uruchom lokalnie `npx expo prebuild` i commitnij
   - Błędy w kodzie - napraw błędy i push ponownie

**Q: APK nie instaluje się**
A: Sprawdź czy:
   - Masz włączoną instalację z nieznanych źródeł
   - Wersja Android >= 5.0 (API 21)
   - Odinstaluj starą wersję aplikacji przed instalacją nowej