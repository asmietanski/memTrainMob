# Jak Pobrać Logi z Telefonu Android

## Wymagania
- Telefon Android podłączony przez USB do komputera
- Włączony tryb deweloperski na telefonie
- Zainstalowane narzędzia ADB (Android Debug Bridge)

## Krok 1: Włącz Tryb Deweloperski na Telefonie

1. Otwórz **Ustawienia** na telefonie
2. Przejdź do **O telefonie** (lub **About phone**)
3. Znajdź **Numer kompilacji** (Build number)
4. Kliknij **7 razy** na "Numer kompilacji"
5. Pojawi się komunikat "Jesteś teraz deweloperem!"

## Krok 2: Włącz Debugowanie USB

1. Wróć do głównych **Ustawień**
2. Znajdź **Opcje deweloperskie** (Developer options)
3. Włącz **Debugowanie USB** (USB debugging)
4. Potwierdź ostrzeżenie

## Krok 3: Podłącz Telefon do Komputera

1. Podłącz telefon kablem USB do komputera
2. Na telefonie pojawi się pytanie o zezwolenie na debugowanie USB
3. Zaznacz "Zawsze zezwalaj z tego komputera"
4. Kliknij **OK**

## Krok 4: Sprawdź Połączenie ADB

Otwórz terminal na komputerze i wpisz:

```bash
adb devices
```

Powinieneś zobaczyć coś takiego:
```
List of devices attached
ABC123XYZ    device
```

Jeśli widzisz `unauthorized`, sprawdź telefon - może być pytanie o zezwolenie.

## Krok 5: Pobierz Logi z Aplikacji

### Opcja A: Logi w Czasie Rzeczywistym (Zalecane)

Uruchom to polecenie w terminalu na komputerze:

```bash
adb logcat | grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]"
```

Teraz:
1. Otwórz aplikację na telefonie
2. Wybierz kategorię
3. Przejrzyj kilka itemów (niektóre jako quality 5, niektóre jako quality 0)
4. Wyjdź z kategorii
5. Wejdź ponownie do tej samej kategorii
6. Obserwuj logi w terminalu - zobaczysz dokładnie co się dzieje!

### Opcja B: Zapisz Wszystkie Logi do Pliku

```bash
adb logcat > logi_aplikacji.txt
```

Potem możesz przeszukać plik:
```bash
grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]" logi_aplikacji.txt
```

### Opcja C: Wyczyść Stare Logi i Zacznij od Nowa

```bash
# Wyczyść stare logi
adb logcat -c

# Rozpocznij nagrywanie nowych logów
adb logcat | grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]"
```

## Krok 6: Interpretacja Logów

Szukaj takich linii:

```
[StudyScreen] Loading items for category: Countries_in_Europe
[StudyScreen] Got 51 total items from database
[getDueItems] now=2026-04-09T08:00:00.000Z, checking 51 items
[getDueItems] Item 1: interval=0, reps=0, next_review=null, last_reviewed=null
[getDueItems]   -> NEW (never reviewed, failedCount=0)
[getDueItems] Item 2: interval=1, reps=1, next_review=2026-04-10T04:00:00.000Z, last_reviewed=2026-04-09T07:30:00.000Z
[getDueItems]   -> SKIPPED (future): next_review=2026-04-10T04:00:00.000Z > now=2026-04-09T08:00:00.000Z
[updateItemAfterReview] itemId=1, quality=5, newInterval=1, nextReviewDate=2026-04-10T04:00:00.000Z
```

## Krok 7: Zatrzymaj Logi

Naciśnij `Ctrl+C` w terminalu, aby zatrzymać pobieranie logów.

## Rozwiązywanie Problemów

### Problem: "adb: command not found"

Musisz zainstalować Android SDK Platform Tools:

**Linux:**
```bash
sudo apt-get install android-tools-adb
```

**macOS:**
```bash
brew install android-platform-tools
```

**Windows:**
1. Pobierz z: https://developer.android.com/studio/releases/platform-tools
2. Rozpakuj
3. Dodaj do PATH lub uruchom z folderu

### Problem: "no devices/emulators found"

1. Sprawdź czy kabel USB działa (spróbuj innego)
2. Sprawdź czy debugowanie USB jest włączone
3. Spróbuj odłączyć i podłączyć ponownie telefon
4. Sprawdź czy na telefonie nie ma pytania o zezwolenie

### Problem: "device unauthorized"

1. Odłącz telefon
2. Na telefonie: Ustawienia → Opcje deweloperskie → Odwołaj autoryzacje debugowania USB
3. Podłącz telefon ponownie
4. Zaakceptuj pytanie o zezwolenie (zaznacz "Zawsze zezwalaj")

## Przykładowy Scenariusz Testowy

1. Uruchom logi: `adb logcat | grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]"`
2. Otwórz aplikację
3. Wybierz kategorię "Countries in Europe"
4. Przejrzyj 5 itemów:
   - 3 jako quality 5 (powinny zniknąć)
   - 2 jako quality 0 (powinny wrócić na koniec)
5. Wyjdź z kategorii (przycisk Back)
6. Wejdź ponownie do "Countries in Europe"
7. Sprawdź logi - czy 3 itemy z quality 5 są SKIPPED (future)?
8. Sprawdź czy 2 itemy z quality 0 są FAILED (needs re-review)?

## Co Dalej?

Po zebraniu logów:
1. Skopiuj istotne fragmenty
2. Prześlij mi logi lub opisz co widzisz
3. Na podstawie logów zidentyfikujemy dokładny problem
4. Naprawimy kod