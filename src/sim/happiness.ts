import type { PolicyConfig } from '@/types/domain'
import { loadPoliciesConfig } from '@/utils/config-loader'
import { manhattanDistance } from '@/utils/math'
import type { GridCell } from '@/types/domain'

export interface HappinessFactors {
  base: number
  parks: number
  services: number
  policies: number
  crime: number
  total: number
}

export async function calculateHappiness(
  grid: GridCell[][],
  activePolicies: string[],
  crime: number
): Promise<HappinessFactors> {
  const policies = await loadPoliciesConfig()
  const gridSize = grid.length

  let parksBonus = 0
  let servicesBonus = 0

  // Count buildings and their coverage
  const houses: Array<{ x: number; y: number }> = []
  const hospitals: Array<{ x: number; y: number }> = []
  const schools: Array<{ x: number; y: number }> = []
  const parks: Array<{ x: number; y: number }> = []
  const monuments: Array<{ x: number; y: number }> = []

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y]?.[x]
      if (!cell?.buildingType) continue

      switch (cell.buildingType) {
        case 'house':
          houses.push({ x, y })
          break
        case 'hospital':
          hospitals.push({ x, y })
          break
        case 'school':
          schools.push({ x, y })
          break
        case 'park':
          parks.push({ x, y })
          break
        case 'monument':
          monuments.push({ x, y })
          break
      }
    }
  }

  // Calculate coverage bonuses
  for (const house of houses) {
    let coveredByPark = false
    let coveredByMonument = false
    let coveredByHospital = false
    let coveredBySchool = false

    for (const park of parks) {
      if (manhattanDistance(house.x, house.y, park.x, park.y) <= 5) {
        coveredByPark = true
        break
      }
    }

    for (const monument of monuments) {
      if (manhattanDistance(house.x, house.y, monument.x, monument.y) <= 15) {
        coveredByMonument = true
        break
      }
    }

    for (const hospital of hospitals) {
      if (manhattanDistance(house.x, house.y, hospital.x, hospital.y) <= 10) {
        coveredByHospital = true
        break
      }
    }

    for (const school of schools) {
      if (manhattanDistance(house.x, house.y, school.x, school.y) <= 8) {
        coveredBySchool = true
        break
      }
    }

    if (coveredByPark) parksBonus += 5
    if (coveredByMonument) parksBonus += 15
    if (coveredByHospital) servicesBonus += 3
    if (coveredBySchool) servicesBonus += 2
  }

  const avgParksBonus = houses.length > 0 ? parksBonus / houses.length : 0
  const avgServicesBonus = houses.length > 0 ? servicesBonus / houses.length : 0

  // Policy bonuses
  let policyBonus = 0
  for (const policyId of activePolicies) {
    const policy = policies.find((p) => p.id === policyId)
    if (policy?.happinessDelta) {
      policyBonus += policy.happinessDelta
    }
  }

  const base = 50
  const crimePenalty = Math.max(0, crime * 0.5)

  const total = Math.max(
    0,
    Math.min(
      100,
      base + avgParksBonus + avgServicesBonus + policyBonus - crimePenalty
    )
  )

  return {
    base,
    parks: Math.round(avgParksBonus),
    services: Math.round(avgServicesBonus),
    policies: policyBonus,
    crime: -Math.round(crimePenalty),
    total: Math.round(total),
  }
}

