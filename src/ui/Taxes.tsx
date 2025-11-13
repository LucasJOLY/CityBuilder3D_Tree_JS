import { useState, useEffect } from 'react'
import { Box, Typography, Slider, Paper } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadEconomyConfig } from '@/utils/config-loader'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { useWorldStore } from '@/stores/world-store'

export function Taxes() {
  const isOpen = useUIStore((state) => state.isTaxesOpen)
  const closeTaxes = useUIStore((state) => state.closeTaxes)
  const currentTax = useGameStore((state) => state.currentTax)
  const setTax = useGameStore((state) => state.setTax)
  const citizens = useGameStore((state) => state.citizens)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const happiness = useGameStore((state) => state.happiness)
  const grid = useWorldStore((state) => state.grid)

  const [taxMin, setTaxMin] = useState(5)
  const [taxMax, setTaxMax] = useState(25)
  const [projectedIncome, setProjectedIncome] = useState<{
    revenue: number
    expenses: number
    net: number
  } | null>(null)

  useEffect(() => {
    loadEconomyConfig().then((config) => {
      setTaxMin(config.taxMin)
      setTaxMax(config.taxMax)
    })
  }, [])

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
                  Dépenses:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  -{projectedIncome.expenses.toLocaleString('fr-FR')} €
                </Typography>
              </Box>
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
                    color: projectedIncome.net >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {projectedIncome.net >= 0 ? '+' : ''}
                  {projectedIncome.net.toLocaleString('fr-FR')} €
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

