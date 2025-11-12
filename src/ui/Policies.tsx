import { useState, useEffect } from 'react'
import { Modal } from './components/Modal'
import { Button } from './components/Button'
import { useUIStore } from '@/stores/ui-store'
import { useGameStore } from '@/stores/game-store'
import { loadPoliciesConfig } from '@/utils/config-loader'
import type { PolicyConfig } from '@/types/domain'

export function Policies() {
  const isOpen = useUIStore((state) => state.isPoliciesOpen)
  const closePolicies = useUIStore((state) => state.closePolicies)
  const activePolicies = useGameStore((state) => state.activePolicies)
  const togglePolicy = useGameStore((state) => state.togglePolicy)
  const [policies, setPolicies] = useState<PolicyConfig[]>([])

  useEffect(() => {
    loadPoliciesConfig().then(setPolicies)
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={closePolicies} title="Politiques">
      <div className="space-y-4">
        {policies.map((policy) => {
          const isActive = activePolicies.includes(policy.id)
          return (
            <div
              key={policy.id}
              className={`p-4 rounded-xl border-2 ${
                isActive ? 'border-primary bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{policy.label}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {policy.taxMultiplier && (
                      <p>
                        Multiplicateur taxes:{' '}
                        <span className="font-semibold">
                          {policy.taxMultiplier > 1 ? '+' : ''}
                          {((policy.taxMultiplier - 1) * 100).toFixed(0)}%
                        </span>
                      </p>
                    )}
                    {policy.happinessDelta && (
                      <p>
                        Bonheur:{' '}
                        <span
                          className={`font-semibold ${
                            policy.happinessDelta > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {policy.happinessDelta > 0 ? '+' : ''}
                          {policy.happinessDelta}%
                        </span>
                      </p>
                    )}
                    {policy.crimeDelta && (
                      <p>
                        Criminalité:{' '}
                        <span
                          className={`font-semibold ${
                            policy.crimeDelta < 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {policy.crimeDelta > 0 ? '+' : ''}
                          {policy.crimeDelta}%
                        </span>
                      </p>
                    )}
                    {policy.maintenanceMultiplier && (
                      <p>
                        Maintenance:{' '}
                        <span className="font-semibold">
                          {policy.maintenanceMultiplier > 1 ? '+' : ''}
                          {((policy.maintenanceMultiplier - 1) * 100).toFixed(0)}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => togglePolicy(policy.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <Button onClick={closePolicies} className="w-full mt-6">
        Fermer
      </Button>
    </Modal>
  )
}

