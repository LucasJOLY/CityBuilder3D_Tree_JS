# Architecture du Projet City Builder 3D

## Vue d'ensemble

Ce projet est un jeu de gestion type city-builder en 3D construit avec React, TypeScript, Three.js (via react-three-fiber), et Zustand pour la gestion d'état.

## Structure du Projet

```
/src
  /app            -> Point d'entrée React, routes, providers
  /core           -> Moteur 3D: Canvas r3f, caméra, raycaster
  /world          -> Système de grille, placement, pathfinding
  /sim            -> Simulation: économie, bonheur, politiques, état de la ville
  /ui             -> Composants React pour l'interface utilisateur
  /assets         -> Modèles 3D, textures, polices
  /config         -> Fichiers JSON de configuration
  /utils          -> Utilitaires: math, sérialisation, validation
  /types          -> Types TypeScript (domain, DTO)
  /stores         -> Stores Zustand pour l'état global
```

## Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **3D**: three.js via @react-three/fiber + @react-three/drei
- **State Management**: Zustand + Immer
- **UI**: Tailwind CSS + Framer Motion
- **Validation**: Zod
- **Tests**: Vitest + Testing Library

## Architecture des Stores

### GameStore (`/stores/game-store.ts`)
Gère l'état du jeu:
- Argent, citoyens, bonheur
- Impôts actuels
- Politiques actives
- Zones débloquées
- Seed RNG

### WorldStore (`/stores/world-store.ts`)
Gère l'état du monde 3D:
- Grille de cellules
- Bâtiments placés
- Sélection de bâtiment en cours
- Rotation de placement

### UIStore (`/stores/ui-store.ts`)
Gère l'état de l'interface:
- Écran actuel (menu/game)
- Modals ouverts (shop, taxes, policies, zones, admin)

## Système de Grille

La grille est représentée par un tableau 2D de `GridCell`:
- Chaque cellule contient: position (x, y), type de bâtiment, orientation
- Placement "snap to grid" via raycaster
- Validation de placement (zone débloquée, route requise, etc.)

## Système de Simulation

### Économie (`/sim/economy.ts`)
- Calcul des revenus mensuels basés sur:
  - Nombre de citoyens
  - Taux d'imposition
  - Multiplicateurs de politiques
  - Bonus de bonheur
- Calcul des dépenses (maintenance des bâtiments)

### Bonheur (`/sim/happiness.ts`)
- Facteurs: parcs, services (hôpitaux/écoles), politiques, criminalité
- Calcul de couverture (distance Manhattan)
- Bonus/malus selon les politiques actives

### État de la Ville (`/sim/citystate.ts`)
- Statistiques: citoyens, capacités, couverture
- Calcul de la criminalité
- Génération des demandes citoyennes

## Système de Sauvegarde

- Sauvegarde dans localStorage
- Format: JSON sérialisé avec état du jeu + grille
- Gestion de plusieurs slots de sauvegarde
- Export/Import JSON (optionnel)

## Performance

- Instanciation de meshes pour routes/maisons (à implémenter)
- LOD/culling simple
- Modèles low-poly
- Optimisation des re-renders React (memo, useMemo)

## Extensibilité

- Configuration via JSON (buildings, policies, economy, game)
- Système de plugins pour nouveaux bâtiments
- Support i18n basique (clés/valeurs)
- Architecture modulaire pour faciliter l'ajout de fonctionnalités

