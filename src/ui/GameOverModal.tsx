import { Box, Typography } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { AlertTriangle } from 'lucide-react'

export function GameOverModal() {
  const isGameOver = useUIStore(state => state.isGameOver)
  const setScreen = useUIStore(state => state.setScreen)
  const setGameOver = useUIStore(state => state.setGameOver)

  const handleReturnToMenu = () => {
    setGameOver(false)
    setScreen('menu')
  }

  return (
    <Modal isOpen={isGameOver} onClose={() => {}} title={null}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <AlertTriangle className="w-16 h-16" />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
          Game Over
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '32rem' }}>
          Votre ville est en faillite ! Votre dette a atteint -1000€ et vous ne pouvez plus
          continuer à gérer votre ville.
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Essayez de mieux équilibrer vos revenus et vos dépenses lors de votre prochaine partie.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button onClick={handleReturnToMenu} size="lg" variant="contained" color="primary">
            Retour au menu
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

