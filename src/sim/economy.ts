import type { EconomyConfig, PolicyConfig } from '@/types/domain'
import { loadEconomyConfig, loadPoliciesConfig } from '@/utils/config-loader'

export interface MonthlyIncome {
  revenue: number
  expenses: number
  monthlyCosts: number // Coûts mensuels (20% des revenus si revenue > 0, sinon 0)
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

  // Calculer le net avant les coûts mensuels
  let net = revenue - expenses

  // Coûts mensuels : si on a des revenus, on perd 20% des revenus
  let monthlyCosts = 0
  if (revenue > 0) {
    monthlyCosts = revenue * 0.2 // 20% des revenus
    net -= monthlyCosts
  }

  return {
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    monthlyCosts: Math.round(monthlyCosts),
    net: Math.round(net),
  }
}

