import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Paper } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadGameConfig } from '@/utils/config-loader'

export function Admin() {
  const isOpen = useUIStore(state => state.isAdminOpen)
  const closeAdmin = useUIStore(state => state.closeAdmin)
  const adminCode = useUIStore(state => state.adminCode)
  const setAdminCode = useUIStore(state => state.setAdminCode)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [correctCode, setCorrectCode] = useState('')

  const addMoney = useGameStore(state => state.addMoney)
  const setMoney = useGameStore(state => state.setMoney)
  const addCitizens = useGameStore(state => state.addCitizens)
  const setHappiness = useGameStore(state => state.setHappiness)

  useEffect(() => {
    loadGameConfig().then(config => {
      setCorrectCode(config.adminCode)
    })
  }, [])

  const handleSubmitCode = () => {
    if (adminCode === correctCode) {
      setIsAuthenticated(true)
    } else {
      alert('Code incorrect')
      setAdminCode('')
    }
  }

  const handleCheat = (type: string, value: number) => {
    switch (type) {
      case 'money':
        addMoney(value)
        break
      case 'moneyRemove':
        addMoney(-value) // Retirer de l'argent
        break
      case 'citizens':
        addCitizens(value)
        break
      case 'happiness':
        setHappiness(value)
        break
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={closeAdmin} title="Panneau Admin">
      {!isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Code d'accès"
            type="password"
            value={adminCode}
            onChange={e => setAdminCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmitCode()}
            placeholder="Entrez le code admin"
            fullWidth
          />
          <Button onClick={handleSubmitCode} fullWidth>
            Accéder
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Paper elevation={1} sx={{ p: 2, border: 2, borderColor: 'grey.300', flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Argent
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button onClick={() => handleCheat('money', 500)} size="sm" fullWidth>
                  +500 €
                </Button>
                <Button onClick={() => handleCheat('money', 1000)} size="sm" fullWidth>
                  +1000 €
                </Button>
                <Button
                  onClick={() => handleCheat('moneyRemove', 500)}
                  size="sm"
                  fullWidth
                  variant="danger"
                >
                  -500 €
                </Button>
                <Button
                  onClick={() => handleCheat('moneyRemove', 1000)}
                  size="sm"
                  fullWidth
                  variant="danger"
                >
                  -1000 €
                </Button>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, border: 2, borderColor: 'grey.300', flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Citoyens
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button onClick={() => handleCheat('citizens', 50)} size="sm" fullWidth>
                  +50
                </Button>
                <Button onClick={() => handleCheat('citizens', 100)} size="sm" fullWidth>
                  +100
                </Button>
                <Button onClick={() => handleCheat('citizens', 500)} size="sm" fullWidth>
                  +500
                </Button>
              </Box>
            </Paper>
          </Box>

          <Paper elevation={1} sx={{ p: 2, border: 2, borderColor: 'grey.300' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Bonheur
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => handleCheat('happiness', 50)} size="sm" sx={{ flex: 1 }}>
                50%
              </Button>
              <Button onClick={() => handleCheat('happiness', 75)} size="sm" sx={{ flex: 1 }}>
                75%
              </Button>
              <Button onClick={() => handleCheat('happiness', 100)} size="sm" sx={{ flex: 1 }}>
                100%
              </Button>
            </Box>
          </Paper>

          <Button
            onClick={() => {
              setIsAuthenticated(false)
              setAdminCode('')
            }}
            variant="danger"
            fullWidth
          >
            Déconnexion
          </Button>
        </Box>
      )}
    </Modal>
  )
}
