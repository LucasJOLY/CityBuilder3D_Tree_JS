import { useState, useEffect } from 'react'
import { Typography, Box, Slide, Paper } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Button } from './components/Button'
import { ConfirmModal } from './components/ConfirmModal'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { loadSaveSlots, deleteSaveSlot } from '@/utils/save-manager'
import { Options } from './Options'

export function MainMenu() {
  const { enqueueSnackbar } = useSnackbar()
  const setIsLoading = useUIStore(state => state.setIsLoading)
  const reset = useGameStore(state => state.reset)
  const initializeGrid = useWorldStore(state => state.initializeGrid)
  const [saveSlots, setSaveSlots] = useState<
    Array<{ id: string; name: string; timestamp: number }>
  >([])
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; slotId: string | null }>({
    isOpen: false,
    slotId: null,
  })

  useEffect(() => {
    loadSaveSlots().then(slots => {
      setSaveSlots(slots)
    })
  }, [])

  const handleNewGame = async () => {
    setIsLoading(true)
    // Petit délai pour permettre à l'écran de chargement de s'afficher
    await new Promise(resolve => setTimeout(resolve, 100))
    await reset()
    await initializeGrid()
    // Le chargement se terminera dans App.tsx après l'animation
  }

  const handleLoadGame = async (slotId: string) => {
    setIsLoading(true)
    // Petit délai pour permettre à l'écran de chargement de s'afficher
    await new Promise(resolve => setTimeout(resolve, 100))
    const { loadGame } = await import('@/utils/save-manager')
    await loadGame(slotId)
    // Le chargement se terminera dans App.tsx après l'animation
  }

  const handleDeleteSave = (slotId: string) => {
    setDeleteConfirm({ isOpen: true, slotId })
  }

  const confirmDeleteSave = async () => {
    if (deleteConfirm.slotId) {
      await deleteSaveSlot(deleteConfirm.slotId)
      const slots = await loadSaveSlots()
      setSaveSlots(slots)
      setDeleteConfirm({ isOpen: false, slotId: null })
      enqueueSnackbar('Sauvegarde supprimée avec succès', {
        variant: 'success',
        autoHideDuration: 2000,
      })
      // Si plus de sauvegardes, fermer le menu de chargement
      if (slots.length === 0) {
        setIsLoadMenuOpen(false)
      }
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/images/bg-city-builder.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        transition: 'all 0.3s ease-out',
      }}
    >
      {/* Menu principal */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: '28rem',
          width: '100%',
          animation: 'fade-in 0.3s ease-out',
          transition: 'transform 0.3s ease-out',
          transform: isLoadMenuOpen ? 'translateX(-50%)' : 'translateX(0)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <img
            src="/images/logo-city-builder.png"
            alt="CityBuilder Logo"
            style={{
              maxWidth: '500px',
              height: 'auto',
              maxHeight: '400px',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button onClick={handleNewGame} fullWidth size="lg">
            Nouvelle partie
          </Button>

          <Button
            onClick={() => setIsLoadMenuOpen(true)}
            fullWidth
            size="lg"
            variant="secondary"
            disabled={saveSlots.length === 0}
          >
            Charger une partie
          </Button>

          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
            <Button variant="secondary" fullWidth size="md" onClick={() => setIsOptionsOpen(true)}>
              Options
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Menu de chargement (apparaît à droite) */}
      <Slide direction="left" in={isLoadMenuOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            maxWidth: '28rem',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Charger une partie
            </Typography>
            <Button
              onClick={() => setIsLoadMenuOpen(false)}
              size="sm"
              variant="secondary"
              sx={{ minWidth: 'auto', px: 2 }}
            >
              ✕
            </Button>
          </Box>

          {saveSlots.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Aucune sauvegarde disponible
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                overflowY: 'auto',
                pr: 1,
                flex: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.5)',
                  },
                },
              }}
            >
              {saveSlots.map(slot => (
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
                    <Button onClick={() => handleLoadGame(slot.id)} size="sm" variant="secondary">
                      Charger
                    </Button>
                    <Button onClick={() => handleDeleteSave(slot.id)} size="sm" variant="danger">
                      Supprimer
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Slide>
      <Options isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, slotId: null })}
        onConfirm={confirmDeleteSave}
        title="Supprimer la sauvegarde"
        message="Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="error"
      />
    </Box>
  )
}
