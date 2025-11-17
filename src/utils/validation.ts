import type { BuildingType, GridCell } from '@/types/domain'

export function isValidPosition(
  x: number,
  y: number,
  gridSize: number
): boolean {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize
}

export function canPlaceBuilding(
  grid: GridCell[][],
  x: number,
  y: number,
  width: number,
  height: number,
  gridSize: number
): boolean {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (!isValidPosition(nx, ny, gridSize)) {
        return false
      }
      if (grid[ny]?.[nx]?.buildingType !== null) {
        return false
      }
    }
  }
  return true
}

