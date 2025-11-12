import type { GridCell, BuildingType } from '@/types/domain'

export function createGrid(size: number): GridCell[][] {
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

export function getCell(grid: GridCell[][], x: number, y: number): GridCell | null {
  return grid[y]?.[x] ?? null
}

export function setCell(
  grid: GridCell[][],
  x: number,
  y: number,
  buildingType: BuildingType | null,
  orientation: number = 0
): void {
  if (grid[y]?.[x]) {
    grid[y][x].buildingType = buildingType
    grid[y][x].orientation = orientation
  }
}

