import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Divider, IconButton } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { loadBuildingsConfig, loadDecorativeObjectsConfig } from '@/utils/config-loader'
import { Button } from './components/Button'
import { ConfirmModal } from './components/ConfirmModal'
import type {
  BuildingType,
  BuildingConfig,
  DecorativeObjectType,
  DecorativeObjectConfig,
} from '@/types/domain'
import {
  FaRoad,
  FaHome,
  FaHospital,
  FaSchool,
  FaShieldAlt,
  FaFire,
  FaTree,
  FaMonument,
  FaBuilding,
  FaChurch,
  FaBeer,
  FaLock,
} from 'react-icons/fa'
import { Trash2, Move, X } from 'lucide-react'

const buildingLabels: Record<BuildingType, string> = {
  road: 'Route',
  roadTurn: 'Virage',
  house: 'Maison',
  apartment: 'Immeuble HLM',
  hospital: 'Hôpital',
  school: 'École',
  police: 'Commissariat',
  fire: 'Caserne de pompiers',
  park: 'Parc',
  parkLarge: 'Grand parc',
  monument: 'Monument',
  skycraper: 'Gratte-ciel',
  prison: 'Prison',
  church: 'Église',
  bar: 'Bar',
}

const buildingIcons: Record<BuildingType, React.ReactNode> = {
  road: <FaRoad className="w-8 h-8" />,
  roadTurn: <FaRoad className="w-8 h-8" />,
  house: <FaHome className="w-8 h-8" />,
  apartment: <FaBuilding className="w-8 h-8" />,
  hospital: <FaHospital className="w-8 h-8" />,
  school: <FaSchool className="w-8 h-8" />,
  police: <FaShieldAlt className="w-8 h-8" />,
  fire: <FaFire className="w-8 h-8" />,
  park: <FaTree className="w-8 h-8" />,
  parkLarge: <FaTree className="w-8 h-8" />,
  monument: <FaMonument className="w-8 h-8" />,
  skycraper: <FaBuilding className="w-8 h-8" />,
  prison: <FaLock className="w-8 h-8" />,
  church: <FaChurch className="w-8 h-8" />,
  bar: <FaBeer className="w-8 h-8" />,
}

