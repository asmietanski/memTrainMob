#!/bin/bash

# Skrypt do pobierania logów z aplikacji memTrainMob
# Użycie: ./pobierz_logi.sh

echo "=========================================="
echo "  Pobieranie logów z aplikacji memTrainMob"
echo "=========================================="
echo ""

# Sprawdź czy adb jest zainstalowane
if ! command -v adb &> /dev/null; then
    echo "❌ BŁĄD: adb nie jest zainstalowane!"
    echo ""
    echo "Zainstaluj Android Platform Tools:"
    echo "  Linux:   sudo apt-get install android-tools-adb"
    echo "  macOS:   brew install android-platform-tools"
    echo "  Windows: Pobierz z https://developer.android.com/studio/releases/platform-tools"
    echo ""
    exit 1
fi

# Sprawdź czy telefon jest podłączony
echo "🔍 Sprawdzam połączenie z telefonem..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "❌ BŁĄD: Nie znaleziono podłączonego telefonu!"
    echo ""
    echo "Sprawdź:"
    echo "  1. Czy telefon jest podłączony przez USB"
    echo "  2. Czy debugowanie USB jest włączone"
    echo "  3. Czy zaakceptowałeś pytanie o zezwolenie na debugowanie"
    echo ""
    echo "Uruchom: adb devices"
    echo "Powinno pokazać: ABC123XYZ    device"
    echo ""
    exit 1
fi

echo "✅ Telefon podłączony!"
echo ""

# Wyczyść stare logi
echo "🧹 Czyszczę stare logi..."
adb logcat -c

echo "✅ Gotowe!"
echo ""
echo "=========================================="
echo "  📱 TERAZ UŻYJ APLIKACJI NA TELEFONIE"
echo "=========================================="
echo ""
echo "1. Otwórz aplikację memTrainMob"
echo "2. Wybierz kategorię (np. Countries in Europe)"
echo "3. Przejrzyj kilka itemów:"
echo "   - Niektóre oznacz jako quality 5 (powinny zniknąć)"
echo "   - Niektóre oznacz jako quality 0 (powinny wrócić)"
echo "4. Wyjdź z kategorii (przycisk Back)"
echo "5. Wejdź ponownie do tej samej kategorii"
echo "6. Sprawdź czy itemy się powtarzają"
echo ""
echo "=========================================="
echo "  📋 LOGI APLIKACJI (Ctrl+C aby zatrzymać)"
echo "=========================================="
echo ""

# Rozpocznij pobieranie logów
adb logcat | grep -E "\[getDueItems\]|\[StudyScreen\]|\[updateItemAfterReview\]"

# Made with Bob
