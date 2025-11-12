import type { EconomyConfig, PolicyConfig } from '@/types/domain'
import { loadEconomyConfig, loadPoliciesConfig } from '@/utils/config-loader'

export interface MonthlyIncome {
  revenue: number
  expenses: number
  net: number
}

export async function calculateMonthlyIncome(
  citizens: number,
  currentTax: number,
  activePolicies: string[],
  happiness: number,
  buildingCounts: Record<string, number>
): Promise<MonthlyIncome> {
  const economy = await loadEconomyConfig()
  const policies = await loadPoliciesConfig()

  // Calculate tax multiplier from policies
  let taxMultiplier = 1.0
  for (const policyId of activePolicies) {
    const policy = policies.find((p) => p.id === policyId)
    if (policy?.taxMultiplier) {
      taxMultiplier *= policy.taxMultiplier
    }
  }

  // Base revenue
  let revenue = citizens * economy.baseTaxPerCitizen * (currentTax / 10) * taxMultiplier

  // Happiness bonus
  const happinessBonus = 1 + (happiness / 100) * economy.happinessIncomeBonus
  revenue *= happinessBonus

  // Calculate expenses (maintenance)
  let expenses = 0
  for (const [buildingType, count] of Object.entries(buildingCounts)) {
    const maintenance = economy.maintenance[buildingType] || 0
    expenses += maintenance * count
  }

  // Apply maintenance multipliers from policies
  for (const policyId of activePolicies) {
    const policy = policies.find((p) => p.id === policyId)
    if (policy?.maintenanceMultiplier) {
      expenses *= policy.maintenanceMultiplier
    }
    if (policy?.maintenancePoliceMultiplier && buildingCounts.police) {
      const policeMaintenance = economy.maintenance.police * buildingCounts.police
      expenses -= policeMaintenance
      expenses += policeMaintenance * policy.maintenancePoliceMultiplier
    }
  }

  return {
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    net: Math.round(revenue - expenses),
  }
}

