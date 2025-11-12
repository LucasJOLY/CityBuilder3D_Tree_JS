import type { PolicyConfig } from '@/types/domain'
import { loadPoliciesConfig } from '@/utils/config-loader'

export async function getPolicyEffects(
  activePolicies: string[]
): Promise<{
  taxMultiplier: number
  happinessDelta: number
  crimeDelta: number
  maintenanceMultiplier: number
  maintenancePoliceMultiplier: number
}> {
  const policies = await loadPoliciesConfig()

  let taxMultiplier = 1.0
  let happinessDelta = 0
  let crimeDelta = 0
  let maintenanceMultiplier = 1.0
  let maintenancePoliceMultiplier = 1.0

  for (const policyId of activePolicies) {
    const policy = policies.find((p) => p.id === policyId)
    if (!policy) continue

    if (policy.taxMultiplier) {
      taxMultiplier *= policy.taxMultiplier
    }
    if (policy.happinessDelta) {
      happinessDelta += policy.happinessDelta
    }
    if (policy.crimeDelta) {
      crimeDelta += policy.crimeDelta
    }
    if (policy.maintenanceMultiplier) {
      maintenanceMultiplier *= policy.maintenanceMultiplier
    }
    if (policy.maintenancePoliceMultiplier) {
      maintenancePoliceMultiplier *= policy.maintenancePoliceMultiplier
    }
  }

  return {
    taxMultiplier,
    happinessDelta,
    crimeDelta,
    maintenanceMultiplier,
    maintenancePoliceMultiplier,
  }
}

