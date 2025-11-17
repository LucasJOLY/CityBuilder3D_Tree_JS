import { useState, useEffect } from 'react'
import { Box, Typography, Slider, Paper, LinearProgress } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadEconomyConfig, loadLoansConfig } from '@/utils/config-loader'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { useWorldStore } from '@/stores/world-store'
import type { LoanConfig, ActiveLoan } from '@/types/domain'

export function Taxes() {
  const isOpen = useUIStore(state => state.isTaxesOpen)
  const closeTaxes = useUIStore(state => state.closeTaxes)
  const currentTax = useGameStore(state => state.currentTax)
  const setTax = useGameStore(state => state.setTax)
  const citizens = useGameStore(state => state.citizens)
  const activePolicies = useGameStore(state => state.activePolicies)
  const happiness = useGameStore(state => state.happiness)
  const money = useGameStore(state => state.money)
  const activeLoans = useGameStore(state => state.activeLoans)
  const grid = useWorldStore(state => state.grid)

  const [taxMin, setTaxMin] = useState(5)
  const [taxMax, setTaxMax] = useState(25)
  const [projectedIncome, setProjectedIncome] = useState<{
    revenue: number
    expenses: number
    monthlyCosts: number
    net: number
  } | null>(null)
  const [loansConfig, setLoansConfig] = useState<LoanConfig[]>([])
  const gameDate = useGameStore(state => state.gameDate)

  useEffect(() => {
    loadEconomyConfig().then(config => {
      setTaxMin(config.taxMin)
      setTaxMax(config.taxMax)
    })
    loadLoansConfig().then(setLoansConfig)
  }, [])

  // Forcer le re-render quand la date du jeu change pour mettre à jour les barres de progression
  useEffect(() => {
    // Ce useEffect force le re-render quand gameDate change
  }, [gameDate])

  useEffect(() => {
    const updateProjection = async () => {
      if (grid.length === 0) return

      const buildingCounts = countBuildings(grid)
      const income = await calculateMonthlyIncome(
        citizens,
        currentTax,
        activePolicies,
        happiness,
        buildingCounts
      )
      setProjectedIncome(income)
    }

    updateProjection()
  }, [currentTax, citizens, activePolicies, happiness, grid])

  const handleTaxChange = (value: number) => {
    setTax(value)
  }

  // Calculer la progression d'un prêt basée sur les jours du jeu écoulés
  const getLoanProgress = (loan: ActiveLoan) => {
    const currentGameDate = gameDate || new Date(2020, 0, 1).getTime()
    const totalDuration = loan.endDate - loan.startDate
    const elapsed = currentGameDate - loan.startDate

    if (totalDuration <= 0) return 100
    if (elapsed <= 0) return 0

    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    return progress
  }

  return (
    <Modal isOpen={isOpen} onClose={closeTaxes} title="Gestion des impôts">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Taux d'imposition: {currentTax}%
          </Typography>
          <Slider
            value={currentTax}
            onChange={(_, value) => handleTaxChange(value as number)}
            min={taxMin}
            max={taxMax}
            step={1}
            marks={[
              { value: taxMin, label: `${taxMin}%` },
              { value: taxMax, label: `${taxMax}%` },
            ]}
            sx={{
              '& .MuiSlider-thumb': {
                '&:hover': {
                  boxShadow: '0 0 0 8px rgba(246, 116, 27, 0.16)',
                },
              },
            }}
          />
        </Box>

        {projectedIncome && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Revenus mensuels estimés
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Revenus:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  +{projectedIncome.revenue.toLocaleString('fr-FR')} €
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Dépenses (maintenance):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  -{projectedIncome.expenses.toLocaleString('fr-FR')} €
                </Typography>
              </Box>
              {projectedIncome.revenue > 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Coûts mensuels (20% des revenus):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    -{projectedIncome.monthlyCosts.toLocaleString('fr-FR')} €
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Coûts mensuels (2% de l'argent total):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    -{Math.floor(money * 0.02).toLocaleString('fr-FR')} €
                  </Typography>
                </Box>
              )}
              {/* Remboursements de prêts */}
              {activeLoans.map((loan, index) => {
                const config = loansConfig.find(l => l.id === loan.loanId)
                if (!config) return null
                const progress = getLoanProgress(loan)
                return (
                  <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {config.label}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        -{loan.monthlyPayment.toFixed(2).replace('.', ',')} €
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Box>
                )
              })}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: 1,
                  borderColor: 'divider',
                  pt: 1,
                  mt: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Net:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color:
                      projectedIncome.revenue > 0
                        ? projectedIncome.net >= 0
                          ? 'success.main'
                          : 'error.main'
                        : 'error.main',
                  }}
                >
                  {projectedIncome.revenue > 0 ? (projectedIncome.net >= 0 ? '+' : '') : '-'}
                  {projectedIncome.revenue > 0
                    ? projectedIncome.net.toLocaleString('fr-FR')
                    : Math.floor(money * 0.02).toLocaleString('fr-FR')}{' '}
                  €
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        <Typography variant="body2" color="text.secondary">
          Les impôts influencent directement vos revenus mensuels. Un taux élevé génère plus de
          revenus mais peut réduire le bonheur des citoyens.
        </Typography>

        <Button onClick={closeTaxes} fullWidth>
          Fermer
        </Button>
      </Box>
    </Modal>
  )
}
