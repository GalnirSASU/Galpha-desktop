# 🎮 Galpha - Guide Testeurs (Version Recette)

Bienvenue dans le programme de test de Galpha! Cette version "recette" est mise à jour automatiquement plusieurs fois par jour avec les dernières fonctionnalités.

## 📥 Installation

### 1. Télécharger la Dernière Version

**[👉 Cliquer ici pour télécharger](https://github.com/galnir/Galpha/releases)**

Choisir le fichier selon votre système:
- **macOS**: `Galpha_x.x.x_aarch64.dmg` (Apple Silicon) ou `Galpha_x.x.x_x64.dmg` (Intel)
- **Windows**: `Galpha_x.x.x_x64_en-US.msi`
- **Linux**: `galpha_x.x.x_amd64.deb` ou `galpha_x.x.x_amd64.AppImage`

### 2. Installer

**macOS:**
1. Ouvrir le fichier `.dmg`
2. Glisser Galpha vers Applications
3. Au premier lancement, clic droit → Ouvrir (pour contourner la sécurité)

**Windows:**
1. Double-cliquer sur le `.msi`
2. Suivre l'assistant d'installation
3. Windows Defender peut demander confirmation (cliquer sur "Plus d'infos" → "Exécuter quand même")

**Linux:**
```bash
# Debian/Ubuntu (.deb)
sudo dpkg -i galpha_*.deb
sudo apt-get install -f

# AppImage
chmod +x galpha_*.AppImage
./galpha_*.AppImage
```

### 3. Configuration Initiale

Au premier lancement:
1. L'application détectera automatiquement League of Legends
2. Vous serez guidé pour configurer votre compte

---

## 🔄 Mises à Jour Automatiques

### Comment ça marche?

L'application vérifie automatiquement les mises à jour:
- ✅ Au démarrage
- ✅ Toutes les 30 minutes en arrière-plan

### Quand une mise à jour est disponible:

1. **Une notification apparaît** en bas à droite:
   ```
   ╔════════════════════════════════════╗
   ║  🔔 Mise à jour disponible!       ║
   ║  Version 0.2.5 disponible         ║
   ║                                   ║
   ║  [Mettre à jour]  [Plus tard]    ║
   ╚════════════════════════════════════╝
   ```

2. **Cliquer sur "Mettre à jour"**
   - Le téléchargement démarre (quelques secondes)
   - L'installation se fait automatiquement
   - L'application redémarre avec la nouvelle version

3. **Cliquer sur "Plus tard"**
   - La notification disparaît
   - Elle réapparaîtra au prochain lancement

### ⚠️ Important:

- **Ne fermez pas l'application** pendant une mise à jour
- Les mises à jour sont **signées cryptographiquement** (sécurité garantie)
- Votre configuration et données sont **préservées**

---

## 🐛 Signaler un Bug

### Méthode 1: GitHub Issues (recommandé)

1. Aller sur: https://github.com/galnir/Galpha/issues
2. Cliquer sur "New Issue"
3. Remplir le template:

```markdown
**Description du bug:**
[Décrivez le problème]

**Étapes pour reproduire:**
1. Lancer l'application
2. Cliquer sur...
3. Le bug apparaît

**Comportement attendu:**
[Ce qui devrait se passer]

**Screenshots:**
[Si possible]

**Environnement:**
- OS: [macOS 14.1 / Windows 11 / Ubuntu 22.04]
- Version Galpha: [voir en bas à gauche de l'app]
- Version LoL: [14.20]
```

### Méthode 2: Discord (pour discussions)

Rejoindre notre serveur Discord: [lien_discord]

### Méthode 3: Email

Envoyer à: bugs@galpha.app
Sujet: [BUG] Titre court du problème

---

## 📊 Fonctionnalités à Tester

### ✅ Checklist de Test

#### Première Installation:
- [ ] L'application détecte League of Legends
- [ ] La configuration du compte fonctionne
- [ ] Les icônes et images se chargent correctement

#### Dashboard:
- [ ] Les stats s'affichent correctement
- [ ] Les matchs récents se chargent
- [ ] Le scroll fonctionne
- [ ] Les icônes de champions s'affichent

#### Performance:
- [ ] Premier chargement des matchs (~1 min acceptable)
- [ ] Rechargement des matchs (<5 secondes avec cache)
- [ ] L'app ne ralentit pas après 1h d'utilisation
- [ ] Pas de freeze/lag

#### Mises à Jour:
- [ ] Notification de mise à jour s'affiche
- [ ] Le téléchargement fonctionne
- [ ] L'installation se fait sans erreur
- [ ] L'app redémarre correctement

#### Multi-comptes:
- [ ] Ajout d'un second compte fonctionne
- [ ] Basculer entre les comptes fonctionne
- [ ] Les stats sont correctes pour chaque compte

---

## 🎯 Ce Qui Est Nouveau (Changelog)

### Version 0.2.x (En cours - Recette)

**Nouvelles Fonctionnalités:**
- ✨ Système de cache des matchs (super rapide!)
- ✨ Mises à jour automatiques
- ✨ Amélioration du rate limiting (plus d'erreurs 429)
- ✨ Design amélioré avec animations

**Corrections de Bugs:**
- 🐛 Icônes de champions manquantes (ex: Smolder)
- 🐛 Scroll qui ne fonctionnait pas
- 🐛 Classement ranked qui ne s'affichait pas

**Performance:**
- ⚡ Premier chargement: 50 matchs en ~75s
- ⚡ Rechargement: instantané (cache)
- ⚡ Consommation mémoire réduite de 30%

---

## 💡 Astuces

### Vider le Cache

Si vous rencontrez des problèmes de données:

**macOS:**
```bash
rm -rf ~/Library/Application\ Support/galpha/galpha.db
```

**Windows:**
```cmd
del %APPDATA%\galpha\galpha.db
```

**Linux:**
```bash
rm -rf ~/.local/share/galpha/galpha.db
```

Puis relancer l'application.

### Voir les Logs (pour debug)

**macOS:**
```bash
tail -f ~/Library/Logs/com.galpha.launcher/galpha.log
```

**Windows:**
```cmd
type %APPDATA%\com.galpha.launcher\logs\galpha.log
```

**Linux:**
```bash
tail -f ~/.local/share/com.galpha.launcher/logs/galpha.log
```

### Forcer une Vérification de Mise à Jour

1. Fermer complètement l'application
2. Rouvrir
3. L'app vérifie automatiquement au démarrage

---

## 🏆 Programme de Récompenses

En tant que testeur actif, vous pouvez gagner:

- 🎁 **Badge "Early Tester"** sur Discord
- 🎁 **Accès anticipé** aux nouvelles features
- 🎁 **Crédits** dans l'application
- 🎁 **Swag Galpha** (stickers, t-shirts) pour les meilleurs rapports de bugs

Pour qualifier:
- Signaler au moins 3 bugs valides
- Tester chaque nouvelle version dans les 48h
- Fournir des rapports détaillés avec screenshots

---

## ❓ FAQ

### L'app ne détecte pas League of Legends

**Solution:**
1. Vérifier que LoL est bien installé
2. Lancer LoL une fois
3. Relancer Galpha

### Les mises à jour ne fonctionnent pas

**Solutions:**
1. Désinstaller complètement l'app
2. Télécharger la dernière version manuellement
3. Réinstaller
4. Les updates automatiques devraient fonctionner ensuite

### "Erreur 429 - Too Many Requests"

**C'est normal si:**
- Vous testez l'app intensivement
- Plusieurs personnes utilisent la même clé API

**Solution:**
- Attendre 2-3 minutes
- L'app va réessayer automatiquement
- Utiliser le cache (les matchs déjà chargés restent disponibles)

### L'app consomme beaucoup de RAM

**Normal:**
- Au premier lancement: ~200-300 MB
- Après 1h: ~400-500 MB
- Redémarrer l'app si > 1 GB

### Les données ne sont pas à jour

**Solution:**
1. Vérifier votre connexion Internet
2. Cliquer sur "Rafraîchir" (icône en haut à droite)
3. Si le problème persiste, signaler un bug

---

## 📞 Contact

- **GitHub Issues**: https://github.com/galnir/Galpha/issues
- **Discord**: [lien_discord]
- **Email**: support@galpha.app
- **Twitter**: @GalphaGG

---

## 🙏 Merci!

Votre participation au programme de test est précieuse! Chaque bug signalé, chaque suggestion aide à améliorer Galpha pour tous.

**Happy Testing! 🎮**

---

*Dernière mise à jour: 2024-10-16*
*Version du guide: 1.0*
