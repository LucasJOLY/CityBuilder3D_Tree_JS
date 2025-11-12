import { useState, useEffect } from 'react'
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
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Zones disponibles</h3>
          <p className="text-sm text-gray-600">
            Débloquez de nouvelles zones pour étendre votre ville.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {availableZones.map((zone, index) => (
            <div
              key={index}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    Zone {zone.width}x{zone.height}
                  </p>
                  <p className="text-sm text-gray-600">
                    Position: ({zone.x}, {zone.y})
                  </p>
                </div>
                <span className="font-bold text-primary">
                  {zone.price?.toLocaleString('fr-FR')} €
                </span>
              </div>
              <Button
                onClick={() => handleBuyZone(zone)}
                disabled={money < (zone.price || 0)}
                size="sm"
                className="w-full"
              >
                Acheter
              </Button>
            </div>
          ))}
        </div>

        {availableZones.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Toutes les zones sont débloquées !
          </div>
        )}
      </div>
    </Modal>
  )
}

