import type { GridCell, BuildingType, TileOrientation } from '@/types/domain'
import { canPlaceBuilding, isInUnlockedZone } from '@/utils/validation'
import type { BuildingConfig } from '@/types/domain'

export interface PlacementResult {
  success: boolean
  reason?: string
}

export function validatePlacement(
  grid: GridCell[][],
  x: number,
  y: number,
  buildingType: BuildingType,
  buildingConfig: BuildingConfig,
  gridSize: number,
  unlockedZones: Array<{ x: number; y: number; width: number; height: number }>
): PlacementResult {
  // Check if position is in unlocked zone
  if (!isInUnlockedZone(x, y, unlockedZones)) {
    return { success: false, reason: 'Zone verrouillée' }
  }

  // Check if can place building at this position
  if (
    !canPlaceBuilding(
      grid,
      x,
      y,
      buildingConfig.size[0],
      buildingConfig.size[1],
      gridSize
    )
  ) {
    return { success: false, reason: 'Position invalide' }
  }

  // Check road requirement
  if (buildingConfig.requiresRoad) {
    const hasRoad = checkRoadAccess(grid, x, y, gridSize)
    if (!hasRoad) {
      return { success: false, reason: 'Route requise' }
    }
  }

  return { success: true }
}

function checkRoadAccess(
  grid: GridCell[][],
  x: number,
  y: number,
  gridSize: number
): boolean {
  const neighbors = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      const cell = grid[ny]?.[nx]
      if (cell?.buildingType === 'road') {
        return true
      }
    }
  }

  return false
}

export function placeBuilding(
  grid: GridCell[][],
  x: number,
  y: number,
  buildingType: BuildingType,
  orientation: TileOrientation,
  buildingConfig: BuildingConfig
): boolean {
  const gridSize = grid.length
  const validation = validatePlacement(
    grid,
    x,
    y,
    buildingType,
    buildingConfig,
    gridSize,
    [] // unlockedZones - will be passed from store
  )

  if (!validation.success) {
    return false
  }

  // Place building
  for (let dy = 0; dy < buildingConfig.size[1]; dy++) {
    for (let dx = 0; dx < buildingConfig.size[0]; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (grid[ny]?.[nx]) {
        grid[ny][nx].buildingType = buildingType
        grid[ny][nx].orientation = orientation
      }
    }
  }

  return true
}

