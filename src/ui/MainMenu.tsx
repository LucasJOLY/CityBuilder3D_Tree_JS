import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { useWorldStore } from '@/stores/world-store'
import { loadSaveSlots, deleteSaveSlot } from '@/utils/save-manager'

export function MainMenu() {
  const setScreen = useUIStore((state) => state.setScreen)
  const reset = useGameStore((state) => state.reset)
  const initializeGrid = useWorldStore((state) => state.initializeGrid)
  const [saveSlots, setSaveSlots] = useState<Array<{ id: string; name: string; timestamp: number }>>([])

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
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          City Builder 3D
        </h1>

        <div className="space-y-4">
          <Button onClick={handleNewGame} className="w-full" size="lg">
            Nouvelle partie
          </Button>

          {saveSlots.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-semibold mb-3">Charger une partie</h2>
              <div className="space-y-2">
                {saveSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{slot.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(slot.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <Button variant="secondary" className="w-full" size="md">
              Options
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <Button
              variant="secondary"
              className="w-full"
              size="sm"
              onClick={() => alert('Crédits à venir')}
            >
              Crédits
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

