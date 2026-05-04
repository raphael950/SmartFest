# Déploiement SmartFest avec Docker

## 1️⃣ Préparation

### Sur le serveur:
```bash
# Crée un dossier pour le projet
mkdir -p /path/to/smartfest
cd /path/to/smartfest

# Clone le repo ou copie les fichiers
git clone <ton-repo> .
# ou copie les fichiers directement
```

### Prépare les variables d'environnement:
```bash
# Copie et adapte le fichier env
cp .env.example .env

# Édite .env avec tes credentials réels:
# - APP_KEY (depuis ta local: cat .env | grep APP_KEY)
# - PG_HOST, PG_PORT, PG_USER, PG_PASSWORD
# - APP_URL (ton domaine ou IP du NAS)
nano .env
```

## 2️⃣ Build et Déploiement

### Option A: Docker Compose (recommandé)
```bash
# Build l'image
docker-compose build

# Lance le conteneur
docker-compose up -d

# Vérifie les logs
docker-compose logs -f smartfest
```

### Option B: Docker direct
```bash
# Build l'image
docker build -t smartfest:latest .

# Lance le conteneur
docker run -d \
  --name smartfest \
  --restart unless-stopped \
  -p 3333:3333 \
  --env-file .env \
  smartfest:latest
```

## 3️⃣ Après le déploiement

```bash
# Vérifie que l'app tourne
docker ps | grep smartfest

# Vérifie la santé
docker logs smartfest

# Pour un rebuild:
docker-compose up -d --build

# Pour arrêter:
docker-compose down
```