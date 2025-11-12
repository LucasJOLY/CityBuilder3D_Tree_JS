export type BuildingType =
  | 'road'
  | 'house'
  | 'hospital'
  | 'school'
  | 'police'
  | 'fire'
  | 'park'
  | 'monument'

export type TileOrientation = 0 | 1 | 2 | 3

export interface GridCell {
  x: number
  y: number
  buildingType: BuildingType | null
  orientation: TileOrientation
  zoneId?: string
}

export interface GameState {
  money: number
  citizens: number
  happiness: number
  currentTax: number
  activePolicies: string[]
  unlockedZones: Zone[]
  seed: number
}

export interface Zone {
  x: number
  y: number
  width: number
  height: number
  unlocked: boolean
  price?: number
}

export interface BuildingConfig {
  size: [number, number]
  cost: number
  requiresRoad: boolean
  citizens: number
  capacity: number
  coverage: number
  happiness: number
  maintKey: string
}

export interface PolicyConfig {
  id: string
  label: string
  taxMultiplier?: number
  happinessDelta?: number
  crimeDelta?: number
  maintenanceMultiplier?: number
  maintenancePoliceMultiplier?: number
}

export interface EconomyConfig {
  baseTaxPerCitizen: number
  monthDurationSeconds: number
  maintenance: Record<string, number>
  happinessIncomeBonus: number
  taxMin: number
  taxMax: number
}

export interface GameConfig {
  gridSize: number
  startMoney: number
  startCitizens: number
  adminCode: string
  zonePrices: {
    small: number
    medium: number
    large: number
  }
  unlockedZones: Zone[]
}

export interface SaveSlot {
  id: string
  name: string
  timestamp: number
  gameState: GameState
  grid: GridCell[][]
}

