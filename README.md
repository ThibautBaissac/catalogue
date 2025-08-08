Import collections:
```bash
sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_collections.sql

sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_pigments.sql

sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_papers.sql

sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_types.sql

sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_places.sql

sqlite3 "$(node -e "console.log(require('path').join(require('os').homedir(), 'Library', 'Application Support', 'catalogue', 'catalogue.db'))")" < seed_artworks.sql
```

### Scripts disponibles
```
npm run build:main

npx tsc src/main/main.ts src/main/preload.ts --outDir dist --target ES2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck
```

- `npm run dev` : Développement avec hot reload
- `npm run build` : Build de production
- `npm run build:main` : Build du process principal uniquement
- `npm run package` : Package sans installeur
- `npm run lint` : Vérification ESLint

# Manually rebuild the preload script:
tsc src/main/preload.ts --outDir dist --target E
S2020 --module commonjs --moduleResolution node --esModuleInterop --allowS
yntheticDefaultImports --skipLibCheck

### Package pour distribution
```bash
npm run package
```

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
