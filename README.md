# City Builder 3D

Un jeu de gestion de ville en 3D construit avec React, TypeScript et Three.js.

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

## 🎮 Comment Jouer

1. **Démarrer une partie**: Cliquez sur "Nouvelle partie" dans le menu principal
2. **Construire**: Ouvrez la boutique (bouton en bas), sélectionnez un bâtiment, puis cliquez sur la grille pour le placer
3. **Tourner**: Appuyez sur **R** pour faire tourner le bâtiment sélectionné de 90°
4. **Gérer**: Utilisez les boutons du HUD pour gérer les impôts, politiques et zones
5. **Sauvegarder**: Cliquez sur "Sauvegarder" pour enregistrer votre progression

### Contrôles

- **Clic gauche**: Placer/inspecter
- **Clic droit + drag**: Déplacer la caméra
- **Molette**: Zoomer
- **R**: Rotation (90°)
- **A**: Menu admin (code: `ADMIN123`)
- **ESC**: Annuler/fermer

## 📁 Structure du Projet

```
/src
  /app          -> Point d'entrée React
  /core         -> Moteur 3D (Canvas, caméra, raycaster)
  /world        -> Système de grille et placement
  /sim          -> Simulation (économie, bonheur, politiques)
  /ui           -> Composants d'interface utilisateur
  /config       -> Fichiers JSON de configuration
  /stores       -> Stores Zustand
  /types        -> Types TypeScript
  /utils        -> Utilitaires
/docs           -> Documentation
```

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **Three.js** via **@react-three/fiber**
- **Zustand** pour la gestion d'état
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Vite** comme build tool

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Guide UX](./docs/UX_GUIDELINES.md)
- [Game Design](./docs/GAME_DESIGN.md)

## 🎯 Fonctionnalités

- ✅ Placement de bâtiments sur grille
- ✅ Rotation des bâtiments (90°)
- ✅ Système économique (revenus/dépenses mensuels)
- ✅ Gestion du bonheur des citoyens
- ✅ Politiques activables
- ✅ Achat de zones
- ✅ Sauvegarde/chargement (localStorage)
- ✅ Menu admin avec cheats

## 🔧 Configuration

Les fichiers de configuration se trouvent dans `/src/config`:
- `buildings.json`: Types de bâtiments et leurs propriétés
- `economy.json`: Paramètres économiques
- `policies.json`: Politiques disponibles
- `game.json`: Configuration générale du jeu

## 📝 License

Ce projet est un exemple éducatif.

