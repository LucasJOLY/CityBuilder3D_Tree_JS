import type { GridCell, BuildingType } from '@/types/domain'

export function getBuildingAt(grid: GridCell[][], x: number, y: number): BuildingType | null {
  return grid[y]?.[x]?.buildingType ?? null
}

export function getAllBuildingsOfType(
  grid: GridCell[][],
  type: BuildingType
): Array<{ x: number; y: number; cell: GridCell }> {
  const results: Array<{ x: number; y: number; cell: GridCell }> = []
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    if (!row) continue
    for (let x = 0; x < row.length; x++) {
      const cell = row[x]
      if (cell && cell.buildingType === type) {
        results.push({ x, y, cell })
      }
    }
  }
  return results
}

export function countBuildings(grid: GridCell[][]): Record<BuildingType, number> {
  const counts: Record<string, number> = {
    road: 0,
    roadTurn: 0,
    house: 0,
    apartment: 0,
    hospital: 0,
    school: 0,
    police: 0,
    fire: 0,
    park: 0,
    parkLarge: 0,
    monument: 0,
  }

  for (const row of grid) {
    for (const cell of row) {
      if (cell.buildingType) {
        counts[cell.buildingType] = (counts[cell.buildingType] || 0) + 1
      }
    }
  }

  return counts as Record<BuildingType, number>
}
