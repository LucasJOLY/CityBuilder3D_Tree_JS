import type { BuildingType } from '@/types/domain'

/**
 * Cache des modèles qui ont échoué au chargement
 * Utilisé pour éviter de réessayer de charger des modèles inexistants
 */
const failedModels = new Set<string>()

/**
 * Mapping des types de bâtiments vers leurs fichiers de modèles .glb
 * Les fichiers doivent être placés dans le dossier public/models/
 *
 * Note: Si un modèle n'existe pas, le système utilisera automatiquement
 * un cube coloré comme fallback.
 *
 * IMPORTANT: Désactivez temporairement les modèles qui n'existent pas encore
 * en les retirant de cet objet pour éviter les erreurs de chargement.
 */
export const buildingModelPaths: Partial<Record<BuildingType, string>> = {
  house: '/models/house.glb',
  apartment: '/models/apartment.glb',
  hospital: '/models/hospital.glb',
  school: '/models/school.glb',
  police: '/models/police.glb',
  fire: '/models/fire.glb',
  park: '/models/park.glb',
  parkLarge: '/models/parkLarge.glb',
  monument: '/models/monument.glb',
  skycraper: '/models/skycraper.glb',
  prison: '/models/prison.glb',
  church: '/models/church.glb',
  bar: '/models/bar.glb',
  road: '/models/roads/road.glb',
  roadTurn: '/models/roads/roadTurn.glb',
}

/**
 * Marque un modèle comme ayant échoué
 */
export function markModelAsFailed(modelPath: string): void {
  failedModels.add(modelPath)
}

/**
 * Vérifie si un modèle a échoué au chargement
 */
export function isModelFailed(modelPath: string): boolean {
  return failedModels.has(modelPath)
}

/**
 * Vérifie si un modèle existe pour un type de bâtiment donné
 * ET si le modèle n'a pas déjà échoué au chargement
 */
export function hasModel(type: BuildingType): boolean {
  if (!(type in buildingModelPaths)) {
    return false
  }
  const modelPath = buildingModelPaths[type]!
  return !failedModels.has(modelPath)
}
