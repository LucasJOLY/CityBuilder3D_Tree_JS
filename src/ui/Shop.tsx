import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Paper } from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { loadBuildingsConfig } from '@/utils/config-loader'
import type { BuildingType, BuildingConfig } from '@/types/domain'
import {
  FaRoad,
  FaHome,
  FaHospital,
  FaSchool,
  FaShieldAlt,
  FaFire,
  FaTree,
  FaMonument,
} from 'react-icons/fa'

const buildingCategories: Record<string, BuildingType[]> = {
  Routes: ['road'],
  Résidentiel: ['house'],
  Services: ['hospital', 'school', 'police', 'fire'],
  Loisirs: ['park'],
  Monuments: ['monument'],
}

const buildingLabels: Record<BuildingType, string> = {
  road: 'Route',
  house: 'Maison',
  hospital: 'Hôpital',
  school: 'École',
  police: 'Commissariat',
  fire: 'Caserne de pompiers',
  park: 'Parc',
  monument: 'Monument',
}

const buildingIcons: Record<BuildingType, React.ReactNode> = {
  road: <FaRoad className="w-8 h-8" />,
  house: <FaHome className="w-8 h-8" />,
  hospital: <FaHospital className="w-8 h-8" />,
  school: <FaSchool className="w-8 h-8" />,
  police: <FaShieldAlt className="w-8 h-8" />,
  fire: <FaFire className="w-8 h-8" />,
  park: <FaTree className="w-8 h-8" />,
  monument: <FaMonument className="w-8 h-8" />,
}

export function Shop() {
  const isOpen = useUIStore((state) => state.isShopOpen)
  const closeShop = useUIStore((state) => state.closeShop)
  const setSelectedBuilding = useWorldStore((state) => state.setSelectedBuilding)
  const selectedBuilding = useWorldStore((state) => state.selectedBuilding)
  const money = useGameStore((state) => state.money)
  const [buildings, setBuildings] = useState<Record<string, BuildingConfig>>({})

  useEffect(() => {
    loadBuildingsConfig().then(setBuildings)
  }, [])

  const handleSelectBuilding = (type: BuildingType) => {
    if (selectedBuilding === type) {
      setSelectedBuilding(null)
    } else {
      setSelectedBuilding(type)
      // Fermer le modal après sélection pour permettre le placement
      closeShop()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeShop} title="Boutique">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Object.entries(buildingCategories).map(([category, types]) => (
          <Box key={category}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {category}
            </Typography>
            <Grid container spacing={2}>
              {types.map((type) => {
                const config = buildings[type]
                if (!config) return null

                const canAfford = money >= config.cost
                const isSelected = selectedBuilding === type

                return (
                  <Grid item xs={6} md={4} key={type}>
                    <Paper
                      elevation={isSelected ? 4 : 1}
                      sx={{
                        p: 2,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': canAfford ? { transform: 'scale(1.05)' } : {},
                        '&:active': canAfford ? { transform: 'scale(0.95)' } : {},
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'grey.300',
                        bgcolor: isSelected ? 'primary.50' : 'background.paper',
                        opacity: canAfford ? 1 : 0.5,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canAfford) {
                          handleSelectBuilding(type)
                        }
                      }}
                    >
                      <Box sx={{ mb: 1.5, color: 'primary.main' }}>
                        {buildingIcons[type]}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {buildingLabels[type]}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                        {config.cost.toLocaleString('fr-FR')} €
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {config.citizens > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Habitants: {config.citizens}
                          </Typography>
                        )}
                        {config.capacity > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Capacité: {config.capacity}
                          </Typography>
                        )}
                        {config.happiness > 0 && (
                          <Typography variant="caption" color="success.main">
                            Bonheur: +{config.happiness}%
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        ))}

        {selectedBuilding && (
          <Paper
            elevation={2}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'primary.50',
              border: 2,
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.dark' }}>
              Mode placement actif: <strong>{buildingLabels[selectedBuilding]}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.dark', mt: 0.5, display: 'block' }}>
              Cliquez sur la grille pour placer. Appuyez sur <kbd style={{ padding: '2px 4px', background: 'white', borderRadius: '4px', fontSize: '0.75rem' }}>R</kbd> pour tourner.
            </Typography>
          </Paper>
        )}
      </Box>
    </Modal>
  )
}

