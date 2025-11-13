import { useState, useEffect } from 'react'
import { Typography, Box } from '@mui/material'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { loadSaveSlots, deleteSaveSlot } from '@/utils/save-manager'
import { Options } from './Options'

export function MainMenu() {
  const setScreen = useUIStore((state) => state.setScreen)
  const reset = useGameStore((state) => state.reset)
  const initializeGrid = useWorldStore((state) => state.initializeGrid)
  const [saveSlots, setSaveSlots] = useState<Array<{ id: string; name: string; timestamp: number }>>([])
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  useEffect(() => {
    loadSaveSlots().then((slots) => {
      setSaveSlots(slots)
    })
  }, [])

  const handleNewGame = async () => {
    await reset()
    await initializeGrid()
    setScreen('game')
  }

  const handleLoadGame = async (slotId: string) => {
    const { loadGame } = await import('@/utils/save-manager')
    await loadGame(slotId)
    setScreen('game')
  }

  const handleDeleteSave = async (slotId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      await deleteSaveSlot(slotId)
      const slots = await loadSaveSlots()
      setSaveSlots(slots)
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom right, rgba(246, 116, 27, 0.1), rgba(246, 116, 27, 0.05))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: '28rem',
          width: '100%',
          animation: 'fade-in 0.3s ease-out',
        }}
      >
        <Typography variant="h1" sx={{ textAlign: 'center', mb: 4, color: 'primary.main' }}>
          City Builder 3D
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button onClick={handleNewGame} fullWidth size="lg">
            Nouvelle partie
          </Button>

          {saveSlots.length > 0 && (
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Charger une partie
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {saveSlots.map((slot) => (
                  <Box
                    key={slot.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {slot.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(slot.timestamp).toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={() => handleLoadGame(slot.id)}
                        size="sm"
                        variant="secondary"
                      >
                        Charger
                      </Button>
                      <Button
                        onClick={() => handleDeleteSave(slot.id)}
                        size="sm"
                        variant="danger"
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
            <Button
              variant="secondary"
              fullWidth
              size="md"
              onClick={() => setIsOptionsOpen(true)}
            >
              Options
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              onClick={() => alert('Crédits à venir')}
            >
              Crédits
            </Button>
          </Box>
        </Box>
      </Box>
      <Options isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />
    </Box>
  )
}

