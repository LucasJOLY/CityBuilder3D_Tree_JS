import { useState, useEffect } from 'react'
import { Box, Typography, Paper, LinearProgress, Divider, Collapse } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadLoansConfig } from '@/utils/config-loader'
import type { LoanConfig, ActiveLoan, ArchivedLoan } from '@/types/domain'
import { useSnackbar } from 'notistack'
import { CreditCard, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

export function Loans() {
  const { enqueueSnackbar } = useSnackbar()
  const isOpen = useUIStore(state => state.isLoansOpen)
  const closeLoans = useUIStore(state => state.closeLoans)
  const activeLoans = useGameStore(state => state.activeLoans)
  const archivedLoans = useGameStore(state => state.archivedLoans)
  const loanCountsByType = useGameStore(state => state.loanCountsByType)
  const takeLoan = useGameStore(state => state.takeLoan)
  const [loansConfig, setLoansConfig] = useState<LoanConfig[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadLoansConfig().then(setLoansConfig)
  }, [])

  const handleTakeLoan = async (loanId: string) => {
    const success = await takeLoan(loanId)
    if (success) {
      enqueueSnackbar('Prêt accordé avec succès', {
        variant: 'success',
        autoHideDuration: 2000,
      })
    } else {
      enqueueSnackbar('Ce prêt est déjà en cours', {
        variant: 'warning',
        autoHideDuration: 2000,
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTimeRemaining = (loan: ActiveLoan) => {
    const now = Date.now()
    const remainingMs = loan.endDate - now
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

    if (remainingDays <= 0) return 'Terminé'
    if (remainingDays < 30) return `${remainingDays} jour${remainingDays > 1 ? 's' : ''}`

    const months = Math.floor(remainingDays / 30)
    const days = remainingDays % 30
    if (days === 0) return `${months} mois`
    return `${months} mois et ${days} jour${days > 1 ? 's' : ''}`
  }

  const getLoanConfig = (loanId: string): LoanConfig | undefined => {
    return loansConfig.find(l => l.id === loanId)
  }

  const getProgress = (loan: ActiveLoan) => {
    const totalMonths = loan.monthsPaid + loan.monthsRemaining
    return totalMonths > 0 ? (loan.monthsPaid / totalMonths) * 100 : 0
  }

  return (
    <Modal isOpen={isOpen} onClose={closeLoans} title="Prêts">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Prêts en cours */}
        {activeLoans.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Mes prêts en cours
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeLoans.map((loan, index) => {
                const config = getLoanConfig(loan.loanId)
                if (!config) return null

                return (
                  <Paper key={index} elevation={2} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {config.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTimeRemaining(loan)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Prêt le {formatDate(loan.startDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Remboursement le {formatDate(loan.endDate)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProgress(loan)}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {loan.monthsPaid} / {loan.monthsPaid + loan.monthsRemaining} mois payés
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        -{loan.monthlyPayment.toFixed(2)} €/mois
                      </Typography>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Prêts archivés */}
        {archivedLoans.length > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                cursor: 'pointer',
              }}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Prêts terminés ({archivedLoans.length})
              </Typography>
              {showArchived ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Box>
            <Collapse in={showArchived}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {archivedLoans.map((loan, index) => {
                  const config = getLoanConfig(loan.loanId)
                  if (!config) return null

                  return (
                    <Paper key={index} elevation={1} sx={{ p: 2, bgcolor: 'success.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {config.label}
                        </Typography>
                        <CheckCircle
                          className="w-5 h-5"
                          style={{ color: '#16a34a', marginLeft: 'auto' }}
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={100}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 1,
                              bgcolor: 'success.main',
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Remboursé le {formatDate(loan.completionDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Taux: {loan.interestRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Paper>
                  )
                })}
              </Box>
            </Collapse>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Prêts disponibles */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Prêts disponibles
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {loansConfig.map(loan => {
              const isActive = activeLoans.some(l => l.loanId === loan.id)
              const loanCount = loanCountsByType[loan.id] || 0

              // Calculer le taux d'intérêt en fonction du nombre de prêts déjà pris
              let effectiveInterestRate = loan.interestRate
              if (loan.id === 'loan_100' && loanCount === 0 && activeLoans.length === 0) {
                effectiveInterestRate = 0 // Premier prêt de 100€ = 0%
              } else {
                // Augmenter de 20% pour chaque prêt du même type déjà pris
                effectiveInterestRate = loan.interestRate + loanCount * 20
              }

              const totalToRepay = loan.amount * (1 + effectiveInterestRate / 100)
              const monthlyPayment = totalToRepay / loan.durationMonths

              return (
                <Paper
                  key={loan.id}
                  elevation={isActive ? 1 : 2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    bgcolor: isActive ? 'grey.100' : 'background.paper',
                    opacity: isActive ? 0.6 : 1,
                    border: isActive ? 2 : 0,
                    borderColor: 'success.main',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard className="w-5 h-5" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {loan.label}
                    </Typography>
                    {isActive && (
                      <CheckCircle
                        className="w-5 h-5"
                        style={{ color: '#16a34a', marginLeft: 'auto' }}
                      />
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Montant: <strong>{loan.amount.toLocaleString('fr-FR')} €</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durée: <strong>{loan.durationMonths} mois</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux d'intérêt: <strong>{effectiveInterestRate.toFixed(1)}%</strong>
                      {loanCount > 0 && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ ml: 1, color: 'warning.main' }}
                        >
                          ({loanCount} prêt{loanCount > 1 ? 's' : ''} déjà pris)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total à rembourser:{' '}
                      <strong>{totalToRepay.toFixed(2).replace('.', ',')} €</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mensualité:{' '}
                      <strong style={{ color: '#dc2626' }}>
                        -{monthlyPayment.toFixed(2).replace('.', ',')} €/mois
                      </strong>
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => handleTakeLoan(loan.id)}
                    disabled={isActive}
                    fullWidth
                    variant={isActive ? 'secondary' : 'primary'}
                  >
                    {isActive ? 'Prêt en cours' : 'Contracter ce prêt'}
                  </Button>
                </Paper>
              )
            })}
          </Box>
        </Box>

        <Button onClick={closeLoans} fullWidth>
          Fermer
        </Button>
      </Box>
    </Modal>
  )
}
