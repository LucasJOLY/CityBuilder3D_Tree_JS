import type { GameState, GridCell } from '@/types/domain'

export function serializeGameState(
  gameState: GameState,
  grid: GridCell[][]
): string {
  return JSON.stringify({
    gameState,
    grid,
  })
}

export function deserializeGameState(
  data: string
): { gameState: GameState; grid: GridCell[][] } {
  return JSON.parse(data)
}

