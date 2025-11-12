# Game Design Document

## Concept

City Builder 3D est un jeu de gestion de ville en 3D où le joueur construit et gère une ville en plaçant des bâtiments sur une grille, gérant l'économie, les politiques et répondant aux besoins des citoyens.

## Mécaniques de Jeu

### Grille et Placement

- **Grille**: 50x50 par défaut (configurable)
- **Snap to Grid**: Tous les placements sont alignés sur la grille
- **Rotation**: Par pas de 90° (touche R)
- **Validation**: 
  - Zone débloquée requise
  - Route requise pour certains bâtiments
  - Pas de chevauchement

### Types de Bâtiments

#### Routes
- Coût: 5€
- Permet l'accès aux autres bâtiments
- Réseau routier nécessaire pour maisons/services

#### Résidentiel
- **Maison**: 50€, 4 citoyens
- Doit être reliée au réseau routier

#### Services
- **Hôpital**: 500€, capacité 100, couverture 10 cases
- **École**: 400€, capacité 80, couverture 8 cases
- **Commissariat**: 350€, couverture 12 cases, réduit criminalité
- **Pompiers**: 300€, couverture 10 cases

#### Loisirs
- **Parc**: 100€, bonheur +5%, couverture 5 cases
- **Monument**: 2000€, bonheur +15%, couverture 15 cases

### Économie

#### Revenus
- Base: `citoyens × impôt_base × (taux_impôt / 10) × multiplicateurs_politiques`
- Bonus bonheur: `+bonheur% × coeff_bonheur`
- Calcul mensuel (durée configurable, défaut: 30s)

#### Dépenses
- Maintenance par type de bâtiment
- Multiplicateurs selon politiques actives

#### Impôts
- Slider ajustable (min/max en config)
- Impact sur revenus et bonheur

### Bonheur

Facteurs influençant le bonheur (0-100%):
- **Base**: 50%
- **Parcs**: +5% si couvert
- **Monuments**: +15% si couvert
- **Services**: +2-3% selon couverture (hôpitaux/écoles)
- **Politiques**: Deltas selon politiques actives
- **Criminalité**: -0.5% par point de criminalité

Impact: Bonus revenus proportionnel au bonheur

### Politiques

Politiques activables/désactivables avec effets:
- Multiplicateurs taxes
- Deltas bonheur
- Réduction criminalité
- Multiplicateurs maintenance

Exemples:
- Taxes réduites: -20% taxes, +5% bonheur
- Financement police: -10% criminalité, +2% bonheur, +50% maintenance police
- Ville verte: +10% bonheur, +10% maintenance

### Zones

- Zones verrouillées au départ
- Achat débloque nouvelles parcelles
- Prix selon taille (petite/moyenne/grande)
- Affichage grisé pour zones verrouillées

### Demandes Citoyens

Générées automatiquement selon déficits:
- "Pas assez d'hôpitaux" (capacité < 80% citoyens)
- "Pas assez d'écoles" (capacité < 70% citoyens)
- "Couverture policière insuffisante" (< 80%)
- "Couverture pompiers insuffisante" (< 80%)
- "Criminalité élevée" (> 30%)

### Criminalité

Calcul:
- Base: 20%
- Réduction selon couverture police
- Modifications selon politiques
- Plage: 0-100%

## Contrôles

### Souris
- **Clic gauche**: Placer bâtiment (si sélectionné) / Inspecter
- **Clic droit + drag**: Pan caméra
- **Molette**: Zoom

### Clavier
- **R**: Rotation bâtiment sélectionné (90°)
- **A**: Ouvrir admin (avec code)
- **ESC**: Annuler placement / Fermer modal

### Caméra
- MapControls (drei): Pan, zoom, rotation limitée
- Vue "god view" (rotation limitée)
- Clamp pour rester dans la carte

## Système de Sauvegarde

### Format
```json
{
  "id": "save_1234567890",
  "name": "Ma partie",
  "timestamp": 1234567890,
  "gameState": {
    "money": 10000,
    "citizens": 100,
    "happiness": 75,
    "currentTax": 10,
    "activePolicies": ["low_taxes"],
    "unlockedZones": [...],
    "seed": 12345
  },
  "grid": [[...], [...]]
}
```

### Stockage
- localStorage (rapide)
- IndexedDB (optionnel, pour plus tard)
- Export/Import JSON

## Menu Admin

Accès: Touche A → Code admin

Cheats disponibles:
- Ajouter argent (+10k, +50k, +100k)
- Ajouter citoyens (+50, +100, +500)
- Définir bonheur (50%, 75%, 100%)
- Bypass contraintes (à implémenter)

## Progression

### Démarrage
- Argent initial: 10 000€
- Citoyens: 0
- Zone débloquée: 20x20 au centre

### Objectifs (implicites)
- Construire une ville prospère
- Maximiser le bonheur
- Équilibrer revenus/dépenses
- Répondre aux demandes citoyens

## Équilibrage

### Coûts
- Routes: 5€ (abordable)
- Maisons: 50€ (rentable avec impôts)
- Services: 300-500€ (investissement)
- Monuments: 2000€ (luxe)

### Maintenance
- Routes: 1€/mois
- Maisons: 2€/mois
- Services: 40-50€/mois
- Parcs: 5€/mois
- Monuments: 20€/mois

### Temps
- Mois de jeu: 30 secondes (configurable)
- Permet ajustements fréquents
- Feedback rapide sur décisions

