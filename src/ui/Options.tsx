import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Slider,
  TextField,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { ConfirmModal } from './components/ConfirmModal'
import { loadGameConfig, loadEconomyConfig } from '@/utils/config-loader'
import { useUIStore } from '@/stores/ui-store'
import { skyboxOptions } from '@/core/Skybox'

interface OptionsProps {
  isOpen: boolean
  onClose: () => void
}

export function Options({ isOpen, onClose }: OptionsProps) {
  const [startMoney, setStartMoney] = useState(500)
  const [startHappiness, setStartHappiness] = useState(50)
  const [defaultTax, setDefaultTax] = useState(10)
  const [monthDuration, setMonthDuration] = useState(30)
  const [taxMin, setTaxMin] = useState(5)
  const [taxMax, setTaxMax] = useState(25)
  const [baseTaxPerCitizen, setBaseTaxPerCitizen] = useState(10)
  const [happinessIncomeBonus, setHappinessIncomeBonus] = useState(0.5)
  const skyboxId = useUIStore(state => state.skyboxId)
  const setSkyboxId = useUIStore(state => state.setSkyboxId)
  const defaultTreeCount = useUIStore(state => state.defaultTreeCount)
  const defaultRockCount = useUIStore(state => state.defaultRockCount)
  const setDefaultTreeCount = useUIStore(state => state.setDefaultTreeCount)
  const setDefaultRockCount = useUIStore(state => state.setDefaultRockCount)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    const loadConfigs = async () => {
      const gameConfig = await loadGameConfig()
      const economyConfig = await loadEconomyConfig()

      setStartMoney(gameConfig.startMoney)
      setStartHappiness(50) // Default value
      setDefaultTax(10) // Default value
      setMonthDuration(economyConfig.monthDurationSeconds)
      setTaxMin(economyConfig.taxMin)
      setTaxMax(economyConfig.taxMax)
      setBaseTaxPerCitizen(economyConfig.baseTaxPerCitizen)
      setHappinessIncomeBonus(economyConfig.happinessIncomeBonus)
    }

    if (isOpen) {
      loadConfigs()
    }
  }, [isOpen])

  const handleSave = async () => {
    // Note: Pour une implémentation complète, il faudrait modifier les fichiers JSON
    // Pour l'instant, on sauvegarde dans localStorage
    const settings = {
      startMoney,
      startHappiness,
      defaultTax,
      monthDuration,
      taxMin,
      taxMax,
      baseTaxPerCitizen,
      happinessIncomeBonus,
    }

    localStorage.setItem('citybuilder_settings', JSON.stringify(settings))
    setShowConfirmModal(true)
  }

  const handleConfirmSave = () => {
    setShowConfirmModal(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Options">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Paramètres de départ
          </Typography>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Argent de départ: {startMoney.toLocaleString('fr-FR')} €
            </Typography>
            <Slider
              value={startMoney}
              onChange={(_, value) => setStartMoney(value as number)}
              min={0}
              max={100000}
              step={1000}
              marks={[
                { value: 0, label: '0 €' },
                { value: 100000, label: '100 000 €' },
              ]}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Bonheur de départ: {startHappiness}%
            </Typography>
            <Slider
              value={startHappiness}
              onChange={(_, value) => setStartHappiness(value as number)}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 100, label: '100%' },
              ]}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Taux d'impôt par défaut: {defaultTax}%
            </Typography>
            <Slider
              value={defaultTax}
              onChange={(_, value) => setDefaultTax(value as number)}
              min={5}
              max={25}
              step={1}
              marks={[
                { value: 5, label: '5%' },
                { value: 25, label: '25%' },
              ]}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Paramètres économiques
          </Typography>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Impôt de base par citoyen: {baseTaxPerCitizen} €
            </Typography>
            <Slider
              value={baseTaxPerCitizen}
              onChange={(_, value) => setBaseTaxPerCitizen(value as number)}
              min={1}
              max={50}
              step={1}
              marks={[
                { value: 1, label: '1 €' },
                { value: 50, label: '50 €' },
              ]}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Bonus revenus par point de bonheur: {happinessIncomeBonus}%
            </Typography>
            <Slider
              value={happinessIncomeBonus}
              onChange={(_, value) => setHappinessIncomeBonus(value as number)}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0%' },
                { value: 2, label: '2%' },
              ]}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Impôt minimum (%)"
              type="number"
              value={taxMin}
              onChange={e => setTaxMin(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
              sx={{ flex: 1 }}
            />

            <TextField
              label="Impôt maximum (%)"
              type="number"
              value={taxMax}
              onChange={e => setTaxMax(Number(e.target.value))}
              inputProps={{ min: 10, max: 50 }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Objets décoratifs
          </Typography>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Nombre d'arbres par défaut: {defaultTreeCount}
            </Typography>
            <Slider
              value={defaultTreeCount}
              onChange={(_, value) => setDefaultTreeCount(value as number)}
              min={0}
              max={200}
              step={5}
              marks={[
                { value: 0, label: '0' },
                { value: 100, label: '100' },
                { value: 200, label: '200' },
              ]}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Nombre de rochers par défaut: {defaultRockCount}
            </Typography>
            <Slider
              value={defaultRockCount}
              onChange={(_, value) => setDefaultRockCount(value as number)}
              min={0}
              max={30}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 15, label: '15' },
                { value: 30, label: '30' },
              ]}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h4" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Paramètres visuels
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="skybox-select-label">Skybox</InputLabel>
            <Select
              labelId="skybox-select-label"
              id="skybox-select"
              value={skyboxId}
              label="Skybox"
              onChange={e => setSkyboxId(e.target.value)}
            >
              {skyboxOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
          <Button onClick={handleSave} sx={{ flex: 1 }}>
            Sauvegarder
          </Button>
          <Button onClick={onClose} variant="secondary" sx={{ flex: 1 }}>
            Annuler
          </Button>
        </Box>
      </Box>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Paramètres sauvegardés"
        message="Les modifications seront appliquées uniquement pour la prochaine partie."
        confirmText="Ok, appliquer"
        cancelText="Annuler"
        confirmColor="primary"
      />
    </Modal>
  )
}
