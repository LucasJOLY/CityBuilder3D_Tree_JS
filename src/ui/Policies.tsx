import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Switch, FormControlLabel } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadPoliciesConfig } from '@/utils/config-loader'
import type { PolicyConfig } from '@/types/domain'

export function Policies() {
  const isOpen = useUIStore((state) => state.isPoliciesOpen)
  const closePolicies = useUIStore((state) => state.closePolicies)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const togglePolicy = useGameStore((state) => state.togglePolicy)
  const [policies, setPolicies] = useState<PolicyConfig[]>([])

  useEffect(() => {
    loadPoliciesConfig().then(setPolicies)
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={closePolicies} title="Politiques">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {policies.map((policy) => {
          const isActive = activePolicies.includes(policy.id)
          return (
            <Paper
              key={policy.id}
              elevation={isActive ? 2 : 1}
              sx={{
                p: 2,
                border: 2,
                borderColor: isActive ? 'primary.main' : 'grey.300',
                bgcolor: isActive ? 'primary.50' : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {policy.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {policy.taxMultiplier && (
                      <Typography variant="body2" color="text.secondary">
                        Multiplicateur taxes:{' '}
                        <Typography component="span" sx={{ fontWeight: 600 }}>
                          {policy.taxMultiplier > 1 ? '+' : ''}
                          {((policy.taxMultiplier - 1) * 100).toFixed(0)}%
                        </Typography>
                      </Typography>
                    )}
                    {policy.happinessDelta && (
                      <Typography variant="body2" color="text.secondary">
                        Bonheur:{' '}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: policy.happinessDelta > 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {policy.happinessDelta > 0 ? '+' : ''}
                          {policy.happinessDelta}%
                        </Typography>
                      </Typography>
                    )}
                    {policy.crimeDelta && (
                      <Typography variant="body2" color="text.secondary">
                        Criminalité:{' '}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: policy.crimeDelta < 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {policy.crimeDelta > 0 ? '+' : ''}
                          {policy.crimeDelta}%
                        </Typography>
                      </Typography>
                    )}
                    {policy.maintenanceMultiplier && (
                      <Typography variant="body2" color="text.secondary">
                        Maintenance:{' '}
                        <Typography component="span" sx={{ fontWeight: 600 }}>
                          {policy.maintenanceMultiplier > 1 ? '+' : ''}
                          {((policy.maintenanceMultiplier - 1) * 100).toFixed(0)}%
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={() => togglePolicy(policy.id)}
                      color="primary"
                    />
                  }
                  label=""
                  sx={{ ml: 2 }}
                />
              </Box>
            </Paper>
          )
        })}
      </Box>

      <Button onClick={closePolicies} fullWidth sx={{ mt: 3 }}>
        Fermer
      </Button>
    </Modal>
  )
}

