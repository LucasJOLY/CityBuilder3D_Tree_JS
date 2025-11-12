import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type Screen = 'menu' | 'game'

interface UIStore {
  currentScreen: Screen
  isShopOpen: boolean
  isTaxesOpen: boolean
  isPoliciesOpen: boolean
  isZonesOpen: boolean
  isAdminOpen: boolean
  adminCode: string

  // Actions
  setScreen: (screen: Screen) => void
  openShop: () => void
  closeShop: () => void
  openTaxes: () => void
  closeTaxes: () => void
  openPolicies: () => void
  closePolicies: () => void
  openZones: () => void
  closeZones: () => void
  openAdmin: () => void
  closeAdmin: () => void
  setAdminCode: (code: string) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    currentScreen: 'menu',
    isShopOpen: false,
    isTaxesOpen: false,
    isPoliciesOpen: false,
    isZonesOpen: false,
    isAdminOpen: false,
    adminCode: '',

    setScreen: (screen) =>
      set((state) => {
        state.currentScreen = screen
        state.closeAllModals()
      }),

    openShop: () =>
      set((state) => {
        state.isShopOpen = true
      }),

    closeShop: () =>
      set((state) => {
        state.isShopOpen = false
      }),

    openTaxes: () =>
      set((state) => {
        state.isTaxesOpen = true
      }),

    closeTaxes: () =>
      set((state) => {
        state.isTaxesOpen = false
      }),

    openPolicies: () =>
      set((state) => {
        state.isPoliciesOpen = true
      }),

    closePolicies: () =>
      set((state) => {
        state.isPoliciesOpen = false
      }),

    openZones: () =>
      set((state) => {
        state.isZonesOpen = true
      }),

    closeZones: () =>
      set((state) => {
        state.isZonesOpen = false
      }),

    openAdmin: () =>
      set((state) => {
        state.isAdminOpen = true
      }),

    closeAdmin: () =>
      set((state) => {
        state.isAdminOpen = false
        state.adminCode = ''
      }),

    setAdminCode: (code) =>
      set((state) => {
        state.adminCode = code
      }),

    closeAllModals: () =>
      set((state) => {
        state.isShopOpen = false
        state.isTaxesOpen = false
        state.isPoliciesOpen = false
        state.isZonesOpen = false
        state.isAdminOpen = false
      }),
  }))
)

