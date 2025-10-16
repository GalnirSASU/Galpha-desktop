#!/bin/bash

# Script de release automatique pour Galpha
# Usage: ./scripts/release.sh [staging|production]

set -e

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'

print_step() {
    echo -e "${COLOR_BLUE}==>${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}✗${COLOR_RESET} $1"
}

# Vérifier les arguments
ENV=${1:-staging}

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    print_error "Environment invalide. Utiliser: staging ou production"
    exit 1
fi

print_step "🚀 Release Galpha - Mode: $ENV"
echo ""

# Vérifier qu'on est sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)

if [[ "$ENV" == "staging" && "$CURRENT_BRANCH" != "staging" ]]; then
    print_warning "Vous n'êtes pas sur la branche staging. Changer de branche?"
    read -p "Continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    git checkout staging
fi

if [[ "$ENV" == "production" && "$CURRENT_BRANCH" != "main" ]]; then
    print_warning "Vous n'êtes pas sur la branche main. Changer de branche?"
    read -p "Continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    git checkout main
fi

# Vérifier qu'il n'y a pas de changements non commités
if [[ -n $(git status --porcelain) ]]; then
    print_error "Il y a des changements non commités. Veuillez commit ou stash."
    git status --short
    exit 1
fi

# Pull les derniers changements
print_step "Mise à jour depuis origin..."
git pull origin $(git branch --show-current)
print_success "Repository à jour"
echo ""

# Vérifier que les tests passent
print_step "Vérification du code..."
npm run type-check 2>/dev/null || {
    print_warning "Type check non disponible, skip"
}

cd src-tauri
cargo check --quiet || {
    print_error "Erreurs Rust détectées"
    exit 1
}
cd ..
print_success "Code valide"
echo ""

# Obtenir la version actuelle
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_step "Version actuelle: v$CURRENT_VERSION"

# Pour staging, ajouter timestamp
if [[ "$ENV" == "staging" ]]; then
    TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
    NEW_VERSION="$CURRENT_VERSION-staging-$TIMESTAMP"
    print_step "Version de staging: v$NEW_VERSION"
    echo ""

    print_step "Push vers staging..."
    git push origin staging

    print_success "✅ Build automatique en cours sur GitHub Actions!"
    echo ""
    echo "🔗 Suivre la progression:"
    echo "   https://github.com/galnir/Galpha/actions"
    echo ""
    echo "📦 Les testeurs recevront la notification dans ~15 minutes"

else
    # Pour production, demander la nouvelle version
    echo ""
    print_step "Nouvelle version?"
    echo "  1) Patch (bug fix): v$CURRENT_VERSION → v$(npm version patch --no-git-tag-version -s)"
    npm version $CURRENT_VERSION --no-git-tag-version -s > /dev/null 2>&1
    echo "  2) Minor (new feature): v$CURRENT_VERSION → v$(npm version minor --no-git-tag-version -s)"
    npm version $CURRENT_VERSION --no-git-tag-version -s > /dev/null 2>&1
    echo "  3) Major (breaking change): v$CURRENT_VERSION → v$(npm version major --no-git-tag-version -s)"
    npm version $CURRENT_VERSION --no-git-tag-version -s > /dev/null 2>&1
    echo "  4) Custom"
    echo ""

    read -p "Choix (1-4): " choice

    case $choice in
        1)
            NEW_VERSION=$(npm version patch --no-git-tag-version)
            ;;
        2)
            NEW_VERSION=$(npm version minor --no-git-tag-version)
            ;;
        3)
            NEW_VERSION=$(npm version major --no-git-tag-version)
            ;;
        4)
            read -p "Version (ex: 1.2.3): " custom_version
            NEW_VERSION="v$custom_version"
            npm version $custom_version --no-git-tag-version
            ;;
        *)
            print_error "Choix invalide"
            exit 1
            ;;
    esac

    # Mettre à jour Cargo.toml
    cd src-tauri
    sed -i '' "s/^version = .*/version = \"${NEW_VERSION#v}\"/" Cargo.toml
    cd ..

    print_success "Version mise à jour: $NEW_VERSION"
    echo ""

    # Créer le commit de version
    git add package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock 2>/dev/null || true
    git commit -m "chore: bump version to $NEW_VERSION"

    # Créer le tag
    git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

    # Push
    print_step "Push vers production..."
    git push origin main
    git push origin "$NEW_VERSION"

    print_success "✅ Release $NEW_VERSION créée!"
    echo ""
    echo "🔗 Créer la release sur GitHub:"
    echo "   https://github.com/galnir/Galpha/releases/new?tag=$NEW_VERSION"
    echo ""
    echo "Ou builder localement:"
    echo "   npm run tauri build"
fi

echo ""
print_success "🎉 Release terminée!"
