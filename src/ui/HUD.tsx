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
  Divider,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useGameStore } from '@/stores/game-store'
import { useUIStore } from '@/stores/ui-store'
import { useWorldStore } from '@/stores/world-store'
import { Button } from './components/Button'
import { Shop } from './Shop'
import { Taxes } from './Taxes'
import { Policies } from './Policies'
import { Admin } from './Admin'
import { BuildingInfo } from './BuildingInfo'
import { GameOverModal } from './GameOverModal'
import { Loans } from './Loans'
import { saveGame } from '@/utils/save-manager'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { calculateHappiness } from '@/sim/happiness'
import { calculateCityStats } from '@/sim/citystate'
import { loadEconomyConfig } from '@/utils/config-loader'
import { buildingLabels } from '@/utils/building-labels'
import { MoneyPopover } from './components/MoneyPopover'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import {
  DollarSign,
  Users,
  Heart,
  ShoppingCart,
  Settings,
  Shield,
  Save,
  Clock,
  Play,
  Pause,
  CreditCard,
} from 'lucide-react'

export function HUD() {
  const { enqueueSnackbar } = useSnackbar()
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
  const rotatePlacement = useWorldStore(state => state.rotatePlacement)

  const openShop = useUIStore(state => state.openShop)
  const openTaxes = useUIStore(state => state.openTaxes)
  const openPolicies = useUIStore(state => state.openPolicies)
  const openLoans = useUIStore(state => state.openLoans)
  const setScreen = useUIStore(state => state.setScreen)
  const openAdmin = useUIStore(state => state.openAdmin)
  const isPaused = useUIStore(state => state.isPaused)
  const togglePause = useUIStore(state => state.togglePause)
  const setGameOver = useUIStore(state => state.setGameOver)

  const [monthTimer, setMonthTimer] = useState(0)
  const gameDateFromStore = useGameStore(state => state.gameDate)
  const [gameDate, setGameDate] = useState(() => {
    // Initialiser avec la date du store ou la date par défaut
    return gameDateFromStore ? new Date(gameDateFromStore) : new Date(2020, 0, 1)
  })
  const [speed, setSpeed] = useState(3) // Vitesse par défaut : normal (3)
  const [speedAnchorEl, setSpeedAnchorEl] = useState<HTMLElement | null>(null)
  const [speedAnimation, setSpeedAnimation] = useState(false)
  const [moneyAnchorEl, setMoneyAnchorEl] = useState<HTMLElement | null>(null)
  const [projectedIncome, setProjectedIncome] = useState<{
    revenue: number
    expenses: number
    monthlyCosts: number
    net: number
  } | null>(null)
  const setGameDateInStore = useGameStore(state => state.setGameDate)

  // Synchroniser la date du jeu avec le store au démarrage
  useEffect(() => {
    if (gameDateFromStore) {
      setGameDate(new Date(gameDateFromStore))
    }
  }, [gameDateFromStore])

  // Calculer les revenus projetés pour le popover
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

      // Appliquer les revenus/coûts mensuels
      if (income.revenue > 0) {
        // Si on a des revenus, les coûts mensuels (20% des revenus) sont déjà déduits dans calculateMonthlyIncome
        addMoney(income.net)
      } else {
        // Si on a 0 revenus, on perd 2% de l'argent total chaque mois
        const currentMoney = useGameStore.getState().money
        const monthlyLoss = Math.floor(currentMoney * 0.02) // 2% de l'argent total
        addMoney(-monthlyLoss)
      }

      // Note: Les remboursements de prêts sont traités à chaque jour qui passe dans le jeu,
      // pas seulement lors des mises à jour mensuelles (voir setGameDate ci-dessous)

      // Vérifier si le joueur a perdu (dette de -1000€)
      const newMoney = useGameStore.getState().money
      if (newMoney <= -1000) {
        setGameOver(true)
      }
    }

    const multiplier = speedMultipliers[speed] ?? 1
    // Calculer l'intervalle : vitesse normale = 1000ms par jour
    // Vitesse x2 = 500ms par jour, vitesse x4 = 250ms par jour, etc.
    const intervalMs = Math.max(50, Math.floor(1000 / multiplier)) // Minimum 50ms pour éviter trop de ticks

    const interval = setInterval(async () => {
      // Ne rien faire si le jeu est en pause
      if (isPaused) return

      const economy = await loadEconomyConfig()

      // Incrémenter d'un jour à chaque tick
      setGameDate(prevDate => {
        const newDate = new Date(prevDate)
        newDate.setDate(newDate.getDate() + 1)
        setGameDateInStore(newDate) // Mettre à jour aussi dans le store

        // Vérifier les remboursements de prêts à chaque jour qui passe
        // (pour s'assurer que les paiements sont traités au bon moment)
        const { processLoanPayments } = useGameStore.getState()
        processLoanPayments()

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
    isPaused,
    setGameOver,
    setGameDateInStore,
  ])

  const handleSave = async () => {
    await saveGame('save_' + Date.now(), 'Sauvegarde ' + new Date().toLocaleString('fr-FR'))
    enqueueSnackbar('Partie sauvegardée !', {
      variant: 'success',
      autoHideDuration: 2000,
    })
  }

  const handleSpeedChange = (newSpeed: number) => {
    if (newSpeed !== speed) {
      setSpeedAnimation(true)
      setSpeed(newSpeed)
      setTimeout(() => setSpeedAnimation(false), 600) // Durée de l'animation
    }
  }

  // Gestion des raccourcis clavier
  useKeyboardShortcuts({
    onSave: handleSave,
    onAdmin: openAdmin,
    onPause: togglePause,
    onSpeedChange: handleSpeedChange,
    currentSpeed: speed,
    selectedBuilding,
    onRotatePlacement: rotatePlacement,
  })

  const handleSpeedClick = (event: React.MouseEvent<HTMLElement>) => {
    setSpeedAnchorEl(event.currentTarget)
  }

  const handleSpeedClose = () => {
    setSpeedAnchorEl(null)
  }

  const handleSpeedSelect = (newSpeed: number) => {
    handleSpeedChange(newSpeed)
    handleSpeedClose()
  }

  const handleMoneyClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoneyAnchorEl(event.currentTarget)
  }

  const handleMoneyClose = () => {
    setMoneyAnchorEl(null)
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
                    Mode placement: {buildingLabels[selectedBuilding]}
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
                  cursor: 'pointer',
                }}
                onClick={handleMoneyClick}
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
                  animation: speedAnimation ? 'speedChange 0.6s ease-out' : 'none',
                  '@keyframes speedChange': {
                    '0%': {
                      transform: 'scale(1)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    },
                    '50%': {
                      transform: 'scale(1.15) rotate(5deg)',
                      backgroundColor: 'rgba(245, 158, 11, 0.3)',
                      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                    },
                    '100%': {
                      transform: 'scale(1) rotate(0deg)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    },
                  },
                }}
                onClick={handleSpeedClick}
              >
                <Clock
                  className="w-5 h-5"
                  style={{
                    color: '#f59e0b',
                    transition: 'transform 0.3s ease-out',
                    transform: speedAnimation ? 'rotate(360deg)' : 'rotate(0deg)',
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  {formatDate(gameDate)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: speedAnimation ? 'warning.main' : 'warning.dark',
                    opacity: 0.8,
                    ml: 1,
                    transition: 'all 0.3s ease-out',
                    transform: speedAnimation ? 'scale(1.3)' : 'scale(1)',
                  }}
                >
                  x{speedMultipliers[speed]}
                </Typography>
              </Paper>

              <Paper
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isPaused ? 'success.50' : 'error.50',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  transition: 'transform 0.2s, background-color 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  cursor: 'pointer',
                  minWidth: 48,
                }}
                onClick={togglePause}
              >
                {isPaused ? (
                  <Play className="w-5 h-5" style={{ color: '#16a34a' }} />
                ) : (
                  <Pause className="w-5 h-5" style={{ color: '#dc2626' }} />
                )}
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
              <Button onClick={openLoans} variant="secondary" size="sm">
                <CreditCard className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
                Prêts
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
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 200,
            bgcolor: 'background.paper',
            borderRadius: 2,
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: 'text.primary', textAlign: 'center' }}
        >
          Vitesse de jeu
        </Typography>
        <Divider sx={{ mb: 2 }} />
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
      </Popover>

      {/* Popover pour les informations financières */}
      <MoneyPopover
        anchorEl={moneyAnchorEl}
        onClose={handleMoneyClose}
        projectedIncome={projectedIncome}
        money={money}
      />

      <Shop />
      <Taxes />
      <Policies />
      <Loans />
      <Admin />
      <BuildingInfo />
      <GameOverModal />
    </>
  )
}
