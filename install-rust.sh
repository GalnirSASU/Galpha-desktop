#!/bin/bash
# Script d'installation automatique de Rust

echo "🦀 Installation de Rust pour Galpha Desktop..."
echo ""

# Installer Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Charger l'environnement Rust
source $HOME/.cargo/env

# Vérifier l'installation
echo ""
echo "✅ Vérification de l'installation..."
rustc --version
cargo --version

echo ""
echo "✅ Rust installé avec succès !"
echo ""
echo "Vous pouvez maintenant lancer Galpha avec:"
echo "  npm run tauri dev"
echo ""
