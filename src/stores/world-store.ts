import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GridCell, BuildingType, TileOrientation } from '@/types/domain'
import { loadGameConfig, loadBuildingsConfig } from '@/utils/config-loader'

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
        orientation: 0,
      }
    }
    grid[y] = row
  }
  return grid
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
      set(state => {
        state.grid = createEmptyGrid(gameConfig.gridSize)
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

          // Vérifier si la cellule est occupée
          if (grid[ny]?.[nx]?.buildingType !== null) {
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

          if (!isSourceCell && grid[ny]?.[nx]?.buildingType !== null) {
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
  }))
)
