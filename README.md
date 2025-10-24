# Galpha

> Application desktop pour League of Legends avec suivi de statistiques et enregistrement automatique des parties

[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/galnir/Galpha/releases)
[![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/galnir/Galpha/releases)
[![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/galnir/Galpha/releases)

## 🎮 Fonctionnalités

### ✅ Multi-plateformes (Windows, macOS, Linux)
- 📊 **Statistiques en temps réel** : Profil, rang, LP, winrate
- 📈 **Historique des matchs** : 20 dernières parties avec détails complets
- 🎯 **Détection automatique** : Se connecte automatiquement au client LoL
- 💾 **Cache intelligent** : Base de données SQLite locale
- 🔐 **Sécurisé** : Clé API stockée localement, pas de serveur externe

### 🎥 Enregistrement automatique (Windows uniquement)
- ⏺️ **Auto-record** : Démarre/arrête automatiquement avec vos parties
- 🎞️ **Qualité configurable** : 4 niveaux (720p/1080p/1440p, 30/60fps)
- 📁 **Gestion des replays** : Liste, lecture et organisation des vidéos
- 🗑️ **Nettoyage auto** : Suppression automatique des anciens replays
- 🎯 **Filtres** : Enregistrez toutes les parties ou uniquement les ranked

> **Note** : L'enregistrement vidéo nécessite [FFmpeg](https://ffmpeg.org/) et est actuellement disponible uniquement sur Windows. Support macOS/Linux à venir.

---

## 📥 Installation

### Windows
1. Téléchargez le `.msi` ou `.exe` depuis [Releases](https://github.com/galnir/Galpha/releases)
2. Installez FFmpeg (requis pour l'enregistrement) : `winget install FFmpeg`
3. Lancez Galpha et suivez la configuration

**📖 [Guide complet Windows](WINDOWS_SETUP.md)**

### macOS
1. Téléchargez le `.dmg` depuis [Releases](https://github.com/galnir/Galpha/releases)
2. Glissez Galpha dans Applications
3. Lancez l'application

### Linux
1. Téléchargez le `.AppImage` ou `.deb` depuis [Releases](https://github.com/galnir/Galpha/releases)
2. Donnez les permissions d'exécution
3. Lancez l'application

---

## 🚀 Développement

### Prérequis
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Rust 1.70+ ([rustup.rs](https://rustup.rs))
- FFmpeg (pour tester l'enregistrement sur Windows)

### Installation
```bash
# Cloner le repository
git clone https://github.com/galnir/Galpha.git
cd Galpha

# Installer les dépendances
npm install

# Lancer en mode dev
npm run tauri dev

# Build de production
npm run tauri build
```

### Structure du projet
```
Galpha/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Composants UI
│   ├── hooks/             # Hooks personnalisés
│   └── utils/             # Utilitaires
├── src-tauri/             # Backend Rust
│   └── src/
│       ├── lcu/           # Connexion au client LoL
│       ├── riot_api/      # API Riot Games
│       ├── recorder/      # Enregistrement vidéo
│       └── database/      # SQLite
└── .github/workflows/     # CI/CD GitHub Actions
```

---

## 🛠️ Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Rust, Tauri 2
- **Base de données** : SQLite (via sqlx)
- **API** : Riot Games API, LCU (League Client Update)
- **Enregistrement** : FFmpeg (gdigrab sur Windows)

---

## 📊 Fonctionnalités détaillées

### Suivi des statistiques
- Connexion automatique au client League of Legends
- Affichage du profil (nom, niveau, icône)
- Statistiques ranked (Solo/Duo, Flex)
- Historique des 20 dernières parties avec :
  - Champion joué
  - K/D/A (Kills/Deaths/Assists)
  - Victoire/Défaite
  - Mode de jeu
  - Durée et date

### Enregistrement automatique (Windows)
- Détection automatique du début/fin de partie
- Paramètres configurables :
  - **Basse** : 720p @ 30fps (~1.5 GB/h)
  - **Moyenne** : 1080p @ 30fps (~3 GB/h)
  - **Haute** : 1080p @ 60fps (~5 GB/h) ⭐ Recommandé
  - **Ultra** : 1440p @ 60fps (~8 GB/h)
- Choix du type de parties (Toutes/Ranked uniquement)
- Suppression automatique après X jours (optionnel)
- Fichiers au format MP4 compatible tous lecteurs

---

## ⚙️ Configuration

### Clé API Riot (optionnelle)
Obtenez une clé sur [developer.riotgames.com](https://developer.riotgames.com) pour accéder aux statistiques détaillées.

### Enregistrement (Windows)
1. Allez dans **Paramètres**
2. Activez **"Enregistrement automatique"**
3. Sélectionnez un **dossier de sauvegarde**
4. Choisissez la **qualité** d'enregistrement
5. **Sauvegardez** les paramètres

---

## 🐛 Problèmes connus

### Windows
- **Audio non capturé** : L'audio système n'est pas enregistré (support à venir)
- **Écran noir** : Désactiver les overlays (Discord, GeForce Experience)

### macOS
- **Enregistrement non disponible** : Fonctionnalité en développement

### Linux
- **Enregistrement non disponible** : Fonctionnalité en développement

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 💬 Support

- 🐛 **Bugs** : Ouvrez une [issue](https://github.com/galnir/Galpha/issues)
- 💡 **Suggestions** : Ouvrez une [discussion](https://github.com/galnir/Galpha/discussions)
- 📧 **Contact** : [GitHub](https://github.com/galnir)

---

## ⭐ Remerciements

- [Riot Games](https://developer.riotgames.com) pour l'API
- [Tauri](https://tauri.app) pour le framework
- [FFmpeg](https://ffmpeg.org) pour l'encodage vidéo
- La communauté League of Legends

---

**Fait avec ❤️ pour la communauté League of Legends**

[![GitHub stars](https://img.shields.io/github/stars/galnir/Galpha?style=social)](https://github.com/galnir/Galpha/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/galnir/Galpha)](https://github.com/galnir/Galpha/issues)
