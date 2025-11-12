import type { GridCell } from '@/types/domain'
import { manhattanDistance } from '@/utils/math'

export interface PathNode {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: PathNode | null
}

export function findPath(
  grid: GridCell[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Array<{ x: number; y: number }> | null {
  const gridSize = grid.length
  const openSet: PathNode[] = []
  const closedSet = new Set<string>()

  const startNode: PathNode = {
    x: startX,
    y: startY,
    g: 0,
    h: manhattanDistance(startX, startY, endX, endY),
    f: 0,
    parent: null,
  }
  startNode.f = startNode.g + startNode.h

  openSet.push(startNode)

  while (openSet.length > 0) {
    let currentIndex = 0
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i
      }
    }

    const current = openSet.splice(currentIndex, 1)[0]
    const currentKey = `${current.x},${current.y}`
    closedSet.add(currentKey)

    if (current.x === endX && current.y === endY) {
      const path: Array<{ x: number; y: number }> = []
      let node: PathNode | null = current
      while (node) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      return path
    }

    const neighbors = [
      [current.x - 1, current.y],
      [current.x + 1, current.y],
      [current.x, current.y - 1],
      [current.x, current.y + 1],
    ]

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue

      const neighborKey = `${nx},${ny}`
      if (closedSet.has(neighborKey)) continue

      const cell = grid[ny]?.[nx]
      if (!cell || cell.buildingType !== 'road') continue

      const g = current.g + 1
      const h = manhattanDistance(nx, ny, endX, endY)
      const f = g + h

      const existingNode = openSet.find((n) => n.x === nx && n.y === ny)
      if (existingNode && g >= existingNode.g) continue

      const neighborNode: PathNode = {
        x: nx,
        y: ny,
        g,
        h,
        f,
        parent: current,
      }

      if (!existingNode) {
        openSet.push(neighborNode)
      } else {
        Object.assign(existingNode, neighborNode)
      }
    }
  }

  return null
}

export function floodFillRoads(
  grid: GridCell[][],
  startX: number,
  startY: number
): Set<string> {
  const gridSize = grid.length
  const visited = new Set<string>()
  const queue: Array<[number, number]> = [[startX, startY]]

  while (queue.length > 0) {
    const [x, y] = queue.shift()!
    const key = `${x},${y}`

    if (visited.has(key)) continue
    visited.add(key)

    const cell = grid[y]?.[x]
    if (!cell || cell.buildingType !== 'road') continue

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        const neighborKey = `${nx},${ny}`
        if (!visited.has(neighborKey)) {
          queue.push([nx, ny])
        }
      }
    }
  }

  return visited
}

