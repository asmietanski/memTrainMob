# Jak Zainstalować Nową Wersję Bez Utraty Danych

## ✅ MOŻESZ ROBIĆ UPGRADE BEZ KASOWANIA!

Dzięki poprawnej konfiguracji możesz instalować nowe wersje aplikacji **BEZ** kasowania starej i **BEZ** utraty danych!

## Jak to działa?

### 1. Package Name (Identyfikator Aplikacji)
```json
"package": "com.rewizor0.memTrainMob"
```
- To jest unikalny identyfikator Twojej aplikacji
- Android używa go do rozpoznania, że to ta sama aplikacja
- **NIGDY nie zmieniaj tego!**

### 2. Version Code
```json
"versionCode": 2
```
- To jest numer wersji dla Androida (liczba całkowita)
- Musi być **większy** w każdej nowej wersji
- Android sprawdza: jeśli nowy `versionCode` > stary, pozwala na upgrade

### 3. Version (dla użytkownika)
```json
"version": "1.0.0"
```
- To jest wersja dla użytkownika (string)
- Może być np. "1.0.0", "1.0.1", "1.1.0", "2.0.0"
- Nie wpływa na możliwość upgrade'u

## Instrukcja Instalacji Nowej Wersji

### Krok 1: Pobierz Nowy APK
1. Idź do GitHub Actions
2. Pobierz najnowszy APK
3. Prześlij na telefon

### Krok 2: Zainstaluj Nowy APK
1. Otwórz plik APK na telefonie
2. Android zapyta: "Czy chcesz zaktualizować tę aplikację?"
3. Kliknij **"Aktualizuj"** (NIE "Odinstaluj"!)
4. Poczekaj na instalację

### Krok 3: Sprawdź Dane
1. Otwórz aplikację
2. Sprawdź Home Screen - powinieneś zobaczyć swoje statystyki
3. Sprawdź kategorię - Twój progres powinien być zachowany

## Co Zostanie Zachowane?

✅ **Baza danych SQLite** - wszystkie Twoje itemy i progres  
✅ **Statystyki** - liczba przejrzanych itemów, poprawnych odpowiedzi  
✅ **Interwały** - kiedy następna powtórka dla każdego itemu  
✅ **Easiness Factor** - trudność każdego itemu  
✅ **Historia** - wszystkie Twoje poprzednie sesje

## Co Zostanie Zmienione?

🔄 **Kod aplikacji** - nowa logika, poprawki bugów  
🔄 **Interfejs** - jeśli były zmiany w UI  
🔄 **Algorytm** - poprawki w SuperMemo SM-2

## Kiedy Musisz Kasować Aplikację?

❌ **TYLKO gdy:**
- Zmieniłeś `package` name (ale tego NIE robimy!)
- Chcesz zacząć od nowa (reset wszystkich danych)
- Masz problemy z instalacją (bardzo rzadko)

## Historia Wersji

### Version 1 (versionCode: 1)
- Pierwsza wersja
- Problem: itemy powtarzały się tego samego dnia
- Problem: kolejność alfabetyczna

### Version 2 (versionCode: 2) - AKTUALNA
- ✅ Naprawiono filtrowanie itemów
- ✅ Naprawiono kolejność (losowa zamiast alfabetycznej)
- ✅ Dodano `versionCode` dla łatwych upgrade'ów

## Przyszłe Wersje

Przy każdej nowej wersji będziemy:
1. Zwiększać `versionCode` (3, 4, 5, ...)
2. Opcjonalnie zmieniać `version` ("1.0.1", "1.1.0", ...)
3. Commitować zmiany
4. Pushować do GitHub
5. GitHub Actions zbuduje nowy APK
6. Ty pobierzesz i zainstalujesz - **BEZ** kasowania starej wersji!

## Backup (Opcjonalnie)

Jeśli chcesz być ekstra ostrożny, możesz zrobić backup bazy danych:

### Przez ADB:
```bash
# Znajdź bazę danych
adb shell "run-as com.rewizor0.memTrainMob ls -la /data/data/com.rewizor0.memTrainMob/databases/"

# Skopiuj bazę na komputer
adb shell "run-as com.rewizor0.memTrainMob cat /data/data/com.rewizor0.memTrainMob/databases/SQLite.db" > backup.db
```

### Przez File Manager (jeśli masz root):
```
/data/data/com.rewizor0.memTrainMob/databases/SQLite.db
```

Ale **normalnie nie musisz tego robić** - Android automatycznie zachowuje dane przy upgrade!

## Podsumowanie

🎉 **Możesz bezpiecznie instalować nowe wersje!**

1. Pobierz nowy APK z GitHub Actions
2. Zainstaluj (kliknij "Aktualizuj")
3. Otwórz aplikację
4. Ciesz się nowymi funkcjami z zachowanym progresem!

**Nie kasuj starej aplikacji przed instalacją nowej!**