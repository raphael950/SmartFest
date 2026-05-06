# SmartRace

SmartRace est la plateforme pensée pour piloter un événement sur circuit de bout en bout. Elle centralise le live timing, la gestion des incidents, les objets connectés, les profils et l’administration dans une expérience rapide, claire et orientée terrain.

## Prérequis
- Node.js 24.x, avec `fnm use 24`
- Un fichier `.env` à partir de `.env.example`
- Une clé d’application générée avec `node ace generate:key`
- Une base PostgreSQL et, si besoin, un serveur SMTP configuré dans le `.env`

## Fonctionnalités
- Suivi live timing et état de course en direct
- Gestion des incidents et des objets connectés
- Espace profil utilisateur et networking
- Administration des comptes et des rôles
- Authentification, inscription et réinitialisation de mot de passe

## Stack
- AdonisJS
- Inertia.js + React
- TypeScript
- Socket.IO

## Lancer le projet
```bash
npm install
npm run dev
```
