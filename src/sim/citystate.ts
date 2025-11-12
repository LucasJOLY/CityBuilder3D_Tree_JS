import type { GridCell } from '@/types/domain'
import { getAllBuildingsOfType } from '@/world/tiles'
import { manhattanDistance } from '@/utils/math'
import type { PolicyConfig } from '@/types/domain'
import { loadPoliciesConfig } from '@/utils/config-loader'

export interface CityStats {
  totalCitizens: number
  totalCapacity: {
    hospital: number
    school: number
  }
  coverage: {
    police: number
    fire: number
  }
  crime: number
  demands: string[]
}

export async function calculateCityStats(
  grid: GridCell[][],
  activePolicies: string[]
): Promise<CityStats> {
  const gridSize = grid.length
  const houses = getAllBuildingsOfType(grid, 'house')
  const hospitals = getAllBuildingsOfType(grid, 'hospital')
  const schools = getAllBuildingsOfType(grid, 'school')
  const police = getAllBuildingsOfType(grid, 'police')
  const fire = getAllBuildingsOfType(grid, 'fire')

  // Calculate total citizens
  const { loadBuildingsConfig } = await import('@/utils/config-loader')
  const buildings = await loadBuildingsConfig()
  const totalCitizens = houses.reduce((sum, h) => {
    return sum + (buildings.house?.citizens || 0)
  }, 0)

  // Calculate capacity
  const totalHospitalCapacity = hospitals.reduce((sum, h) => {
    return sum + (buildings.hospital?.capacity || 0)
  }, 0)

  const totalSchoolCapacity = schools.reduce((sum, s) => {
    return sum + (buildings.school?.capacity || 0)
  }, 0)

  // Calculate coverage
  let coveredHouses = 0
  for (const house of houses) {
    let covered = false
    for (const p of police) {
      if (manhattanDistance(house.x, house.y, p.x, p.y) <= 12) {
        covered = true
        break
      }
    }
    if (covered) coveredHouses++
  }
  const policeCoverage = houses.length > 0 ? (coveredHouses / houses.length) * 100 : 0

  coveredHouses = 0
  for (const house of houses) {
    let covered = false
    for (const f of fire) {
      if (manhattanDistance(house.x, house.y, f.x, f.y) <= 10) {
        covered = true
        break
      }
    }
    if (covered) coveredHouses++
  }
  const fireCoverage = houses.length > 0 ? (coveredHouses / houses.length) * 100 : 0

  // Calculate crime (base crime - police coverage - policy effects)
  let baseCrime = 20
  const policeReduction = Math.max(0, policeCoverage / 100) * 30
  baseCrime -= policeReduction

  const policies = await loadPoliciesConfig()
  for (const policyId of activePolicies) {
    const policy = policies.find((p) => p.id === policyId)
    if (policy?.crimeDelta) {
      baseCrime += policy.crimeDelta
    }
  }

  const crime = Math.max(0, Math.min(100, baseCrime))

  // Generate demands
  const demands: string[] = []
  if (totalHospitalCapacity < totalCitizens * 0.8) {
    demands.push('Pas assez d\'hôpitaux')
  }
  if (totalSchoolCapacity < totalCitizens * 0.7) {
    demands.push('Pas assez d\'écoles')
  }
  if (policeCoverage < 80) {
    demands.push('Couverture policière insuffisante')
  }
  if (fireCoverage < 80) {
    demands.push('Couverture pompiers insuffisante')
  }
  if (crime > 30) {
    demands.push('Criminalité élevée')
  }

  return {
    totalCitizens,
    totalCapacity: {
      hospital: totalHospitalCapacity,
      school: totalSchoolCapacity,
    },
    coverage: {
      police: Math.round(policeCoverage),
      fire: Math.round(fireCoverage),
    },
    crime: Math.round(crime),
    demands,
  }
}

