import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GridCell, BuildingType, TileOrientation, DecorativeObjectType } from '@/types/domain'
import {
  loadGameConfig,
  loadBuildingsConfig,
  loadDecorativeObjectsConfig,
} from '@/utils/config-loader'
import { useGameStore } from './game-store'
import { useUIStore } from './ui-store'
import { seededRandom } from '@/utils/math'

interface WorldStore {
  grid: GridCell[][]
  selectedBuilding: BuildingType | null // Bâtiment à placer depuis le shop
  selectedPlacedBuilding: { x: number; y: number } | null // Bâtiment placé sélectionné
  placementRotation: TileOrientation
  hoveredCell: { x: number; y: number } | null
  isMovingBuilding: boolean // Mode déplacement activé

  // Actions
  initializeGrid: () => Promise<void>
  placeBuilding: (
    x: number,
    y: number,
    type: BuildingType,
    orientation: TileOrientation
  ) => Promise<boolean>
  removeBuilding: (x: number, y: number) => Promise<void>
  removeDecorativeObject: (x: number, y: number) => Promise<boolean>
  setSelectedBuilding: (type: BuildingType | null) => void
  setSelectedPlacedBuilding: (position: { x: number; y: number } | null) => void
  setIsMovingBuilding: (isMoving: boolean) => void
  rotatePlacement: () => void
  setHoveredCell: (cell: { x: number; y: number } | null) => void
  loadGrid: (grid: GridCell[][]) => void
  moveBuilding: (fromX: number, fromY: number, toX: number, toY: number) => Promise<boolean>
}

function createEmptyGrid(size: number): GridCell[][] {
  const grid: GridCell[][] = []
  for (let y = 0; y < size; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < size; x++) {
      row[x] = {
        x,
        y,
        buildingType: null,
        decorativeObject: null,
        orientation: 0,
      }
    }
    grid[y] = row
  }
  return grid
}

// Fonction pour placer des objets décoratifs initiaux de manière aléatoire mais déterministe (basée sur le seed)
function placeInitialDecorativeObjects(grid: GridCell[][]): void {
  const gridSize = grid.length
  if (gridSize === 0) return

  // Récupérer le seed du jeu pour rendre le placement déterministe
  const seed = useGameStore.getState().seed
  const random = seededRandom(seed)

  // Créer un Set pour éviter les doublons de positions
  const occupiedPositions = new Set<string>()

  // Fonction pour obtenir une position aléatoire libre
  // Réduire la zone de placement de 10 cases sur chaque bord pour éviter que les objets soient trop près des bords
  const margin = 3
  const minX = margin
  const minY = margin
  const maxX = gridSize - margin
  const maxY = gridSize - margin
  const availableWidth = maxX - minX
  const availableHeight = maxY - minY

  const getRandomPosition = (): { x: number; y: number } | null => {
    let attempts = 0
    const maxAttempts = availableWidth * availableHeight // Limite pour éviter une boucle infinie

    while (attempts < maxAttempts) {
      const x = Math.floor(random() * availableWidth) + minX
      const y = Math.floor(random() * availableHeight) + minY
      const key = `${x}-${y}`

      if (!occupiedPositions.has(key) && grid[y]?.[x]) {
        occupiedPositions.add(key)
        return { x, y }
      }
      attempts++
    }

    return null // Aucune position libre trouvée
  }

  // Récupérer les valeurs par défaut depuis le store UI
  const treeCount = useUIStore.getState().defaultTreeCount
  const rockCount = useUIStore.getState().defaultRockCount

  // Placer les arbres
  for (let i = 0; i < treeCount; i++) {
    const position = getRandomPosition()
    if (position) {
      const cell = grid[position.y]?.[position.x]
      if (cell) {
        cell.decorativeObject = 'tree'
      }
    }
  }

  // Placer les rochers
  for (let i = 0; i < rockCount; i++) {
    const position = getRandomPosition()
    if (position) {
      const cell = grid[position.y]?.[position.x]
      if (cell) {
        cell.decorativeObject = 'rock'
      }
    }
  }
}

