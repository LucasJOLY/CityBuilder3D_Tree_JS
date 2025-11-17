import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState, ActiveLoan, ArchivedLoan } from '@/types/domain'
import { loadGameConfig, loadEconomyConfig, loadLoansConfig } from '@/utils/config-loader'

interface GameStore extends GameState {
  // Actions
  setMoney: (amount: number) => void
  addMoney: (amount: number) => void
  setCitizens: (count: number) => void
  addCitizens: (count: number) => void
  setHappiness: (value: number) => void
  setTax: (value: number) => void
  togglePolicy: (policyId: string) => void
  setGameDate: (date: Date) => void
  takeLoan: (loanId: string) => Promise<boolean>
  processLoanPayments: () => void
  reset: () => Promise<void>
  loadState: (state: GameState) => void
}

// Initial state will be set by reset() on first load
const initialState: GameState = {
  money: 500, // Default, will be overridden by reset()
  citizens: 0,
  happiness: 50,
  currentTax: 10,
  activePolicies: [],
  seed: 0,
  activeLoans: [],
  archivedLoans: [],
  loanCountsByType: {},
  gameDate: new Date(2020, 0, 1).getTime(), // 1er janvier 2020
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialState,

    setMoney: amount =>
      set(state => {
        state.money = amount
      }),

    addMoney: amount =>
      set(state => {
        state.money = state.money + amount
      }),

    setCitizens: count =>
      set(state => {
        state.citizens = Math.max(0, count)
      }),

    addCitizens: count =>
      set(state => {
        state.citizens = Math.max(0, state.citizens + count)
      }),

    setHappiness: value =>
      set(state => {
        state.happiness = Math.max(0, Math.min(100, value))
      }),

    setTax: value =>
      set(async state => {
        const economy = await loadEconomyConfig()
        state.currentTax = Math.max(economy.taxMin, Math.min(economy.taxMax, value))
      }),

    togglePolicy: policyId =>
      set(state => {
        const index = state.activePolicies.indexOf(policyId)
        if (index === -1) {
          state.activePolicies.push(policyId)
        } else {
          state.activePolicies.splice(index, 1)
        }
      }),

    setGameDate: date =>
      set(state => {
        state.gameDate = date.getTime()
      }),

    takeLoan: async (loanId: string) => {
      const loans = await loadLoansConfig()
      const loan = loans.find(l => l.id === loanId)
      if (!loan) return false

      const state = get()

      // Vérifier si le prêt est déjà actif
      if (state.activeLoans.some(l => l.loanId === loanId)) {
        return false
      }

      // Calculer le taux d'intérêt en fonction du nombre de prêts déjà pris du même type
      const loanCount = state.loanCountsByType[loanId] || 0
      let interestRate = loan.interestRate

      // Pour le premier prêt de 100€, le taux est de 0%
      if (loanId === 'loan_100' && loanCount === 0 && state.activeLoans.length === 0) {
        interestRate = 0
      } else {
        // Augmenter le taux d'intérêt de 20% pour chaque prêt du même type déjà pris
        // Le taux peut dépasser 100%
        interestRate = loan.interestRate + loanCount * 20
      }

      // Calculer le montant total à rembourser avec intérêts
      const totalToRepay = loan.amount * (1 + interestRate / 100)
      const monthlyPayment = totalToRepay / loan.durationMonths

      // Calculer les dates en fonction de la date du jeu
      const currentGameDate = state.gameDate || new Date(2020, 0, 1).getTime()
      const daysPerMonth = 30 // Approximation : 30 jours par mois dans le jeu
      const daysDuration = loan.durationMonths * daysPerMonth
      const dayDurationMs = 24 * 60 * 60 * 1000 // 1 jour en millisecondes
      const endDate = currentGameDate + daysDuration * dayDurationMs

      set(state => {
        state.money += loan.amount
        state.activeLoans.push({
          loanId: loan.id,
          amount: loan.amount,
          totalToRepay,
          monthlyPayment,
          startDate: currentGameDate,
          endDate,
          monthsRemaining: loan.durationMonths,
          monthsPaid: 0,
          lastPaymentDate: currentGameDate, // Initialiser avec la date de début
        })
        // Incrémenter le compteur de prêts pour ce type
        state.loanCountsByType[loanId] = (state.loanCountsByType[loanId] || 0) + 1
      })
      return true
    },

    processLoanPayments: async () => {
      const loans = await loadLoansConfig()
      set(state => {
        const currentGameDate = state.gameDate || new Date(2020, 0, 1).getTime()
        const daysPerMonth = 30 // 30 jours de jeu = 1 mois
        const dayDurationMs = 24 * 60 * 60 * 1000 // 1 jour en millisecondes
        const monthDurationMs = daysPerMonth * dayDurationMs

        const loansToArchive: ArchivedLoan[] = []

        state.activeLoans = state.activeLoans
          .map(loan => {
            // Calculer combien de mois de jeu se sont écoulés depuis le dernier paiement
            const daysSinceLastPayment = (currentGameDate - loan.lastPaymentDate) / dayDurationMs
            const monthsSinceLastPayment = Math.floor(daysSinceLastPayment / daysPerMonth)

            // Vérifier si le prêt est terminé
            if (loan.monthsRemaining <= 0) {
              // Archiver le prêt terminé
              const config = loans.find(l => l.id === loan.loanId)
              const baseInterestRate = config?.interestRate || 0
              const loanCount = (state.loanCountsByType[loan.loanId] || 1) - 1 // -1 car on va archiver
              const appliedInterestRate =
                loan.loanId === 'loan_100' && loanCount === 0
                  ? 0
                  : baseInterestRate + loanCount * 20

              loansToArchive.push({
                loanId: loan.loanId,
                amount: loan.amount,
                totalToRepay: loan.totalToRepay,
                monthlyPayment: loan.monthlyPayment,
                startDate: loan.startDate,
                endDate: loan.endDate,
                completionDate: currentGameDate,
                interestRate: appliedInterestRate,
              })
              return null
            }

            // Si moins d'un mois s'est écoulé, ne rien faire
            if (monthsSinceLastPayment < 1) {
              return loan
            }

            // Payer les mois écoulés (maximum jusqu'à ce qu'il reste 0 mois)
            const monthsToPay = Math.min(monthsSinceLastPayment, loan.monthsRemaining)
            const newMonthsPaid = loan.monthsPaid + monthsToPay
            const newMonthsRemaining = loan.monthsRemaining - monthsToPay

            // Retirer les paiements mensuels
            state.money -= loan.monthlyPayment * monthsToPay

            // Calculer la nouvelle date de dernier paiement
            const newLastPaymentDate = loan.lastPaymentDate + monthsToPay * monthDurationMs

            // Si le prêt est maintenant terminé après ce paiement, l'archiver
            if (newMonthsRemaining <= 0) {
              const config = loans.find(l => l.id === loan.loanId)
              const baseInterestRate = config?.interestRate || 0
              const loanCount = (state.loanCountsByType[loan.loanId] || 1) - 1
              const appliedInterestRate =
                loan.loanId === 'loan_100' && loanCount === 0
                  ? 0
                  : baseInterestRate + loanCount * 20

              loansToArchive.push({
                loanId: loan.loanId,
                amount: loan.amount,
                totalToRepay: loan.totalToRepay,
                monthlyPayment: loan.monthlyPayment,
                startDate: loan.startDate,
                endDate: loan.endDate,
                completionDate: currentGameDate,
                interestRate: appliedInterestRate,
              })
              return null
            }

            return {
              ...loan,
              monthsPaid: newMonthsPaid,
              monthsRemaining: newMonthsRemaining,
              lastPaymentDate: newLastPaymentDate,
            }
          })
          .filter((loan): loan is ActiveLoan => loan !== null)

        // Ajouter les prêts archivés
        state.archivedLoans.push(...loansToArchive)
      })
    },

    reset: async () =>
      set(async state => {
        const gameConfig = await loadGameConfig()
        state.money = gameConfig.startMoney
        state.citizens = gameConfig.startCitizens
        state.happiness = 50
        state.currentTax = 10
        state.activePolicies = []
        state.activeLoans = []
        state.archivedLoans = []
        state.loanCountsByType = {}
        state.seed = Math.floor(Math.random() * 1000000)
        state.gameDate = new Date(2020, 0, 1).getTime()
      }),

    loadState: newState =>
      set(state => {
        Object.assign(state, newState)
        // S'assurer que activeLoans existe
        if (!state.activeLoans) {
          state.activeLoans = []
        }
        // S'assurer que archivedLoans existe
        if (!state.archivedLoans) {
          state.archivedLoans = []
        }
        // S'assurer que loanCountsByType existe
        if (!state.loanCountsByType) {
          state.loanCountsByType = {}
        }
        // S'assurer que gameDate existe
        if (!state.gameDate) {
          state.gameDate = new Date(2020, 0, 1).getTime()
        }
        // S'assurer que les prêts existants ont lastPaymentDate
        state.activeLoans = state.activeLoans.map(loan => {
          if (!loan.lastPaymentDate) {
            // Si lastPaymentDate n'existe pas, l'initialiser avec startDate
            return { ...loan, lastPaymentDate: loan.startDate }
          }
          return loan
        })
      }),
  }))
)
