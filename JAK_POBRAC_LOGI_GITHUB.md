# Jak pobrać pełne logi z GitHub Actions

## Krok po kroku:

1. **Otwórz Actions:**
   - Idź na: https://github.com/asmietanski/memTrainMob/actions

2. **Kliknij na failed workflow:**
   - Zobaczysz listę workflow runs
   - Kliknij na ten z czerwonym X (failed)

3. **Kliknij na "build" job:**
   - Po lewej stronie zobaczysz "build" 
   - Kliknij na niego

4. **Rozwiń kroki z błędami:**
   - Zobaczysz listę kroków (Setup Node.js, Install dependencies, Expo prebuild, etc.)
   - Kliknij na każdy krok który ma czerwony X
   - Skopiuj CAŁY output (może być długi!)
   
5. **Lub pobierz raw logs:**
   - W prawym górnym rogu kliknij na "..." (trzy kropki)
   - Wybierz "View raw logs"
   - Skopiuj cały plik

## Czego szukam:

Potrzebuję zobaczyć szczegółowy output z kroków:
- **"Expo prebuild"** - prawdopodobnie tutaj jest błąd
- **"Build Android APK"** - lub tutaj

Output powinien zawierać:
- Komendy które były wykonywane
- Błędy (ERROR, FAILED, etc.)
- Stack traces
- Pełne komunikaty błędów

## Przykład jak to powinno wyglądać:

```
Run npx expo prebuild --platform android --clean
npx: installed 123 in 4.567s
✔ Created native project directories
✔ Updated package.json
✖ Failed to configure Android project
Error: ENOENT: no such file or directory, open 'android/app/build.gradle'
    at Object.openSync (fs.js:476:3)
    ...
```

Wklej tutaj cały taki output!