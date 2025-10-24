# Galpha - Guide d'installation Windows

> **🎮 Enregistrement automatique - Windows uniquement**
>
> La fonctionnalité d'enregistrement automatique des parties (style Outplayed) est **disponible exclusivement sur Windows**. Les autres fonctionnalités (statistiques, historique des matchs, profil) fonctionnent sur toutes les plateformes (Windows, macOS, Linux).

## Prérequis

### 1. FFmpeg (OBLIGATOIRE pour l'enregistrement)

L'enregistrement automatique des parties nécessite FFmpeg. Voici comment l'installer :

#### Option A : Via winget (recommandé pour Windows 10/11)
```powershell
winget install FFmpeg
```

#### Option B : Installation manuelle
1. Téléchargez FFmpeg depuis : https://www.gyan.dev/ffmpeg/builds/
2. Choisissez `ffmpeg-release-essentials.zip`
3. Extrayez le fichier ZIP
4. Déplacez le dossier `ffmpeg` vers `C:\ffmpeg`
5. Ajoutez FFmpeg au PATH :
   - Ouvrez les "Paramètres système avancés"
   - Cliquez sur "Variables d'environnement"
   - Dans "Variables système", trouvez "Path" et cliquez "Modifier"
   - Cliquez "Nouveau" et ajoutez : `C:\ffmpeg\bin`
   - Cliquez OK sur toutes les fenêtres

#### Vérification de l'installation
Ouvrez PowerShell et tapez :
```powershell
ffmpeg -version
```

Si vous voyez la version de FFmpeg, l'installation est réussie ! ✅

---

## Installation de Galpha

### Téléchargement
1. Allez sur la page [Releases](https://github.com/galnir/Galpha/releases)
2. Téléchargez le fichier `.msi` ou `.exe` pour Windows
3. Exécutez l'installeur et suivez les instructions

### Première utilisation

1. **Lancez Galpha**
2. **Configurez l'enregistrement** (optionnel) :
   - Allez dans l'onglet "Paramètres"
   - Activez "Enregistrement automatique"
   - Sélectionnez un dossier de sauvegarde (ex: `C:\Users\VotreNom\Videos\Galpha`)
   - Choisissez la qualité d'enregistrement :
     - **Basse** : 720p 30fps (~1.5 GB/heure)
     - **Moyenne** : 1080p 30fps (~3 GB/heure)
     - **Haute** : 1080p 60fps (~5 GB/heure) ⭐ **Recommandé**
     - **Ultra** : 1440p 60fps (~8 GB/heure)
   - Sauvegardez les paramètres

3. **Configurez votre clé API Riot** (optionnel) :
   - Obtenez une clé sur [developer.riotgames.com](https://developer.riotgames.com)
   - Collez-la dans Galpha

4. **Lancez League of Legends** et profitez ! 🎮

---

## Fonctionnalités

### ✅ Détection automatique de League of Legends
Galpha détecte automatiquement quand LoL est lancé

### ✅ Statistiques en temps réel
- Profil du joueur
- Rang actuel (Solo/Flex)
- Historique des 20 dernières parties
- KDA, Winrate, LP

### ✅ Enregistrement automatique (comme Outplayed)
- **Démarre automatiquement** quand une partie commence
- **S'arrête automatiquement** à la fin
- **Enregistre l'écran** (pas la webcam)
- **Vidéos au format MP4** compatibles avec tous les lecteurs
- **Qualité configurable** selon vos besoins

### ✅ Gestion des replays
- Liste de tous vos enregistrements
- Lecture directe depuis l'application
- Accès rapide au dossier de sauvegarde

---

## Paramètres d'enregistrement recommandés pour Windows

### Configuration optimale pour la majorité des PC
- **Qualité** : Haute (1080p 60fps)
- **Dossier** : `C:\Users\VotreNom\Videos\Galpha`
- **Type** : Toutes les parties

### Pour les PC moins puissants
- **Qualité** : Moyenne (1080p 30fps)
- Réduisez la résolution de League of Legends pendant les parties

### Pour les streamers / créateurs de contenu
- **Qualité** : Ultra (1440p 60fps)
- Utilisez un SSD pour le stockage
- Désactivez la suppression automatique

---

## Résolution de problèmes

### L'enregistrement ne démarre pas
1. ✅ Vérifiez que FFmpeg est installé : `ffmpeg -version` dans PowerShell
2. ✅ Vérifiez que le dossier d'enregistrement existe
3. ✅ Vérifiez que vous avez suffisamment d'espace disque
4. ✅ Relancez Galpha en tant qu'administrateur

### La vidéo est vide ou noire
- Désactivez les overlays (Discord, NVIDIA GeForce Experience)
- Redémarrez votre PC
- Mettez à jour vos pilotes graphiques

### L'application ne détecte pas League of Legends
- Assurez-vous que le client LoL est bien lancé (pas juste le launcher)
- Vérifiez que Galpha a les permissions nécessaires
- Relancez Galpha

### Les replays ne s'affichent pas
- Allez dans Paramètres et vérifiez le dossier d'enregistrement
- Cliquez sur "Actualiser" dans l'onglet Replays
- Vérifiez que les fichiers `.mp4` sont bien présents dans le dossier

---

## Configuration système requise

### Minimum
- Windows 10 (64-bit)
- 4 GB RAM
- 5 GB d'espace disque libre

### Recommandé
- Windows 11 (64-bit)
- 8 GB RAM
- SSD avec 50+ GB d'espace libre
- Processeur Intel i5 / AMD Ryzen 5 ou supérieur

---

## Support

🐛 **Problèmes ?** Ouvrez une issue sur [GitHub](https://github.com/galnir/Galpha/issues)

💬 **Questions ?** Consultez la [documentation complète](https://github.com/galnir/Galpha)

⭐ **Aimez Galpha ?** Donnez-nous une étoile sur GitHub !

---

## Notes importantes

- ⚠️ **L'enregistrement vidéo consomme de l'espace disque**. Surveillez votre stockage !
- ⚠️ **FFmpeg est requis** pour l'enregistrement. Sans FFmpeg, seules les stats fonctionneront
- ✅ **Audio** : Pour le moment, seule la vidéo est capturée (l'audio nécessite une configuration spécifique par système)
- ✅ **Multi-écrans** : L'écran principal est capturé par défaut

---

**Bon jeu ! 🎮✨**