export function BuildingInfo() {
  const selectedPlacedBuilding = useWorldStore(state => state.selectedPlacedBuilding)
  const grid = useWorldStore(state => state.grid)
  const removeBuilding = useWorldStore(state => state.removeBuilding)
  const removeDecorativeObject = useWorldStore(state => state.removeDecorativeObject)
  const isMovingBuilding = useWorldStore(state => state.isMovingBuilding)
  const setIsMovingBuilding = useWorldStore(state => state.setIsMovingBuilding)
  const setSelectedPlacedBuilding = useWorldStore(state => state.setSelectedPlacedBuilding)
  const money = useGameStore(state => state.money)
  const { enqueueSnackbar } = useSnackbar()

  const [buildingConfig, setBuildingConfig] = useState<BuildingConfig | null>(null)
  const [buildingType, setBuildingType] = useState<BuildingType | null>(null)
  const [decorativeObjectConfig, setDecorativeObjectConfig] =
    useState<DecorativeObjectConfig | null>(null)
  const [decorativeObjectType, setDecorativeObjectType] = useState<DecorativeObjectType | null>(
    null
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Gérer la touche Échap pour désélectionner
  useEffect(() => {
    if (!selectedPlacedBuilding) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlacedBuilding(null)
        setIsMovingBuilding(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedPlacedBuilding, setSelectedPlacedBuilding, setIsMovingBuilding])

  const handleClose = () => {
    setSelectedPlacedBuilding(null)
    setIsMovingBuilding(false)
  }

  useEffect(() => {
    if (!selectedPlacedBuilding) {
      setBuildingConfig(null)
      setBuildingType(null)
      setDecorativeObjectConfig(null)
      setDecorativeObjectType(null)
      return
    }

    const cell = grid[selectedPlacedBuilding.y]?.[selectedPlacedBuilding.x]
    if (cell?.buildingType) {
      const type = cell.buildingType
      setBuildingType(type)
      setDecorativeObjectType(null)
      setDecorativeObjectConfig(null)
      loadBuildingsConfig().then(configs => {
        if (type) {
          const config = configs[type]
          if (config) {
            setBuildingConfig(config)
          }
        }
      })
    } else if (cell?.decorativeObject) {
      const type = cell.decorativeObject
      setDecorativeObjectType(type)
      setBuildingType(null)
      setBuildingConfig(null)
      loadDecorativeObjectsConfig().then(configs => {
        const config = configs.find(obj => obj.id === type)
        if (config) {
          setDecorativeObjectConfig(config)
        }
      })
    } else {
      setBuildingConfig(null)
      setBuildingType(null)
      setDecorativeObjectConfig(null)
      setDecorativeObjectType(null)
    }
  }, [selectedPlacedBuilding, grid])

  if (!selectedPlacedBuilding || (!buildingType && !decorativeObjectType)) {
    return null
  }

  const handleDelete = async () => {
    if (buildingType) {
      removeBuilding(selectedPlacedBuilding.x, selectedPlacedBuilding.y)
      setShowDeleteConfirm(false)
    } else if (decorativeObjectType) {
      const removed = await removeDecorativeObject(
        selectedPlacedBuilding.x,
        selectedPlacedBuilding.y
      )
      if (removed) {
        enqueueSnackbar('Objet décoratif supprimé', {
          variant: 'success',
          autoHideDuration: 2000,
        })
        setSelectedPlacedBuilding(null)
      } else {
        enqueueSnackbar("Pas assez d'argent pour supprimer cet objet", {
          variant: 'error',
          autoHideDuration: 3000,
        })
      }
      setShowDeleteConfirm(false)
    }
  }

  const handleMove = () => {
    setIsMovingBuilding(true)
  }

  const getBuildingEffects = () => {
    const effects: string[] = []

    if (!buildingConfig) return effects

    if (buildingConfig.citizens > 0) {
      effects.push(`+${buildingConfig.citizens} habitants`)
    }

    if (buildingConfig.capacity > 0) {
      effects.push(`Capacité: ${buildingConfig.capacity}`)
    }

    if (buildingConfig.coverage > 0) {
      if (buildingType === 'police') {
        effects.push(`-${buildingConfig.coverage * 2}% de criminalité`)
      } else if (buildingType === 'fire') {
        effects.push(`-${buildingConfig.coverage * 2}% de risque d'incendie`)
      } else {
        effects.push(`Couverture: ${buildingConfig.coverage} cases`)
      }
    }

    if (buildingConfig.happiness !== 0) {
      if (buildingConfig.happiness > 0) {
        effects.push(`+${buildingConfig.happiness}% de bonheur`)
      } else {
        effects.push(`${buildingConfig.happiness}% de bonheur`)
      }
    }

    return effects
  }

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: 320,
          maxHeight: 'calc(100vh - 32px)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ color: 'inherit' }}>
            {buildingType ? buildingIcons[buildingType] : <FaTree className="w-8 h-8" />}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
            {buildingType
              ? buildingLabels[buildingType]
              : decorativeObjectConfig?.label || 'Objet décoratif'}
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Fermer"
            sx={{
              color: 'inherit',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <X className="w-5 h-5" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {buildingType && buildingConfig ? (
              <>
                {/* Infos générales */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                  >
                    Informations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      Taille: {buildingConfig.size[0]} × {buildingConfig.size[1]} cases
                    </Typography>
                    <Typography variant="body2">Coût: {buildingConfig.cost} €</Typography>
                    {buildingConfig.requiresRoad && (
                      <Typography variant="body2" sx={{ color: 'warning.main' }}>
                        Nécessite une route
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Effets */}
                {getBuildingEffects().length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                    >
                      Effets
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {getBuildingEffects().map((effect, index) => (
                        <Typography key={index} variant="body2" sx={{ color: 'success.main' }}>
                          • {effect}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            ) : decorativeObjectType && decorativeObjectConfig ? (
              <>
                {/* Infos pour objet décoratif */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                  >
                    Informations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      Taille: {decorativeObjectConfig.size[0]} × {decorativeObjectConfig.size[1]}{' '}
                      case(s)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'error.main' }}>
                      Coût de destruction: {decorativeObjectConfig.destructionCost} €
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      Cet objet ne peut pas être déplacé, seulement supprimé.
                    </Typography>
                    {money < decorativeObjectConfig.destructionCost && (
                      <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
                        Vous n'avez pas assez d'argent pour supprimer cet objet.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            ) : null}
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} sx={{ flex: 1 }}>
            <Trash2 className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
            {decorativeObjectType ? 'Supprimer' : 'Supprimer'}
          </Button>
          {buildingType && (
            <Button
              variant="primary"
              onClick={handleMove}
              sx={{ flex: 1 }}
              disabled={isMovingBuilding}
            >
              <Move className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
              {isMovingBuilding ? 'Déplacement...' : 'Déplacer'}
            </Button>
          )}
        </Box>
      </Paper>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={decorativeObjectType ? "Supprimer l'objet décoratif" : 'Supprimer le bâtiment'}
        message={
          decorativeObjectType
            ? `Êtes-vous sûr de vouloir supprimer cet objet décoratif ? Cela coûtera ${decorativeObjectConfig?.destructionCost} €.`
            : `Êtes-vous sûr de vouloir supprimer ce bâtiment ? Cette action est irréversible.`
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="error"
      />
    </>
  )
}
