# Guide d'Expérience Utilisateur

## Design System

### Couleurs
- **Primaire**: #f6741b (orange)
- **Fond**: Blanc par défaut, support dark mode prévu
- **Texte**: Gris foncé (#1f2937) sur fond clair

### Typographie
- **Police**: Montserrat (Google Fonts)
- **Tailles**: Responsive, hiérarchie claire (h1: 2xl, h2: xl, body: base)

### Composants UI

#### Boutons
- Arrondis: `rounded-2xl`
- Ombres: `shadow-lg` pour primaire, `shadow` pour secondaire
- Spacing: `p-4` minimum
- États: hover (scale 1.02), focus (ring), disabled (opacity 50%)

#### Modals
- Centré, max-width: 2xl
- Backdrop: noir semi-transparent (50%)
- Animation: fade + scale (Framer Motion)
- Fermeture: ESC ou clic backdrop

#### Cartes
- Background: blanc ou gris-50
- Border: 2px, arrondi xl
- Padding: généreux (p-4+)
- Hover: border-primary, scale léger

### HUD (Bas d'écran)

- Position: fixe en bas
- Background: blanc/95 avec backdrop-blur
- Contenu:
  - Stats (argent, citoyens, bonheur) à gauche
  - Actions (boutons) à droite
- Responsive: empilement vertical sur mobile

### Animations

- Transitions: 200-300ms
- Hover: scale 1.02-1.05
- Modals: fade + scale
- Toasts: slide-in depuis le bas

## Accessibilité

### Contraste
- Texte sur fond: ratio minimum 4.5:1
- Focus states: ring visible (2px, couleur primaire)

### Navigation Clavier
- Tab: navigation entre éléments interactifs
- Enter/Space: activation
- ESC: fermeture modals
- R: rotation bâtiment (en mode placement)

### Labels
- Tous les boutons ont des labels explicites
- Inputs ont des labels associés
- Icônes accompagnées de texte quand nécessaire

### Tailles Interactives
- Minimum 44x44px pour les zones cliquables
- Espacement suffisant entre éléments

## Responsive Design

### Breakpoints (Tailwind)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Adaptations
- HUD: empilement vertical sur mobile
- Modals: pleine largeur sur mobile
- Grille: zoom adaptatif selon taille écran

## Feedback Utilisateur

### Actions
- Confirmation visuelle immédiate (animation, couleur)
- Messages d'erreur clairs et contextuels
- Loading states pour actions asynchrones

### Informations
- Tooltips pour explications
- Badges pour statuts (actif, verrouillé, etc.)
- Indicateurs visuels (icônes, couleurs)

## Workflow Utilisateur

### Démarrage
1. Menu principal → Nouvelle partie ou Charger
2. Initialisation → Affichage grille vide
3. Tutoriel (optionnel) → Premiers pas

### Jeu
1. Ouvrir boutique → Sélectionner bâtiment
2. Placement → Clic sur grille, R pour rotation
3. Gestion → Impôts, politiques, zones
4. Sauvegarde → Bouton dédié ou auto-save

### Navigation
- Touche A → Admin (avec code)
- ESC → Annuler placement / Fermer modal
- Menu → Retour menu principal

