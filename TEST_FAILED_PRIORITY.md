# Test Priorytetu Failed Items

## Scenariusz Testowy

### Krok 1: Początkowy Stan
- 51 nowych itemów w kategorii
- Wszystkie mają: `interval = 0`, `repetitions = 0`, `last_reviewed_at = null`

### Krok 2: Pierwsza Sesja
1. Przejrzyj 10 itemów:
   - 5 itemów → quality 5 (pass)
   - 5 itemów → quality 0 (fail)

2. Po przejrzeniu:
   - **5 passed items:**
     - `interval = 1`
     - `repetitions = 1`
     - `next_review_date = jutro o 6 AM`
     - `last_reviewed_at = dzisiaj`
   
   - **5 failed items:**
     - `interval = 0`
     - `repetitions = 0`
     - `next_review_date = teraz`
     - `last_reviewed_at = dzisiaj`
   
   - **41 new items:**
     - `interval = 0`
     - `repetitions = 0`
     - `next_review_date = null`
     - `last_reviewed_at = null`

### Krok 3: Wyjście i Powrót (Ten Sam Dzień)

Gdy wracasz do kategorii, `getDueItems()` powinno zwrócić:

1. **Grupa 1: Scheduled (0 itemów)**
   - 5 passed items mają `next_review_date = jutro`
   - Są pomijane bo `next_review_date > now`

2. **Grupa 2: Failed (5 itemów) - PRIORYTET!**
   - `interval = 0`
   - `repetitions = 0`
   - `last_reviewed_at != null` ✅
   - Losowa kolejność w tej grupie

3. **Grupa 3: New (41 itemów)**
   - `last_reviewed_at = null`
   - Losowa kolejność w tej grupie

**Oczekiwana kolejność:**
```
Item 23 (Cyprus) - FAILED
Item 7 (Belgium) - FAILED
Item 45 (Serbia) - FAILED
Item 12 (Denmark) - FAILED
Item 31 (Lithuania) - FAILED
Item 3 (Austria) - NEW
Item 18 (Greece) - NEW
Item 50 (Ukraine) - NEW
...
```

## Kod Odpowiedzialny

### `utils/srsAlgorithm.js` - getDueItems()

```javascript
// Kategoryzacja
items.forEach(item => {
    // Skip future items
    if (nextReview && nextReview > now) {
        return;
    }
    
    // Scheduled (interval > 0, repetitions > 0)
    if (item.interval > 0 && item.repetitions > 0) {
        scheduled.push(item);
    }
    // Failed (interval = 0, repetitions = 0, last_reviewed_at NOT NULL)
    else if (item.interval === 0 && item.repetitions === 0 && item.last_reviewed_at) {
        failed.push(item);  // <-- Te powinny być PRZED new
    }
    // New (last_reviewed_at IS NULL)
    else if (!item.last_reviewed_at && failedCount < 20) {
        newItems.push(item);
    }
});

// Zwracanie w kolejności
const result = [
    ...sortedScheduled,   // Grupa 1
    ...shuffledFailed,    // Grupa 2 - FAILED PRZED NEW!
    ...shuffledNew        // Grupa 3
];
```

## Możliwe Problemy

### Problem 1: `last_reviewed_at` jest pusty string zamiast null
Jeśli baza danych zwraca `""` zamiast `null`, to:
- `item.last_reviewed_at` = `""` (pusty string)
- `if (item.last_reviewed_at)` = `false` (bo pusty string jest falsy)
- Item jest traktowany jako NEW zamiast FAILED

**Rozwiązanie:** Zmienić warunek na:
```javascript
else if (item.interval === 0 && item.repetitions === 0 && item.last_reviewed_at != null && item.last_reviewed_at !== '') {
    failed.push(item);
}
```

### Problem 2: `next_review_date` nie jest ustawiane dla failed items
Jeśli failed items nie mają `next_review_date`, to są pomijane przez filtr.

**Sprawdzenie:** W `database.js` linia 129:
```javascript
if (newInterval === 0) {
    nextReviewDate = now;  // ✅ To jest OK
}
```

### Problem 3: Failed items są mieszane z new items
Jeśli kod zwraca:
```javascript
const result = [
    ...shuffle([...failed, ...newItems])  // ❌ ZŁE!
];
```

Zamiast:
```javascript
const result = [
    ...shuffle(failed),    // ✅ DOBRE
    ...shuffle(newItems)   // ✅ DOBRE
];
```

## Weryfikacja

Aby sprawdzić czy kod działa poprawnie:

1. Zacznij nową sesję z 51 itemami
2. Przejrzyj 5 itemów jako quality 0 (fail)
3. Wyjdź z kategorii
4. Wejdź ponownie
5. **Pierwsze 5 itemów powinny być te same, które zrobiłeś fail!**
6. Dopiero po nich powinny być nowe itemy

Jeśli tak nie jest, to znaczy że failed items są mieszane z new items.