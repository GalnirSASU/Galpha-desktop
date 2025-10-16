# ⚡ Quick Start - Système de Recette Galpha

Guide ultra-rapide pour mettre en place le système de déploiement continu.

## 🚀 En 5 Minutes

### 1. Générer les Clés (1 min)

```bash
npm run tauri signer generate -- -w ~/.tauri/galpha.key
```

**Sauvegarder:**
- ✅ Clé privée: dans un password manager
- ✅ Clé publique: dans `tauri.conf.json`

### 2. Configurer GitHub Secrets (2 min)

Aller sur: **Settings → Secrets → Actions**

Ajouter:
- `TAURI_PRIVATE_KEY`: [la clé privée complète]
- `TAURI_KEY_PASSWORD`: [le mot de passe ou vide]

### 3. Créer la Branche Staging (1 min)

```bash
git checkout -b staging
git push -u origin staging
```

### 4. Pousser et Déployer (1 min)

```bash
# Faire un changement
git add .
git commit -m "feat: test auto-deploy"
git push origin staging

# ✨ GitHub Actions build automatiquement!
```

**C'est tout!** 🎉

---

## 📦 Distribuer aux Testeurs

Envoyer ce lien aux testeurs:

```
https://github.com/galnir/Galpha/releases
```

---

## 🔄 Workflow Quotidien

```bash
# Matin: Nouvelle feature
git checkout -b feature/xyz
# ... code ...
git commit -m "feat: nouvelle fonctionnalité XYZ"

# Après-midi: Deploy en recette
git checkout staging
git merge feature/xyz
git push

# ⏰ 15 min plus tard: Testeurs notifiés!
```

---

## 📚 Ressources

- **Guide Complet**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Guide Testeurs**: [README-TESTEURS.md](./README-TESTEURS.md)
- **Tauri Docs**: https://tauri.app/v1/guides/distribution/updater

---

**Questions?** Ouvrir une issue sur GitHub 💬
