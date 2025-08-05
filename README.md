Import collections:
```bash
sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_collections.sql
```

Import pigments:
```bash
sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_pigments.sql
```


Import papers:
```bash
sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_papers.sql
```

# Catalogue Raisonné - Application Desktop

Application desktop pour artistes peintres permettant de constituer, visualiser, enrichir et sauvegarder un catalogue raisonné d'œuvres.

## 🚀 Fonctionnalités

### ✅ Déjà implémentées
- **Gestion complète des œuvres** : création, modification, suppression
- **Gestion des collections, pigments et papiers** : interface complète de CRUD
- **Recherche avancée** : texte intégral + filtres par pigments, papiers, collections
- **Import d'images** : drag & drop, génération automatique de vignettes
- **Base de données locale** : SQLite avec FTS5 pour la recherche
- **Sauvegarde/Restauration** : export/import complet du catalogue
- **Interface moderne** : React + TypeScript + Tailwind CSS
- **Architecture Electron** : sécurisée avec contextBridge

### 🔧 Architecture Technique

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Electron + Node.js
- **Base de données**: SQLite avec better-sqlite3
- **Recherche**: SQLite FTS5 (Full Text Search)
- **Gestion d'images**: Sharp pour vignettes
- **State management**: Zustand
- **Build**: Vite + TypeScript

## 📦 Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
git clone <repository>
cd catalogue
npm install
```

### Développement
```bash
npm run dev
```

### Build de production
```bash
npm run build
```

### Package pour distribution
```bash
npm run package
```

## 🎨 Utilisation

### 1. Première utilisation
Au premier lancement, l'application crée automatiquement :
- Une base de données SQLite locale
- Des collections, pigments et papiers d'exemple (en mode développement)
- Les dossiers nécessaires pour le stockage des images

### 2. Gestion des œuvres
- **Créer** : Bouton "Nouvelle œuvre" dans la sidebar
- **Consulter** : Cliquer sur une œuvre dans la liste
- **Modifier** : Bouton "Éditer" sur l'œuvre ou dans le panneau de détail
- **Supprimer** : Bouton "Supprimer" dans le panneau de détail

### 3. Gestion des images
- **Ajouter** : Input file dans le panneau de détail d'une œuvre
- **Visualiser** : Vignettes générées automatiquement
- **Stockage** : Images originales préservées, vignettes créées

### 4. Recherche et filtres
- **Recherche textuelle** : Titre, référence, description
- **Filtres** : Collections, pigments, papiers
- **Combinaison** : Tous les filtres sont combinables

### 5. Organisation
- **Collections** : Regroupement thématique des œuvres
- **Pigments** : Matériaux utilisés, associables aux œuvres
- **Papiers** : Supports utilisés, associables aux œuvres

### 6. Sauvegarde
- **Backup** : Crée un fichier ZIP avec base + images
- **Restauration** : Remplace complètement les données actuelles

## 📁 Structure des données

### Stockage local
```
~/Library/Application Support/catalogue/
├── catalogue.db           # Base SQLite
├── catalogue.db-wal      # Write-Ahead Log
├── catalogue.db-shm      # Shared Memory
└── catalogue/
    └── images/
        └── [artwork_id]/
            ├── originals/    # Images haute résolution
            └── thumbnails/   # Vignettes générées
```

### Schéma de base de données
- `artworks` : Œuvres principales
- `collections` : Collections thématiques
- `pigments` : Pigments/couleurs
- `papers` : Types de papier
- `artwork_images` : Images associées aux œuvres
- `artwork_pigments` : Associations œuvres-pigments
- `artwork_papers` : Associations œuvres-papiers
- `artworks_fts` : Index de recherche textuelle

## 🛠️ Développement

### Scripts disponibles
- `npm run dev` : Développement avec hot reload
- `npm run build` : Build de production
- `npm run build:main` : Build du process principal uniquement
- `npm run package` : Package sans installeur
- `npm run lint` : Vérification ESLint

### Ajout de fonctionnalités

#### Nouveau handler IPC
1. Ajouter dans `src/main/ipc/handlers.ts`
2. Exposer dans `src/main/preload.ts`
3. Typer dans `src/renderer/types/global.d.ts`
4. Utiliser avec `callApi()` dans le renderer

#### Nouveau composant React
1. Créer dans `src/renderer/components/`
2. Importer les types depuis `src/renderer/types/`
3. Utiliser `callApi()` pour les appels API
4. Utiliser Tailwind pour le style

## 🔒 Sécurité

- **Context Isolation** : Activée par défaut
- **Node Integration** : Désactivée dans le renderer
- **Context Bridge** : API sécurisée exposée
- **File System** : Accès contrôlé via IPC

## ⚡ Performance

- **Images** : Vignettes générées asynchroniquement
- **Base de données** : WAL mode pour performance
- **Search** : Index FTS5 pour recherche rapide
- **UI** : Lazy loading des images
- **Memory** : Cache LRU pour les vignettes (à implémenter)

## 🧪 Tests

### Données de test
En mode développement, l'application crée automatiquement :
- 3 collections d'exemple
- 8 pigments courants
- 5 types de papier

### Test manuel
1. Créer une œuvre
2. Ajouter des images
3. Associer pigments/papiers
4. Tester la recherche
5. Faire une sauvegarde
6. Tester la restauration

## 📝 TODO

### Fonctionnalités manquantes
- [ ] Drag & drop d'images direct sur les œuvres
- [ ] Visualiseur d'images en grand format
- [ ] Export PDF du catalogue
- [ ] Filtre par date/période
- [ ] Statistiques du catalogue
- [ ] Import/export CSV des métadonnées
- [ ] Gestion des mots-clés/tags
- [ ] Historique des modifications

### Améliorations techniques
- [ ] Cache LRU pour les images
- [ ] Virtualisation de la liste d'œuvres
- [ ] Progressive Web App features
- [ ] Tests automatisés
- [ ] CI/CD pipeline
- [ ] Logging avancé
- [ ] Gestion d'erreurs améliorée

### UX/UI
- [ ] Thème sombre
- [ ] Raccourcis clavier
- [ ] Tour guidé
- [ ] Animations de transition
- [ ] Responsive design (tablette)

## 📄 Licence

Private - Usage personnel uniquement

## 👨‍💻 Développeur

Application développée pour un usage personnel d'artiste peintre.
