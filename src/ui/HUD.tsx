import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import { useUIStore } from '@/stores/ui-store'
import { useWorldStore } from '@/stores/world-store'
import { Button } from './components/Button'
import { Shop } from './Shop'
import { Taxes } from './Taxes'
import { Policies } from './Policies'
import { Zones } from './Zones'
import { Admin } from './Admin'
import { saveGame } from '@/utils/save-manager'
import { calculateMonthlyIncome } from '@/sim/economy'
import { countBuildings } from '@/world/tiles'
import { calculateHappiness } from '@/sim/happiness'
import { calculateCityStats } from '@/sim/citystate'
import { loadEconomyConfig } from '@/utils/config-loader'
import { DollarSign, Users, Heart, ShoppingCart, Settings, Map, Shield, Save } from 'lucide-react'

export function HUD() {
  const money = useGameStore((state) => state.money)
  const citizens = useGameStore((state) => state.citizens)
  const happiness = useGameStore((state) => state.happiness)
  const grid = useWorldStore((state) => state.grid)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const currentTax = useGameStore((state) => state.currentTax)
  const setHappiness = useGameStore((state) => state.setHappiness)
  const addMoney = useGameStore((state) => state.addMoney)
  const setCitizens = useGameStore((state) => state.setCitizens)

  const openShop = useUIStore((state) => state.openShop)
  const openTaxes = useUIStore((state) => state.openTaxes)
  const openPolicies = useUIStore((state) => state.openPolicies)
  const openZones = useUIStore((state) => state.openZones)
  const setScreen = useUIStore((state) => state.setScreen)

  const [monthTimer, setMonthTimer] = useState(0)

  useEffect(() => {
    const updateGame = async () => {
      if (grid.length === 0) return

      const buildingCounts = countBuildings(grid)
      const income = await calculateMonthlyIncome(
        citizens,
        currentTax,
        activePolicies,
        happiness,
        buildingCounts
      )

      const cityStats = await calculateCityStats(grid, activePolicies)
      const happinessFactors = await calculateHappiness(grid, activePolicies, cityStats.crime)

      setHappiness(happinessFactors.total)
      setCitizens(cityStats.totalCitizens)
      addMoney(income.net)
    }

    const interval = setInterval(async () => {
      const economy = await loadEconomyConfig()
      setMonthTimer((prev) => {
        const newTime = prev + 1
        if (newTime >= economy.monthDurationSeconds) {
          updateGame()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [grid, citizens, currentTax, activePolicies, happiness, setHappiness, addMoney, setCitizens])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        openAdmin()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const openAdmin = useUIStore((state) => state.openAdmin)

  const handleSave = async () => {
    await saveGame('save_' + Date.now(), 'Sauvegarde ' + new Date().toLocaleString('fr-FR'))
    alert('Partie sauvegardée !')
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-primary shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6">
              <motion.div
                className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-700">{money.toLocaleString('fr-FR')} €</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-700">{citizens}</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="w-5 h-5 text-pink-600" />
                <span className="font-bold text-pink-700">{happiness}%</span>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={openShop} variant="secondary" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Boutique
              </Button>
              <Button onClick={openTaxes} variant="secondary" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Impôts
              </Button>
              <Button onClick={openPolicies} variant="secondary" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Politiques
              </Button>
              <Button onClick={openZones} variant="secondary" size="sm">
                <Map className="w-4 h-4 mr-2" />
                Zones
              </Button>
              <Button onClick={handleSave} variant="secondary" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                onClick={() => setScreen('menu')}
                variant="secondary"
                size="sm"
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Shop />
      <Taxes />
      <Policies />
      <Zones />
      <Admin />
    </>
  )
}

