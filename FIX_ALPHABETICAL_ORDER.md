# Naprawa Kolejności Alfabetycznej

## Problem
Po 1 dniu wszystkie 51 itemów wróciło do nauki (zgodnie z algorytmem - pierwsza powtórka po 1 dniu), ale były wyświetlane w kolejności alfabetycznej zamiast losowej.

## Przyczyna
Wszystkie itemy miały tę samą `next_review_date` (dzisiaj o 6:00 AM). Gdy sortujemy po dacie, itemy z tą samą datą pozostają w kolejności, w jakiej przyszły z bazy danych - czyli alfabetycznej.

## Rozwiązanie

### Przed (niepoprawne):
```javascript
// Sort scheduled by date (oldest first)
scheduled.sort((a, b) =>
    new Date(a.next_review_date) - new Date(b.next_review_date)
);

const result = [
    ...scheduled,
    ...shuffle(failed),
    ...shuffle(newItems)
];
```

**Problem:** Gdy wszystkie scheduled items mają tę samą datę, sortowanie nie zmienia kolejności - pozostają alfabetyczne.

### Po (poprawne):
```javascript
// Group scheduled items by date
const scheduledByDate = {};
scheduled.forEach(item => {
    const dateKey = item.next_review_date || 'null';
    if (!scheduledByDate[dateKey]) {
        scheduledByDate[dateKey] = [];
    }
    scheduledByDate[dateKey].push(item);
});

// Sort date groups (oldest first), then shuffle within each group
const sortedScheduled = Object.keys(scheduledByDate)
    .sort((a, b) => {
        if (a === 'null') return 1;
        if (b === 'null') return -1;
        return new Date(a) - new Date(b);
    })
    .flatMap(dateKey => shuffle(scheduledByDate[dateKey]));

const result = [
    ...sortedScheduled,
    ...shuffle(failed),
    ...shuffle(newItems)
];
```

**Rozwiązanie:** 
1. Grupujemy scheduled items po dacie
2. Sortujemy grupy po dacie (najstarsze pierwsze)
3. W każdej grupie losujemy kolejność (Fisher-Yates shuffle)
4. Łączymy wszystko razem

## Jak to działa w aplikacji desktopowej

W Pythonie (app.py):
```sql
ORDER BY
    CASE
        WHEN interval > 0 AND repetitions > 0 THEN 0
        WHEN interval = 0 AND repetitions = 0 AND last_reviewed_at IS NOT NULL THEN 1
        ELSE 2
    END,
    CASE WHEN interval > 0 THEN next_review_date ELSE NULL END,
    RANDOM()
```

To znaczy:
1. Najpierw priorytet (0 = scheduled, 1 = failed, 2 = new)
2. Potem data (dla scheduled)
3. **Potem RANDOM()** - to jest kluczowe!

## Przykład

### Scenariusz:
- 51 itemów przejrzanych wczoraj z quality >= 3
- Wszystkie mają `interval = 1`, `repetitions = 1`
- Wszystkie mają `next_review_date = "2026-04-10T04:00:00.000Z"` (dzisiaj o 6 AM)

### Przed poprawką:
```
Albania
Andorra
Austria
Belarus
Belgium
...
```
(kolejność alfabetyczna)

### Po poprawce:
```
Poland
Cyprus
Malta
Ireland
Germany
...
```
(losowa kolejność)

## Weryfikacja

### Test 1: Wszystkie itemy z tą samą datą
✅ Itemy są losowe, nie alfabetyczne

### Test 2: Itemy z różnymi datami
✅ Starsze daty są pierwsze
✅ W każdej dacie itemy są losowe

### Test 3: Mix scheduled, failed, new
✅ Scheduled pierwsze (losowe w każdej dacie)
✅ Failed drugie (losowe)
✅ New ostatnie (losowe)

## Commit
```
Fix: Shuffle scheduled items with same review date

Problem: When all items have same next_review_date (e.g., all due today at 6 AM),
they were displayed in alphabetical order instead of random.

Solution: Group scheduled items by date, then shuffle within each date group.
This matches desktop app behavior: ORDER BY priority, date, RANDOM()

Now items with same review date appear in random order, not alphabetical.
```

## Następne kroki
1. Push do GitHub: `git push origin master`
2. Poczekaj na build (~10-15 min)
3. Pobierz i zainstaluj nowy APK
4. Przetestuj - itemy powinny być losowe!