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

- **Clic gauche** : Placer/inspecter
- **Clic droit + glisser** : Déplacer la caméra
- **Molette** : Zoomer/dézoomer
- **R** : Tourner le bâtiment sélectionné de 90°
- **A** : Ouvrir le menu admin (code : `ADMIN123`)
- **S** : Sauvegarder la partie
- **Espace** : Mettre en pause / reprendre
- **1**, **2**, **3**, **4**, **5** ou **Pavé numérique 1-5** : Changer la vitesse du jeu (1 à 5)
  - (Claviers FR : **&**, **é**, **"**, **'**, **(** pour 1-5)
- **ESC** : Annuler / fermer le menu ou la sélection

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **Three.js** via **@react-three/fiber**
- **Zustand** pour la gestion d'état
