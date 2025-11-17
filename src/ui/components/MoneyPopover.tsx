import { Box, Typography, Popover, Divider, LinearProgress } from '@mui/material'
import { useGameStore } from '@/stores/game-store'
import { loadLoansConfig } from '@/utils/config-loader'
import { useEffect, useState } from 'react'
import type { LoanConfig, ActiveLoan } from '@/types/domain'

interface MoneyPopoverProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  projectedIncome: {
    revenue: number
    expenses: number
    monthlyCosts: number
    net: number
  } | null
  money: number
}

export function MoneyPopover({
  anchorEl,
  onClose,
  projectedIncome,
  money,
}: MoneyPopoverProps) {
  const [loansConfig, setLoansConfig] = useState<LoanConfig[]>([])
  const activeLoans = useGameStore(state => state.activeLoans)
  const gameDateFromStore = useGameStore(state => state.gameDate)

  // Charger la configuration des prêts
  useEffect(() => {
    loadLoansConfig().then(setLoansConfig)
  }, [])

  // Calculer la progression d'un prêt basée sur les jours du jeu écoulés
  const getLoanProgress = (loan: ActiveLoan) => {
    const currentGameDate = gameDateFromStore || new Date(2020, 0, 1).getTime()
    const totalDuration = loan.endDate - loan.startDate
    const elapsed = currentGameDate - loan.startDate

    if (totalDuration <= 0) return 100
    if (elapsed <= 0) return 0

    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    return progress
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      sx={{
        mt: 1,
      }}
      PaperProps={{
        sx: {
          p: 2,
          minWidth: 350,
          bgcolor: 'background.paper',
          borderRadius: 2,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: 'text.primary', textAlign: 'center' }}
      >
        Revenus mensuels estimés
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {projectedIncome ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: 1,
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
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Calcul en cours...
        </Typography>
      )}
    </Popover>
  )
}

