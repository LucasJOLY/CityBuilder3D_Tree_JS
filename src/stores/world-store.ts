import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GridCell, BuildingType, TileOrientation } from '@/types/domain'
import { loadGameConfig } from '@/utils/config-loader'

interface WorldStore {
  grid: GridCell[][]
  selectedBuilding: BuildingType | null
  placementRotation: TileOrientation
  hoveredCell: { x: number; y: number } | null

  // Actions
  initializeGrid: () => Promise<void>
  placeBuilding: (
    x: number,
    y: number,
    type: BuildingType,
    orientation: TileOrientation
  ) => boolean
  removeBuilding: (x: number, y: number) => void
  setSelectedBuilding: (type: BuildingType | null) => void
  rotatePlacement: () => void
  setHoveredCell: (cell: { x: number; y: number } | null) => void
  loadGrid: (grid: GridCell[][]) => void
}

function createEmptyGrid(size: number): GridCell[][] {
  const grid: GridCell[][] = []
  for (let y = 0; y < size; y++) {
    grid[y] = []
    for (let x = 0; x < size; x++) {
      grid[y][x] = {
        x,
        y,
        buildingType: null,
        orientation: 0,
      }
    }
  }
  return grid
}

export const useWorldStore = create<WorldStore>()(
  immer((set, get) => ({
    grid: [],
    selectedBuilding: null,
    placementRotation: 0,
    hoveredCell: null,

    initializeGrid: async () =>
      set(async (state) => {
        const gameConfig = await loadGameConfig()
        state.grid = createEmptyGrid(gameConfig.gridSize)
      }),

    placeBuilding: (x, y, type, orientation) => {
      const grid = get().grid
      if (!grid[y]?.[x]) return false

      // Simple placement for now - will add validation later
      if (grid[y][x].buildingType !== null) return false

      set((state) => {
        state.grid[y][x].buildingType = type
        state.grid[y][x].orientation = orientation
      })
      return true
    },

    removeBuilding: (x, y) =>
      set((state) => {
        if (state.grid[y]?.[x]) {
          state.grid[y][x].buildingType = null
          state.grid[y][x].orientation = 0
        }
      }),

    setSelectedBuilding: (type) =>
      set((state) => {
        state.selectedBuilding = type
        state.placementRotation = 0
      }),

    rotatePlacement: () =>
      set((state) => {
        state.placementRotation = ((state.placementRotation + 1) % 4) as TileOrientation
      }),

    setHoveredCell: (cell) =>
      set((state) => {
        state.hoveredCell = cell
      }),

    loadGrid: (newGrid) =>
      set((state) => {
        state.grid = newGrid
      }),
  }))
)

