# Jak utworzyć repo na GitHub i zrobić push

## Krok 1: Utwórz repozytorium na GitHub.com

1. Otwórz przeglądarkę i idź na https://github.com
2. Zaloguj się na swoje konto
3. Kliknij **"+"** w prawym górnym rogu → **"New repository"**
4. Wypełnij formularz:
   - **Repository name**: `memTrainMob` (lub inna nazwa)
   - **Description**: "Mobile memory training app with SuperMemo algorithm"
   - **Public** lub **Private** (wybierz co wolisz)
   - ❌ **NIE** zaznaczaj "Initialize this repository with a README"
   - ❌ **NIE** dodawaj .gitignore ani license (już masz lokalnie)
5. Kliknij **"Create repository"**

## Krok 2: Połącz lokalne repo z GitHub

GitHub pokaże Ci instrukcje. Użyj tych dla "existing repository":

```bash
# Sprawdź czy masz już git init (prawdopodobnie tak)
git status

# Jeśli nie ma repo, zainicjuj:
# git init

# Dodaj wszystkie pliki
git add .

# Zrób commit
git commit -m "Initial commit: Memory training app with fixed SuperMemo algorithm"

# Dodaj remote (ZMIEŃ URL na swój z GitHub!)
git remote add origin https://github.com/TWOJA_NAZWA_UZYTKOWNIKA/memTrainMob.git

# Lub jeśli używasz SSH:
# git remote add origin git@github.com:TWOJA_NAZWA_UZYTKOWNIKA/memTrainMob.git

# Sprawdź branch (powinien być main lub master)
git branch

# Jeśli jest master, zmień na main (opcjonalnie):
# git branch -M main

# Push do GitHub
git push -u origin main
# lub jeśli masz branch master:
# git push -u origin master
```

## Krok 3: Sprawdź czy działa

1. Odśwież stronę repozytorium na GitHub
2. Powinieneś zobaczyć wszystkie pliki
3. Idź do zakładki **"Actions"**
4. Zobaczysz uruchomiony workflow "Build Android APK"
5. Poczekaj ~10-15 minut na zakończenie buildu

## Krok 4: Pobierz APK

1. Po zakończeniu buildu, kliknij na workflow
2. Przewiń w dół do sekcji **"Artifacts"**
3. Pobierz `app-release-XXX.zip`
4. Rozpakuj i zainstaluj APK na telefonie

## Troubleshooting

### "remote origin already exists"
```bash
# Usuń stary remote i dodaj nowy
git remote remove origin
git remote add origin https://github.com/TWOJA_NAZWA_UZYTKOWNIKA/memTrainMob.git
```

### "Permission denied" przy push
Jeśli używasz HTTPS, GitHub może poprosić o:
- Username: twoja nazwa użytkownika GitHub
- Password: **Personal Access Token** (nie hasło!)

Aby utworzyć token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Zaznacz "repo" → Generate
3. Skopiuj token i użyj jako hasła

### Wolisz SSH?
```bash
# Wygeneruj klucz SSH (jeśli nie masz)
ssh-keygen -t ed25519 -C "twoj@email.com"

# Dodaj klucz do ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Skopiuj klucz publiczny
cat ~/.ssh/id_ed25519.pub

# Dodaj na GitHub: Settings → SSH and GPG keys → New SSH key
# Wklej skopiowany klucz

# Użyj SSH URL zamiast HTTPS
git remote set-url origin git@github.com:TWOJA_NAZWA_UZYTKOWNIKA/memTrainMob.git
```

## Gotowe!

Po pierwszym push, każdy kolejny push będzie prostszy:
```bash
git add .
git commit -m "Opis zmian"
git push
```

I GitHub Actions automatycznie zbuduje nowy APK!