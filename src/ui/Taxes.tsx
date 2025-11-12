import { useState, useEffect } from 'react'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadEconomyConfig } from '@/utils/config-loader'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { useWorldStore } from '@/stores/world-store'

export function Taxes() {
  const isOpen = useUIStore((state) => state.isTaxesOpen)
  const closeTaxes = useUIStore((state) => state.closeTaxes)
  const currentTax = useGameStore((state) => state.currentTax)
  const setTax = useGameStore((state) => state.setTax)
  const citizens = useGameStore((state) => state.citizens)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const happiness = useGameStore((state) => state.happiness)
  const grid = useWorldStore((state) => state.grid)

  const [taxMin, setTaxMin] = useState(5)
  const [taxMax, setTaxMax] = useState(25)
  const [projectedIncome, setProjectedIncome] = useState<{
    revenue: number
    expenses: number
    net: number
  } | null>(null)

  useEffect(() => {
    loadEconomyConfig().then((config) => {
      setTaxMin(config.taxMin)
      setTaxMax(config.taxMax)
    })
  }, [])

  useEffect(() => {
    const updateProjection = async () => {
      if (grid.length === 0) return

      const buildingCounts = countBuildings(grid)
      const income = await calculateMonthlyIncome(
        citizens,
        currentTax,
        activePolicies,
        happiness,
        buildingCounts
      )
      setProjectedIncome(income)
    }

    updateProjection()
  }, [currentTax, citizens, activePolicies, happiness, grid])

  const handleTaxChange = (value: number) => {
    setTax(value)
  }

  return (
    <Modal isOpen={isOpen} onClose={closeTaxes} title="Gestion des impôts">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taux d'imposition: {currentTax}%
          </label>
          <input
            type="range"
            min={taxMin}
            max={taxMax}
            value={currentTax}
            onChange={(e) => handleTaxChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{taxMin}%</span>
            <span>{taxMax}%</span>
          </div>
        </div>

        {projectedIncome && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">Revenus mensuels estimés</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenus:</span>
              <span className="font-semibold text-green-600">
                +{projectedIncome.revenue.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dépenses:</span>
              <span className="font-semibold text-red-600">
                -{projectedIncome.expenses.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-semibold">Net:</span>
              <span
                className={`font-bold ${
                  projectedIncome.net >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {projectedIncome.net >= 0 ? '+' : ''}
                {projectedIncome.net.toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            Les impôts influencent directement vos revenus mensuels. Un taux élevé génère plus de
            revenus mais peut réduire le bonheur des citoyens.
          </p>
        </div>

        <Button onClick={closeTaxes} className="w-full">
          Fermer
        </Button>
      </div>
    </Modal>
  )
}

