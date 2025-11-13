import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
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
import {
  DollarSign,
  Users,
  Heart,
  ShoppingCart,
  Settings,
  Map,
  Shield,
  Save,
  Clock,
} from 'lucide-react'

export function HUD() {
  const money = useGameStore(state => state.money)
  const citizens = useGameStore(state => state.citizens)
  const happiness = useGameStore(state => state.happiness)
  const grid = useWorldStore(state => state.grid)
  const activePolicies = useGameStore(state => state.activePolicies)
  const currentTax = useGameStore(state => state.currentTax)
  const setHappiness = useGameStore(state => state.setHappiness)
  const addMoney = useGameStore(state => state.addMoney)
  const setCitizens = useGameStore(state => state.setCitizens)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)

  const openShop = useUIStore(state => state.openShop)
  const openTaxes = useUIStore(state => state.openTaxes)
  const openPolicies = useUIStore(state => state.openPolicies)
  const openZones = useUIStore(state => state.openZones)
  const setScreen = useUIStore(state => state.setScreen)

  const [monthTimer, setMonthTimer] = useState(0)
  const [gameDate, setGameDate] = useState(new Date(2020, 0, 1)) // 1er janvier 2020
  const [speed, setSpeed] = useState(3) // Vitesse par défaut : normal (3)
  const [speedAnchorEl, setSpeedAnchorEl] = useState<HTMLElement | null>(null)

  // Multiplicateurs de vitesse
  const speedMultipliers: Record<number, number> = {
    1: 0.5, // Très lent
    2: 0.75, // Lent
    3: 1, // Normal
    4: 2, // Rapide
    5: 4, // Très rapide
  }

  const speedLabels: Record<number, string> = {
    1: 'Très lent',
    2: 'Lent',
    3: 'Normal',
    4: 'Rapide',
    5: 'Très rapide',
  }

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

    const multiplier = speedMultipliers[speed] ?? 1
    // Calculer l'intervalle : vitesse normale = 1000ms par jour
    // Vitesse x2 = 500ms par jour, vitesse x4 = 250ms par jour, etc.
    const intervalMs = Math.max(50, Math.floor(1000 / multiplier)) // Minimum 50ms pour éviter trop de ticks

    const interval = setInterval(async () => {
      const economy = await loadEconomyConfig()

      // Incrémenter d'un jour à chaque tick
      setGameDate(prevDate => {
        const newDate = new Date(prevDate)
        newDate.setDate(newDate.getDate() + 1)
        return newDate
      })

      // Gérer le timer mensuel pour les calculs économiques
      // On incrémente en secondes réelles (indépendamment de la vitesse du jeu)
      setMonthTimer(prev => {
        const increment = intervalMs / 1000 // Fraction de seconde réelle écoulée
        const newTime = prev + increment
        if (newTime >= economy.monthDurationSeconds) {
          updateGame()
          return 0
        }
        return newTime
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [
    grid,
    citizens,
    currentTax,
    activePolicies,
    happiness,
    setHappiness,
    addMoney,
    setCitizens,
    speed,
  ])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        openAdmin()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const openAdmin = useUIStore(state => state.openAdmin)

  const handleSave = async () => {
    await saveGame('save_' + Date.now(), 'Sauvegarde ' + new Date().toLocaleString('fr-FR'))
    alert('Partie sauvegardée !')
  }

  const handleSpeedClick = (event: React.MouseEvent<HTMLElement>) => {
    setSpeedAnchorEl(event.currentTarget)
  }

  const handleSpeedClose = () => {
    setSpeedAnchorEl(null)
  }

  const handleSpeedSelect = (newSpeed: number) => {
    setSpeed(newSpeed)
    handleSpeedClose()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
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
        <Box sx={{ maxWidth: '100%', mx: 'auto', px: 2, py: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
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

              <Paper
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'warning.50',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  cursor: 'pointer',
                }}
                onClick={handleSpeedClick}
              >
                <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  {formatDate(gameDate)}
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
              <Button onClick={() => setScreen('menu')} variant="secondary" size="sm">
                Menu
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Popover
        open={Boolean(speedAnchorEl)}
        anchorEl={speedAnchorEl}
        onClose={handleSpeedClose}
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
      >
        <Paper
          sx={{
            p: 2,
            minWidth: 200,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Vitesse de jeu
          </Typography>
          <List sx={{ p: 0 }}>
            {[1, 2, 3, 4, 5].map(speedLevel => (
              <ListItem key={speedLevel} disablePadding>
                <ListItemButton
                  onClick={() => handleSpeedSelect(speedLevel)}
                  selected={speed === speedLevel}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={speedLabels[speedLevel]}
                    secondary={`${speedMultipliers[speedLevel]}x`}
                    primaryTypographyProps={{
                      fontWeight: speed === speedLevel ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: speed === speedLevel ? 'inherit' : 'text.secondary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popover>

      <Shop />
      <Taxes />
      <Policies />
      <Zones />
      <Admin />
      <BuildingInfo />
    </>
  )
}
