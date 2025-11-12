import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { loadBuildingsConfig } from '@/utils/config-loader'
import type { BuildingType, BuildingConfig } from '@/types/domain'

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
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeShop} title="Boutique">
      <div className="space-y-6">
        {Object.entries(buildingCategories).map(([category, types]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {types.map((type) => {
                const config = buildings[type]
                if (!config) return null

                const canAfford = money >= config.cost
                const isSelected = selectedBuilding === type

                return (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${!canAfford ? 'opacity-50' : ''}`}
                    onClick={() => canAfford && handleSelectBuilding(type)}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {buildingLabels[type]}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Coût: {config.cost} €
                    </p>
                    {config.citizens > 0 && (
                      <p className="text-xs text-gray-500">
                        Habitants: {config.citizens}
                      </p>
                    )}
                    {config.capacity > 0 && (
                      <p className="text-xs text-gray-500">
                        Capacité: {config.capacity}
                      </p>
                    )}
                    {config.happiness > 0 && (
                      <p className="text-xs text-green-600">
                        Bonheur: +{config.happiness}%
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {selectedBuilding && (
          <div className="mt-4 p-4 bg-primary-50 rounded-xl">
            <p className="text-sm text-primary-800">
              Mode placement actif: {buildingLabels[selectedBuilding]}. Cliquez sur la grille pour
              placer. Appuyez sur R pour tourner.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

