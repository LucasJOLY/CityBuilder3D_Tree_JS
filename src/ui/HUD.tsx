import { useEffect, useState } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useGameStore } from '@/stores/game-store'
import { useUIStore } from '@/stores/ui-store'
import { useWorldStore } from '@/stores/world-store'
import { Button } from './components/Button'
import { Shop } from './Shop'
import { Taxes } from './Taxes'
import { Policies } from './Policies'
import { Zones } from './Zones'
import { Admin } from './Admin'
import { BuildingInfo } from './BuildingInfo'
import { saveGame } from '@/utils/save-manager'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { calculateHappiness } from '@/sim/happiness'
import { calculateCityStats } from '@/sim/citystate'
import { loadEconomyConfig } from '@/utils/config-loader'
import { DollarSign, Users, Heart, ShoppingCart, Settings, Map, Shield, Save } from 'lucide-react'

export function HUD() {
  const money = useGameStore((state) => state.money)
  const citizens = useGameStore((state) => state.citizens)
  const happiness = useGameStore((state) => state.happiness)
  const grid = useWorldStore((state) => state.grid)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const currentTax = useGameStore((state) => state.currentTax)
  const setHappiness = useGameStore((state) => state.setHappiness)
  const addMoney = useGameStore((state) => state.addMoney)
  const setCitizens = useGameStore((state) => state.setCitizens)
  const selectedBuilding = useWorldStore((state) => state.selectedBuilding)

  const openShop = useUIStore((state) => state.openShop)
  const openTaxes = useUIStore((state) => state.openTaxes)
  const openPolicies = useUIStore((state) => state.openPolicies)
  const openZones = useUIStore((state) => state.openZones)
  const setScreen = useUIStore((state) => state.setScreen)

  const [monthTimer, setMonthTimer] = useState(0)

  useEffect(() => {
    const updateGame = async () => {
      if (grid.length === 0) return

      const buildingCounts = countBuildings(grid)
      const income = await calculateMonthlyIncome(
        citizens,
        currentTax,
        activePolicies,
        happiness,
        buildingCounts
      )

      const cityStats = await calculateCityStats(grid, activePolicies)
      const happinessFactors = await calculateHappiness(grid, activePolicies, cityStats.crime)

      setHappiness(happinessFactors.total)
      setCitizens(cityStats.totalCitizens)
      addMoney(income.net)
    }

    const interval = setInterval(async () => {
      const economy = await loadEconomyConfig()
      setMonthTimer((prev) => {
        const newTime = prev + 1
        if (newTime >= economy.monthDurationSeconds) {
          updateGame()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [grid, citizens, currentTax, activePolicies, happiness, setHappiness, addMoney, setCitizens])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        openAdmin()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const openAdmin = useUIStore((state) => state.openAdmin)

  const handleSave = async () => {
    await saveGame('save_' + Date.now(), 'Sauvegarde ' + new Date().toLocaleString('fr-FR'))
    alert('Partie sauvegardée !')
  }

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: 2,
          borderColor: 'primary.main',
          zIndex: 30,
        }}
      >
        <Box sx={{ maxWidth: '80rem', mx: 'auto', px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            {/* Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {selectedBuilding && (
                <Paper
                  elevation={2}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'primary.50',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: 2,
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                    Mode placement: {selectedBuilding}
                  </Typography>
                </Paper>
              )}
              <Paper
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'success.50',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <DollarSign className="w-5 h-5" style={{ color: '#16a34a' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {money.toLocaleString('fr-FR')} €
                </Typography>
              </Paper>

              <Paper
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'info.50',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {citizens}
                </Typography>
              </Paper>

              <Paper
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'error.50',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <Heart className="w-5 h-5" style={{ color: '#db2777' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.dark' }}>
                  {happiness}%
                </Typography>
              </Paper>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button onClick={openShop} variant="secondary" size="sm">
                <ShoppingCart className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Boutique
              </Button>
              <Button onClick={openTaxes} variant="secondary" size="sm">
                <Settings className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Impôts
              </Button>
              <Button onClick={openPolicies} variant="secondary" size="sm">
                <Shield className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Politiques
              </Button>
              <Button onClick={openZones} variant="secondary" size="sm">
                <Map className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Zones
              </Button>
              <Button onClick={handleSave} variant="secondary" size="sm">
                <Save className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Sauvegarder
              </Button>
              <Button
                onClick={() => setScreen('menu')}
                variant="secondary"
                size="sm"
              >
                Menu
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Shop />
      <Taxes />
      <Policies />
      <Zones />
      <Admin />
      <BuildingInfo />
    </>
  )
}

