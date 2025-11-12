import { useState, useEffect } from 'react'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadGameConfig } from '@/utils/config-loader'

export function Admin() {
  const isOpen = useUIStore((state) => state.isAdminOpen)
  const closeAdmin = useUIStore((state) => state.closeAdmin)
  const adminCode = useUIStore((state) => state.adminCode)
  const setAdminCode = useUIStore((state) => state.setAdminCode)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [correctCode, setCorrectCode] = useState('')

  const addMoney = useGameStore((state) => state.addMoney)
  const addCitizens = useGameStore((state) => state.addCitizens)
  const setHappiness = useGameStore((state) => state.setHappiness)

  useEffect(() => {
    loadGameConfig().then((config) => {
      setCorrectCode(config.adminCode)
    })
  }, [])

  const handleSubmitCode = () => {
    if (adminCode === correctCode) {
      setIsAuthenticated(true)
    } else {
      alert('Code incorrect')
      setAdminCode('')
    }
  }

  const handleCheat = (type: string, value: number) => {
    switch (type) {
      case 'money':
        addMoney(value)
        break
      case 'citizens':
        addCitizens(value)
        break
      case 'happiness':
        setHappiness(value)
        break
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={closeAdmin} title="Panneau Admin">
      {!isAuthenticated ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code d'accès
            </label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Entrez le code admin"
            />
          </div>
          <Button onClick={handleSubmitCode} className="w-full">
            Accéder
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Mode admin activé. Les cheats désactivent les contraintes du jeu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-2">Argent</h3>
              <div className="space-y-2">
                <Button onClick={() => handleCheat('money', 10000)} size="sm" className="w-full">
                  +10 000 €
                </Button>
                <Button onClick={() => handleCheat('money', 50000)} size="sm" className="w-full">
                  +50 000 €
                </Button>
                <Button onClick={() => handleCheat('money', 100000)} size="sm" className="w-full">
                  +100 000 €
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-2">Citoyens</h3>
              <div className="space-y-2">
                <Button onClick={() => handleCheat('citizens', 50)} size="sm" className="w-full">
                  +50
                </Button>
                <Button onClick={() => handleCheat('citizens', 100)} size="sm" className="w-full">
                  +100
                </Button>
                <Button onClick={() => handleCheat('citizens', 500)} size="sm" className="w-full">
                  +500
                </Button>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-200 rounded-xl col-span-2">
              <h3 className="font-semibold mb-2">Bonheur</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => handleCheat('happiness', 50)} size="sm">
                  50%
                </Button>
                <Button onClick={() => handleCheat('happiness', 75)} size="sm">
                  75%
                </Button>
                <Button onClick={() => handleCheat('happiness', 100)} size="sm">
                  100%
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setIsAuthenticated(false)
              setAdminCode('')
            }}
            variant="danger"
            className="w-full"
          >
            Déconnexion
          </Button>
        </div>
      )}
    </Modal>
  )
}

