import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Grid } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { loadGameConfig } from '@/utils/config-loader'
import type { Zone } from '@/types/domain'

export function Zones() {
  const isOpen = useUIStore((state) => state.isZonesOpen)
  const closeZones = useUIStore((state) => state.closeZones)
  const unlockedZones = useGameStore((state) => state.unlockedZones)
  const unlockZone = useGameStore((state) => state.unlockZone)
  const money = useGameStore((state) => state.money)
  const addMoney = useGameStore((state) => state.addMoney)
  const grid = useWorldStore((state) => state.grid)

  const [availableZones, setAvailableZones] = useState<Zone[]>([])
  const [zonePrices, setZonePrices] = useState<{
    small: number
    medium: number
    large: number
  }>({ small: 500, medium: 1000, large: 2000 })

  useEffect(() => {
    loadGameConfig().then((config) => {
      setZonePrices(config.zonePrices)
      // Generate locked zones (simplified - in real game, zones would be predefined)
      const gridSize = config.gridSize
      const zones: Zone[] = []
      // Example: create some locked zones
      for (let y = 0; y < gridSize; y += 10) {
        for (let x = 0; x < gridSize; x += 10) {
          if (x === 0 && y === 0) continue // Skip initial unlocked zone
          const size = Math.random() > 0.5 ? 'medium' : 'small'
          zones.push({
            x,
            y,
            width: size === 'small' ? 10 : 15,
            height: size === 'small' ? 10 : 15,
            unlocked: false,
            price: zonePrices[size],
          })
        }
      }
      setAvailableZones(zones.filter((z) => !z.unlocked))
    })
  }, [zonePrices])

  const handleBuyZone = (zone: Zone) => {
    if (money >= (zone.price || 0)) {
      addMoney(-(zone.price || 0))
      unlockZone({
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      })
      setAvailableZones((zones) => zones.filter((z) => z !== zone))
    } else {
      alert('Fonds insuffisants')
    }
  }

  const gridSize = grid.length || 50

  return (
    <Modal isOpen={isOpen} onClose={closeZones} title="Achat de zones">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Zones disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Débloquez de nouvelles zones pour étendre votre ville.
          </Typography>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
            maxHeight: '24rem',
            overflowY: 'auto',
          }}
        >
          {availableZones.map((zone, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                border: 2,
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'primary.main',
                },
                transition: 'border-color 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Zone {zone.width}x{zone.height}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Position: ({zone.x}, {zone.y})
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {zone.price?.toLocaleString('fr-FR')} €
                </Typography>
              </Box>
              <Button
                onClick={() => handleBuyZone(zone)}
                disabled={money < (zone.price || 0)}
                size="sm"
                fullWidth
              >
                Acheter
              </Button>
            </Paper>
          ))}
        </Box>

        {availableZones.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Toutes les zones sont débloquées !
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

