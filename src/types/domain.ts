export type BuildingType =
  | 'road'
  | 'roadTurn'
  | 'house'
  | 'apartment'
  | 'hospital'
  | 'school'
  | 'police'
  | 'fire'
  | 'park'
  | 'parkLarge'
  | 'monument'
  | 'skycraper'
  | 'prison'
  | 'church'
  | 'bar'

export type DecorativeObjectType = 'tree' | 'rock'

export type TileOrientation = 0 | 1 | 2 | 3

export interface GridCell {
  x: number
  y: number
  buildingType: BuildingType | null
  decorativeObject: DecorativeObjectType | null
  orientation: TileOrientation
}

export interface GameState {
  money: number
  citizens: number
  happiness: number
  currentTax: number
  activePolicies: string[]
  seed: number
  activeLoans: ActiveLoan[]
  archivedLoans: ArchivedLoan[] // Prêts terminés et archivés
  loanCountsByType: Record<string, number> // Nombre de prêts pris par type (pour augmenter le taux)
  gameDate: number // Timestamp de la date du jeu (en millisecondes depuis le 1er janvier 2020)
}

export interface LoanConfig {
  id: string
  amount: number
  durationMonths: number
  interestRate: number // Taux d'intérêt en pourcentage (0-100)
  label: string
}

export interface ActiveLoan {
  loanId: string
  amount: number
  totalToRepay: number // Montant total à rembourser (avec intérêts)
  monthlyPayment: number // Montant à rembourser chaque mois
  startDate: number // Timestamp de la date de début (date du jeu)
  endDate: number // Timestamp de la date de fin (date du jeu)
  monthsRemaining: number // Nombre de mois restants
  monthsPaid: number // Nombre de mois déjà payés
  lastPaymentDate: number // Date du jeu du dernier paiement (pour éviter les paiements multiples)
}

export interface ArchivedLoan {
  loanId: string
  amount: number
  totalToRepay: number // Montant total remboursé (avec intérêts)
  monthlyPayment: number // Montant qui était remboursé chaque mois
  startDate: number // Timestamp de la date de début
  endDate: number // Timestamp de la date de fin prévue
  completionDate: number // Timestamp de la date de remboursement complet
  interestRate: number // Taux d'intérêt appliqué
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

export interface DecorativeObjectConfig {
  id: string
  label: string
  modelPath: string
  size: [number, number]
  destructionCost: number
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
}

export interface SaveSlot {
  id: string
  name: string
  timestamp: number
  gameState: GameState
  grid: GridCell[][]
}
