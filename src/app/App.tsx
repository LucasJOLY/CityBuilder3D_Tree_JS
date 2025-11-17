import { useEffect } from 'react'
import { ThemeProvider, CssBaseline, Box, Paper } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { Pause } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { MainMenu } from '@/ui/MainMenu'
import { Canvas3D } from '@/core/Canvas3D'
import { HUD } from '@/ui/HUD'
import { LoadingScreen } from '@/ui/LoadingScreen'
import { theme } from './theme'
import { CustomSnackbar } from '@/ui/components/CustomSnackbar'

function App() {
  const currentScreen = useUIStore(state => state.currentScreen)
  const isPaused = useUIStore(state => state.isPaused)
  const isLoading = useUIStore(state => state.isLoading)
  const setIsLoading = useUIStore(state => state.setIsLoading)
  const setScreen = useUIStore(state => state.setScreen)
  const rotatePlacement = useWorldStore(state => state.rotatePlacement)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)

  useEffect(() => {
    // Initialize game on mount
    const init = async () => {
      const { reset } = useGameStore.getState()
      const { initializeGrid } = useWorldStore.getState()
      await reset()
      await initializeGrid()
    }
    init()
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (selectedBuilding) {
          rotatePlacement()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedBuilding, rotatePlacement])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        Components={{
          default: CustomSnackbar,
          success: CustomSnackbar,
          error: CustomSnackbar,
          warning: CustomSnackbar,
          info: CustomSnackbar,
        }}
      >
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            border: isPaused ? '4px solid #dc2626' : 'none',
            boxSizing: 'border-box',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          {currentScreen === 'menu' ? (
            <MainMenu />
          ) : (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <Canvas3D />
              </Box>
              <HUD />
              {/* Icône de pause en haut à gauche */}
              {isPaused && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'fixed',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    borderRadius: 2,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)',
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 0 0 8px rgba(220, 38, 38, 0)',
                      },
                    },
                  }}
                >
                  <Pause className="w-5 h-5" />
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PAUSE
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Box>

        <LoadingScreen
          isVisible={isLoading}
          onComplete={() => {
            setIsLoading(false)
            setScreen('game')
          }}
        />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
