import { useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { MainMenu } from '@/ui/MainMenu'
import { Canvas3D } from '@/core/Canvas3D'
import { HUD } from '@/ui/HUD'
import { theme } from './theme'

function App() {
  const currentScreen = useUIStore(state => state.currentScreen)
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
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <div className="w-screen h-screen overflow-hidden">
          {currentScreen === 'menu' ? (
            <MainMenu />
          ) : (
            <>
              <div className="absolute inset-0">
                <Canvas3D />
              </div>
              <HUD />
            </>
          )}
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
