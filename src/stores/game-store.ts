import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState, BuildingType, TileOrientation } from '@/types/domain'
import { loadGameConfig, loadEconomyConfig } from '@/utils/config-loader'

interface GameStore extends GameState {
  // Actions
  setMoney: (amount: number) => void
  addMoney: (amount: number) => void
  setCitizens: (count: number) => void
  addCitizens: (count: number) => void
  setHappiness: (value: number) => void
  setTax: (value: number) => void
  togglePolicy: (policyId: string) => void
  unlockZone: (zone: { x: number; y: number; width: number; height: number }) => void
  reset: () => Promise<void>
  loadState: (state: GameState) => void
}

const initialState: GameState = {
  money: 0,
  citizens: 0,
  happiness: 50,
  currentTax: 10,
  activePolicies: [],
  unlockedZones: [],
  seed: 0,
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialState,

    setMoney: (amount) =>
      set((state) => {
        state.money = Math.max(0, amount)
      }),

    addMoney: (amount) =>
      set((state) => {
        state.money = Math.max(0, state.money + amount)
      }),

    setCitizens: (count) =>
      set((state) => {
        state.citizens = Math.max(0, count)
      }),

    addCitizens: (count) =>
      set((state) => {
        state.citizens = Math.max(0, state.citizens + count)
      }),

    setHappiness: (value) =>
      set((state) => {
        state.happiness = Math.max(0, Math.min(100, value))
      }),

    setTax: (value) =>
      set(async (state) => {
        const economy = await loadEconomyConfig()
        state.currentTax = Math.max(
          economy.taxMin,
          Math.min(economy.taxMax, value)
        )
      }),

    togglePolicy: (policyId) =>
      set((state) => {
        const index = state.activePolicies.indexOf(policyId)
        if (index === -1) {
          state.activePolicies.push(policyId)
        } else {
          state.activePolicies.splice(index, 1)
        }
      }),

    unlockZone: (zone) =>
      set((state) => {
        state.unlockedZones.push({ ...zone, unlocked: true })
      }),

    reset: async () =>
      set(async (state) => {
        const gameConfig = await loadGameConfig()
        state.money = gameConfig.startMoney
        state.citizens = gameConfig.startCitizens
        state.happiness = 50
        state.currentTax = 10
        state.activePolicies = []
        state.unlockedZones = gameConfig.unlockedZones.map((z) => ({
          ...z,
          unlocked: true,
        }))
        state.seed = Math.floor(Math.random() * 1000000)
      }),

    loadState: (newState) =>
      set((state) => {
        Object.assign(state, newState)
      }),
  }))
)