export const useWorldStore = create<WorldStore>()(
  immer((set, get) => ({
    grid: [],
    selectedBuilding: null,
    selectedPlacedBuilding: null,
    placementRotation: 0,
    hoveredCell: null,
    isMovingBuilding: false,

    initializeGrid: async () => {
      const gameConfig = await loadGameConfig()
      const newGrid = createEmptyGrid(gameConfig.gridSize)
      placeInitialDecorativeObjects(newGrid)
      set(state => {
        state.grid = newGrid
      })
    },

    placeBuilding: async (x, y, type, orientation) => {
      const grid = get().grid
      const gridSize = grid.length
      if (gridSize === 0) return false

      // Charger la config du bâtiment pour connaître sa taille
      const buildingsConfig = await loadBuildingsConfig()
      const buildingConfig = buildingsConfig[type]
      if (!buildingConfig) return false

      const buildingSize = buildingConfig.size

      // Vérifier toutes les cellules que ce bâtiment occuperait
      const occupiedCells: { x: number; y: number }[] = []
      for (let dy = 0; dy < buildingSize[1]; dy++) {
        for (let dx = 0; dx < buildingSize[0]; dx++) {
          const nx = x + dx
          const ny = y + dy

          // Vérifier les limites
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            return false
          }

          // Vérifier si la cellule est occupée (bâtiment ou objet décoratif)
          if (grid[ny]?.[nx]?.buildingType !== null || grid[ny]?.[nx]?.decorativeObject !== null) {
            return false
          }

          occupiedCells.push({ x: nx, y: ny })
        }
      }

      // Si toutes les cellules sont libres, placer le bâtiment
      set(state => {
        for (const cell of occupiedCells) {
          const targetCell = state.grid[cell.y]?.[cell.x]
          if (targetCell) {
            targetCell.buildingType = type
            targetCell.orientation = orientation
          }
        }
      })
      return true
    },

    removeBuilding: async (x, y) => {
      const grid = get().grid
      const cell = grid[y]?.[x]
      if (!cell?.buildingType) return

      // Charger la config pour connaître la taille du bâtiment
      const buildingsConfig = await loadBuildingsConfig()
      const buildingConfig = buildingsConfig[cell.buildingType]
      if (!buildingConfig) return

      const buildingSize = buildingConfig.size
      const buildingType = cell.buildingType

      // Trouver le coin supérieur gauche du bâtiment
      // En remontant jusqu'à trouver une cellule qui n'a pas de cellule à gauche ou au-dessus
      // avec le même type/orientation
      let topLeftX = x
      let topLeftY = y

      // Remonter vers la gauche
      while (topLeftX > 0) {
        const leftCell = grid[topLeftY]?.[topLeftX - 1]
        if (leftCell?.buildingType === buildingType && leftCell?.orientation === cell.orientation) {
          topLeftX--
        } else {
          break
        }
      }

      // Remonter vers le haut
      while (topLeftY > 0) {
        const topCell = grid[topLeftY - 1]?.[topLeftX]
        if (topCell?.buildingType === buildingType && topCell?.orientation === cell.orientation) {
          topLeftY--
        } else {
          break
        }
      }

      // Rembourser la moitié du prix
      const refundAmount = Math.floor(buildingConfig.cost / 2)
      useGameStore.getState().addMoney(refundAmount)

      // Supprimer toutes les cellules occupées par ce bâtiment
      set(state => {
        for (let dy = 0; dy < buildingSize[1]; dy++) {
          for (let dx = 0; dx < buildingSize[0]; dx++) {
            const nx = topLeftX + dx
            const ny = topLeftY + dy
            if (state.grid[ny]?.[nx]) {
              state.grid[ny][nx].buildingType = null
              state.grid[ny][nx].orientation = 0
            }
          }
        }
        // Désélectionner le bâtiment si c'était celui-ci
        if (
          state.selectedPlacedBuilding?.x === topLeftX &&
          state.selectedPlacedBuilding?.y === topLeftY
        ) {
          state.selectedPlacedBuilding = null
          state.isMovingBuilding = false
        }
      })
    },

    setSelectedBuilding: type =>
      set(state => {
        state.selectedBuilding = type
        state.placementRotation = 0
        // Désélectionner le bâtiment placé si on sélectionne un nouveau bâtiment à placer
        if (type !== null) {
          state.selectedPlacedBuilding = null
          state.isMovingBuilding = false
        }
      }),

    setSelectedPlacedBuilding: position =>
      set(state => {
        state.selectedPlacedBuilding = position
        state.isMovingBuilding = false
        // Désélectionner le bâtiment à placer si on sélectionne un bâtiment placé
        if (position !== null) {
          state.selectedBuilding = null
        }
      }),

    setIsMovingBuilding: isMoving =>
      set(state => {
        state.isMovingBuilding = isMoving
      }),

    moveBuilding: async (fromX, fromY, toX, toY) => {
      const grid = get().grid
      const fromCell = grid[fromY]?.[fromX]
      if (!fromCell?.buildingType) return false

      // Charger la config
      const buildingsConfig = await loadBuildingsConfig()
      const buildingConfig = buildingsConfig[fromCell.buildingType]
      if (!buildingConfig) return false

      const buildingSize = buildingConfig.size
      const buildingType = fromCell.buildingType
      const orientation = fromCell.orientation

      // Trouver le coin supérieur gauche du bâtiment source
      let topLeftX = fromX
      let topLeftY = fromY

      while (topLeftX > 0) {
        const leftCell = grid[topLeftY]?.[topLeftX - 1]
        if (leftCell?.buildingType === buildingType && leftCell?.orientation === orientation) {
          topLeftX--
        } else {
          break
        }
      }

      while (topLeftY > 0) {
        const topCell = grid[topLeftY - 1]?.[topLeftX]
        if (topCell?.buildingType === buildingType && topCell?.orientation === orientation) {
          topLeftY--
        } else {
          break
        }
      }

      // Vérifier si le nouvel emplacement est valide
      const gridSize = grid.length
      for (let dy = 0; dy < buildingSize[1]; dy++) {
        for (let dx = 0; dx < buildingSize[0]; dx++) {
          const nx = toX + dx
          const ny = toY + dy

          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            return false
          }

          // Vérifier si la cellule est occupée (sauf si c'est une cellule du bâtiment source)
          const isSourceCell =
            nx >= topLeftX &&
            nx < topLeftX + buildingSize[0] &&
            ny >= topLeftY &&
            ny < topLeftY + buildingSize[1]

          if (
            !isSourceCell &&
            (grid[ny]?.[nx]?.buildingType !== null || grid[ny]?.[nx]?.decorativeObject !== null)
          ) {
            return false
          }
        }
      }

      // Déplacer le bâtiment
      set(state => {
        // Supprimer l'ancien bâtiment
        for (let dy = 0; dy < buildingSize[1]; dy++) {
          for (let dx = 0; dx < buildingSize[0]; dx++) {
            const nx = topLeftX + dx
            const ny = topLeftY + dy
            if (state.grid[ny]?.[nx]) {
              state.grid[ny][nx].buildingType = null
              state.grid[ny][nx].orientation = 0
            }
          }
        }

        // Placer le nouveau bâtiment
        for (let dy = 0; dy < buildingSize[1]; dy++) {
          for (let dx = 0; dx < buildingSize[0]; dx++) {
            const nx = toX + dx
            const ny = toY + dy
            if (state.grid[ny]?.[nx]) {
              state.grid[ny][nx].buildingType = buildingType
              state.grid[ny][nx].orientation = orientation
            }
          }
        }

        // Mettre à jour la sélection
        state.selectedPlacedBuilding = { x: toX, y: toY }
        state.isMovingBuilding = false
      })

      return true
    },

    rotatePlacement: () =>
      set(state => {
        state.placementRotation = ((state.placementRotation + 1) % 4) as TileOrientation
      }),

    setHoveredCell: cell =>
      set(state => {
        state.hoveredCell = cell
      }),

    loadGrid: newGrid =>
      set(state => {
        state.grid = newGrid
      }),

    removeDecorativeObject: async (x, y) => {
      const grid = get().grid
      const cell = grid[y]?.[x]
      if (!cell?.decorativeObject) return false

      const decorativeObjectsConfig = await loadDecorativeObjectsConfig()
      const objectConfig = decorativeObjectsConfig.find(obj => obj.id === cell.decorativeObject)
      if (!objectConfig) return false

      const money = useGameStore.getState().money
      if (money < objectConfig.destructionCost) {
        return false // Pas assez d'argent
      }

      // Déduire le coût de destruction
      useGameStore.getState().addMoney(-objectConfig.destructionCost)

      // Supprimer l'objet décoratif
      set(state => {
        if (state.grid[y]?.[x]) {
          state.grid[y][x].decorativeObject = null
        }
      })

      return true
    },
  }))
)
