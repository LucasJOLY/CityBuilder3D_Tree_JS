import type { SaveSlot, GameState, GridCell } from '@/types/domain'
import { serializeGameState, deserializeGameState } from './serialize'

const SAVE_PREFIX = 'citybuilder_save_'

export async function saveGame(slotId: string, name: string): Promise<void> {
  const { useGameStore } = await import('@/stores/game-store')
  const { useWorldStore } = await import('@/stores/world-store')

  const gameState = useGameStore.getState()
  const grid = useWorldStore.getState().grid

  const saveData: SaveSlot = {
    id: slotId,
    name,
    timestamp: Date.now(),
    gameState: {
      money: gameState.money,
      citizens: gameState.citizens,
      happiness: gameState.happiness,
      currentTax: gameState.currentTax,
      activePolicies: [...gameState.activePolicies],
      unlockedZones: [...gameState.unlockedZones],
      seed: gameState.seed,
    },
    grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
  }

  localStorage.setItem(SAVE_PREFIX + slotId, JSON.stringify(saveData))
}

export async function loadGame(slotId: string): Promise<void> {
  const { useGameStore } = await import('@/stores/game-store')
  const { useWorldStore } = await import('@/stores/world-store')

  const saveDataStr = localStorage.getItem(SAVE_PREFIX + slotId)
  if (!saveDataStr) {
    throw new Error('Sauvegarde introuvable')
  }

  const saveData: SaveSlot = JSON.parse(saveDataStr)

  useGameStore.getState().loadState(saveData.gameState)
  useWorldStore.getState().loadGrid(saveData.grid)
}

export async function loadSaveSlots(): Promise<
  Array<{ id: string; name: string; timestamp: number }>
> {
  const slots: Array<{ id: string; name: string; timestamp: number }> = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(SAVE_PREFIX)) {
      try {
        const saveDataStr = localStorage.getItem(key)
        if (saveDataStr) {
          const saveData: SaveSlot = JSON.parse(saveDataStr)
          slots.push({
            id: saveData.id,
            name: saveData.name,
            timestamp: saveData.timestamp,
          })
        }
      } catch (e) {
        console.error('Erreur lors du chargement de la sauvegarde:', e)
      }
    }
  }

  return slots.sort((a, b) => b.timestamp - a.timestamp)
}

export async function deleteSaveSlot(slotId: string): Promise<void> {
  localStorage.removeItem(SAVE_PREFIX + slotId)
}

