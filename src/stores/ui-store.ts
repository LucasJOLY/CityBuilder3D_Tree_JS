import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type Screen = 'menu' | 'game'

interface UIStore {
  currentScreen: Screen
  isShopOpen: boolean
  isTaxesOpen: boolean
  isPoliciesOpen: boolean
  isAdminOpen: boolean
  isLoansOpen: boolean
  adminCode: string
  skyboxId: string
  isPaused: boolean
  isGameOver: boolean
  isLoading: boolean
  defaultTreeCount: number
  defaultRockCount: number

  // Actions
  setScreen: (screen: Screen) => void
  setIsLoading: (loading: boolean) => void
  openShop: () => void
  closeShop: () => void
  openTaxes: () => void
  closeTaxes: () => void
  openPolicies: () => void
  closePolicies: () => void
  openAdmin: () => void
  closeAdmin: () => void
  openLoans: () => void
  closeLoans: () => void
  setAdminCode: (code: string) => void
  setSkyboxId: (skyboxId: string) => void
  setIsPaused: (paused: boolean) => void
  togglePause: () => void
  closeAllModals: () => void
  setGameOver: (isOver: boolean) => void
  setDefaultTreeCount: (count: number) => void
  setDefaultRockCount: (count: number) => void
}

// Charger le skyboxId depuis localStorage au démarrage
const getInitialSkyboxId = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('citybuilder_skybox')
    if (saved) return saved
  }
  return 'default'
}

// Charger les paramètres d'objets décoratifs depuis localStorage
const getInitialDecorativeObjectsSettings = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('citybuilder_decorative_objects')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          treeCount: parsed.treeCount ?? 40,
          rockCount: parsed.rockCount ?? 10,
        }
      } catch {
        // En cas d'erreur, utiliser les valeurs par défaut
      }
    }
  }
  return { treeCount: 40, rockCount: 10 }
}

const initialDecorativeSettings = getInitialDecorativeObjectsSettings()

export const useUIStore = create<UIStore>()(
  immer(set => ({
    currentScreen: 'menu',
    isShopOpen: false,
    isTaxesOpen: false,
    isPoliciesOpen: false,
    isAdminOpen: false,
    isLoansOpen: false,
    adminCode: '',
    skyboxId: getInitialSkyboxId(),
    isPaused: false,
    isGameOver: false,
    isLoading: false,
    defaultTreeCount: initialDecorativeSettings.treeCount,
    defaultRockCount: initialDecorativeSettings.rockCount,

    setScreen: screen =>
      set(state => {
        state.currentScreen = screen
        state.closeAllModals()
      }),

    setIsLoading: loading =>
      set(state => {
        state.isLoading = loading
      }),

    openShop: () =>
      set(state => {
        state.isShopOpen = true
      }),

    closeShop: () =>
      set(state => {
        state.isShopOpen = false
      }),

    openTaxes: () =>
      set(state => {
        state.isTaxesOpen = true
      }),

    closeTaxes: () =>
      set(state => {
        state.isTaxesOpen = false
      }),

    openPolicies: () =>
      set(state => {
        state.isPoliciesOpen = true
      }),

    closePolicies: () =>
      set(state => {
        state.isPoliciesOpen = false
      }),

    openAdmin: () =>
      set(state => {
        state.isAdminOpen = true
      }),

    closeAdmin: () =>
      set(state => {
        state.isAdminOpen = false
        state.adminCode = ''
      }),

    openLoans: () =>
      set(state => {
        state.isLoansOpen = true
      }),

    closeLoans: () =>
      set(state => {
        state.isLoansOpen = false
      }),

    setAdminCode: code =>
      set(state => {
        state.adminCode = code
      }),

    setSkyboxId: skyboxId =>
      set(state => {
        state.skyboxId = skyboxId
        if (typeof window !== 'undefined') {
          localStorage.setItem('citybuilder_skybox', skyboxId)
        }
      }),

    setIsPaused: paused =>
      set(state => {
        state.isPaused = paused
      }),

    togglePause: () =>
      set(state => {
        state.isPaused = !state.isPaused
      }),

    closeAllModals: () =>
      set(state => {
        state.isShopOpen = false
        state.isTaxesOpen = false
        state.isPoliciesOpen = false
        state.isAdminOpen = false
        state.isLoansOpen = false
      }),

    setGameOver: isOver =>
      set(state => {
        state.isGameOver = isOver
        if (isOver) {
          state.isPaused = true
        }
      }),

    setDefaultTreeCount: count =>
      set(state => {
        state.defaultTreeCount = Math.max(0, Math.min(200, count))
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('citybuilder_decorative_objects')
          const settings = saved ? JSON.parse(saved) : {}
          settings.treeCount = state.defaultTreeCount
          localStorage.setItem('citybuilder_decorative_objects', JSON.stringify(settings))
        }
      }),

    setDefaultRockCount: count =>
      set(state => {
        state.defaultRockCount = Math.max(0, Math.min(30, count))
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('citybuilder_decorative_objects')
          const settings = saved ? JSON.parse(saved) : {}
          settings.rockCount = state.defaultRockCount
          localStorage.setItem('citybuilder_decorative_objects', JSON.stringify(settings))
        }
      }),
  }))
)
