# 🚀 Guide de Déploiement - Système de Recette

Ce guide explique comment mettre en place un système de déploiement continu avec auto-update pour Galpha.

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Génération des Clés de Signature](#génération-des-clés)
3. [Configuration GitHub](#configuration-github)
4. [Workflow de Déploiement](#workflow-de-déploiement)
5. [Utilisation](#utilisation)

---

## 1. Configuration Initiale

### Prérequis

- Compte GitHub avec accès au repository
- Droits d'administration sur le repository
- Tauri CLI installé: `npm install -g @tauri-apps/cli`

### Installation des Dépendances

```bash
# Dans le dossier du projet
npm install @tauri-apps/plugin-updater @tauri-apps/plugin-process
```

Ajouter dans `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-updater = "2.0.0"
tauri-plugin-process = "2.0.0"
```

---

## 2. Génération des Clés de Signature

Les clés permettent de signer les mises à jour pour garantir leur authenticité.

### Générer la paire de clés:

```bash
npm run tauri signer generate -- -w ~/.tauri/galpha.key
```

Cette commande génère:
- **Clé privée**: `~/.tauri/galpha.key` (À GARDER SECRÈTE!)
- **Clé publique**: Affichée dans le terminal

### Exemple de sortie:

```
Your keypair was generated successfully
Private: dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5CnBrLnB...
Public: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEY5NDk...
```

### ⚠️ IMPORTANT:

1. **JAMAIS** commiter la clé privée dans Git
2. Sauvegarder la clé privée dans un gestionnaire de mots de passe
3. Copier la clé publique dans `tauri.conf.json`

---

## 3. Configuration GitHub

### A. Ajouter les Secrets GitHub

Aller dans: **Settings → Secrets and variables → Actions → New repository secret**

Ajouter ces 2 secrets:

1. **`TAURI_PRIVATE_KEY`**
   - Valeur: La clé privée complète (commence par `dW50cnVzdGVk...`)

2. **`TAURI_KEY_PASSWORD`**
   - Valeur: Le mot de passe utilisé lors de la génération (si vide, laisser vide)

### B. Mettre à jour la Clé Publique

Dans `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/galnir/Galpha/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "COLLER_ICI_LA_CLE_PUBLIQUE"
    }
  }
}
```

### C. Créer la Branche Staging

```bash
# Créer et pousser la branche staging
git checkout -b staging
git push -u origin staging
```

---

## 4. Workflow de Déploiement

### Architecture

```
main (production stable)
  └─ staging (recette avec auto-deploy)
      └─ feature/* (développement)
```

### Processus de Release

#### **Version Recette (Auto):**

```bash
# Développer une fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite
# ... faire des changements ...
git commit -m "feat: nouvelle fonctionnalité"

# Merger vers staging
git checkout staging
git merge feature/ma-nouvelle-fonctionnalite
git push

# ✨ GitHub Actions build et déploie automatiquement!
```

#### **Version Production (Manuelle):**

```bash
# Quand staging est stable
git checkout main
git merge staging
git tag v1.0.0
git push --tags

# Build et release manuelle
npm run tauri build
```

---

## 5. Utilisation

### Pour les Développeurs

#### Déployer une version de recette:

```bash
# 1. Faire vos changements
git add .
git commit -m "fix: correction bug XYZ"

# 2. Pousser vers staging
git push origin staging

# 3. Attendre ~10-15 min que GitHub Actions build
# 4. Les testeurs reçoivent la notification de mise à jour!
```

#### Vérifier le statut du build:

- Aller sur: https://github.com/galnir/Galpha/actions
- Voir le workflow "Release Staging (Recette)"
- Statut:
  - 🟢 Vert = Build réussi
  - 🔴 Rouge = Build échoué (voir les logs)
  - 🟡 Jaune = En cours...

### Pour les Testeurs

#### Installation Initiale:

1. Télécharger la dernière release depuis:
   https://github.com/galnir/Galpha/releases

2. Installer l'application:
   - **Mac**: Ouvrir le `.dmg` et glisser dans Applications
   - **Windows**: Exécuter le `.msi`
   - **Linux**: Installer le `.deb` ou `.AppImage`

3. Lancer Galpha

#### Recevoir les Mises à Jour:

L'application vérifie automatiquement les mises à jour:
- Au démarrage
- Toutes les 30 minutes

Quand une mise à jour est disponible:
1. Une notification apparaît en bas à droite
2. Cliquer sur "Mettre à jour"
3. L'application télécharge, installe et redémarre automatiquement

---

## 🔧 Dépannage

### Build échoue sur GitHub Actions

**Vérifier:**
1. Les secrets `TAURI_PRIVATE_KEY` et `TAURI_KEY_PASSWORD` sont bien configurés
2. La clé publique dans `tauri.conf.json` est correcte
3. Voir les logs détaillés dans Actions

### L'update ne fonctionne pas

**Vérifier:**
1. La clé publique dans `tauri.conf.json` correspond à la clé privée
2. L'URL endpoint est correcte: `https://github.com/USER/REPO/releases/latest/download/latest.json`
3. La release n'est pas un "draft"
4. Vérifier la console du navigateur pour les erreurs

### Testeurs ne reçoivent pas les updates

**Solutions:**
1. Désinstaller complètement l'ancienne version
2. Télécharger et installer la dernière release manuellement
3. Les updates automatiques fonctionneront ensuite

---

## 📊 Monitoring

### Voir les Statistiques de Téléchargement:

- Aller sur: https://github.com/galnir/Galpha/releases
- Chaque release affiche le nombre de téléchargements par plateforme

### Logs d'Update (pour debug):

- **Mac**: `~/Library/Logs/com.galpha.launcher/`
- **Windows**: `%APPDATA%\com.galpha.launcher\logs\`
- **Linux**: `~/.local/share/com.galpha.launcher/logs/`

---

## 🎯 Workflow Complet Exemple

```bash
# Lundi: Développer une feature
git checkout -b feature/stats-advanced
# ... code ...
git commit -m "feat: ajout statistiques avancées"

# Mardi: Tester localement
npm run tauri dev

# Mercredi: Déployer en recette
git checkout staging
git merge feature/stats-advanced
git push origin staging
# → Build automatique en 15min
# → Testeurs reçoivent la notif d'update

# Jeudi: Les testeurs donnent leur feedback

# Vendredi: Si OK, déployer en prod
git checkout main
git merge staging
git tag v1.1.0
git push && git push --tags
```

---

## 📝 Checklist de Release

### Avant chaque push sur staging:

- [ ] Code testé localement (`npm run tauri dev`)
- [ ] Pas d'erreurs TypeScript (`npm run type-check`)
- [ ] Pas d'erreurs Rust (`cd src-tauri && cargo check`)
- [ ] Commit message descriptif
- [ ] Version dans `package.json` incrémentée (optionnel pour staging)

### Avant merge vers main:

- [ ] Tous les tests passent
- [ ] Staging testé par au moins 2 personnes
- [ ] Pas de bugs critiques
- [ ] Changelog mis à jour
- [ ] Version dans `package.json` incrémentée (OBLIGATOIRE)
- [ ] Tag Git créé

---

## 🚨 Urgence: Rollback

Si une release pose problème:

```bash
# 1. Identifier la dernière version stable (ex: v1.0.5)
git checkout v1.0.5

# 2. Créer une branche hotfix
git checkout -b hotfix/rollback-v1.0.6

# 3. Incrémenter la version (v1.0.7)
# Éditer package.json

# 4. Push vers staging
git push origin hotfix/rollback-v1.0.6:staging

# Les testeurs recevront le rollback comme une "nouvelle" version
```

---

## 📞 Support

Questions? Problèmes?

- **Issues GitHub**: https://github.com/galnir/Galpha/issues
- **Discussions**: https://github.com/galnir/Galpha/discussions

---

**Dernière mise à jour**: 2024-10-16
