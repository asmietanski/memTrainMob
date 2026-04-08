# Jak zrobić push do GitHub

## Problem
Git próbuje użyć GUI do zapytania o hasło, ale nie może w środowisku terminalowym.

## Rozwiązanie - wybierz jedną z opcji:

### Opcja 1: Użyj Personal Access Token (ZALECANE)

1. **Wygeneruj token na GitHub:**
   - Idź na: https://github.com/settings/tokens
   - Kliknij "Generate new token" → "Generate new token (classic)"
   - Zaznacz scope: `repo` (pełny dostęp do repozytoriów)
   - Kliknij "Generate token"
   - **SKOPIUJ TOKEN** (nie będziesz mógł go zobaczyć ponownie!)

2. **Skonfiguruj git do używania tokena:**
```bash
# Usuń stary URL z hasłem w adresie
git remote remove origin

# Dodaj nowy URL z tokenem
git remote add origin https://TWOJ_TOKEN@github.com/asmietanski/memTrainMob.git

# Lub bez tokena w URL (będziesz musiał wpisać przy push):
git remote add origin https://github.com/asmietanski/memTrainMob.git
```

3. **Zrób push:**
```bash
git push -u origin master
```

Jeśli nie dodałeś tokena do URL, git zapyta:
- Username: `asmietanski`
- Password: **wklej token** (nie hasło do GitHub!)

---

### Opcja 2: Użyj SSH (bardziej bezpieczne, ale wymaga konfiguracji)

1. **Sprawdź czy masz klucz SSH:**
```bash
ls -la ~/.ssh/id_*.pub
```

2. **Jeśli nie masz, wygeneruj:**
```bash
ssh-keygen -t ed25519 -C "smietansky@gmail.com"
# Naciśnij Enter 3 razy (domyślna lokalizacja, bez hasła)
```

3. **Skopiuj klucz publiczny:**
```bash
cat ~/.ssh/id_ed25519.pub
```

4. **Dodaj klucz na GitHub:**
   - Idź na: https://github.com/settings/keys
   - Kliknij "New SSH key"
   - Title: "memTrainMob laptop"
   - Key: wklej skopiowany klucz
   - Kliknij "Add SSH key"

5. **Zmień remote na SSH:**
```bash
git remote set-url origin git@github.com:asmietanski/memTrainMob.git
```

6. **Zrób push:**
```bash
git push -u origin master
```

---

### Opcja 3: Użyj git credential helper (zapisze hasło/token)

```bash
# Skonfiguruj git do zapamiętywania credentials
git config --global credential.helper store

# Usuń stary remote
git remote remove origin

# Dodaj nowy bez hasła w URL
git remote add origin https://github.com/asmietanski/memTrainMob.git

# Przy pierwszym push wpisz:
git push -u origin master
# Username: asmietanski
# Password: TWOJ_PERSONAL_ACCESS_TOKEN

# Następne pushe będą automatyczne
```

---

## Po udanym push

1. **Sprawdź na GitHub:**
   - Otwórz: https://github.com/asmietanski/memTrainMob
   - Powinieneś zobaczyć wszystkie pliki

2. **Sprawdź GitHub Actions:**
   - Kliknij zakładkę "Actions"
   - Zobaczysz uruchomiony workflow "Build Android APK"
   - Poczekaj ~10-15 minut na zakończenie

3. **Pobierz APK:**
   - Po zakończeniu buildu, kliknij na workflow
   - Przewiń w dół do "Artifacts"
   - Pobierz `app-release-XXX.zip`
   - Rozpakuj i zainstaluj APK

---

## Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
# Potem dodaj ponownie z odpowiednim URL
```

### "Permission denied (publickey)" przy SSH
```bash
# Sprawdź czy klucz jest dodany do ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Sprawdź połączenie
ssh -T git@github.com
```

### "Authentication failed" przy HTTPS
- Upewnij się, że używasz **Personal Access Token**, nie hasła
- Token musi mieć scope `repo`
- Sprawdź czy token nie wygasł

---

## Polecam Opcję 1 (Personal Access Token)

Jest najprostsza i najszybsza do skonfigurowania!