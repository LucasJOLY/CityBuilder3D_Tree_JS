import type { GridCell } from '@/types/domain'
import { getUniqueBuildingsOfType } from '@/world/tiles'
import { manhattanDistance } from '@/utils/math'
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
  // Calculate total citizens - chaque cellule compte comme 1, diviser les gains par le nombre de cellules
  const { loadBuildingsConfig } = await import('@/utils/config-loader')
  const buildings = await loadBuildingsConfig()

  // Compter les maisons (chaque cellule compte comme 1)
  const uniqueHouses = await getUniqueBuildingsOfType(grid, 'house')
  const houseSize = buildings.house?.size || [1, 1]
  const houseCellCount = houseSize[0] * houseSize[1]
  const houseCitizensPerCell = (buildings.house?.citizens || 0) / houseCellCount
  const houseCitizens = uniqueHouses.length * houseCitizensPerCell

  // Compter les appartements (chaque cellule compte comme 1)
  const uniqueApartments = await getUniqueBuildingsOfType(grid, 'apartment')
  const apartmentSize = buildings.apartment?.size || [1, 1]
  const apartmentCellCount = apartmentSize[0] * apartmentSize[1]
  const apartmentCitizensPerCell = (buildings.apartment?.citizens || 0) / apartmentCellCount
  const apartmentCitizens = uniqueApartments.length * apartmentCitizensPerCell

  const totalCitizens = houseCitizens + apartmentCitizens

  // Calculate capacity - diviser par le nombre de cellules
  const uniqueHospitals = await getUniqueBuildingsOfType(grid, 'hospital')
  const hospitalSize = buildings.hospital?.size || [1, 1]
  const hospitalCellCount = hospitalSize[0] * hospitalSize[1]
  const hospitalCapacityPerCell = (buildings.hospital?.capacity || 0) / hospitalCellCount
  const totalHospitalCapacity = uniqueHospitals.length * hospitalCapacityPerCell

  const uniqueSchools = await getUniqueBuildingsOfType(grid, 'school')
  const schoolSize = buildings.school?.size || [1, 1]
  const schoolCellCount = schoolSize[0] * schoolSize[1]
  const schoolCapacityPerCell = (buildings.school?.capacity || 0) / schoolCellCount
  const totalSchoolCapacity = uniqueSchools.length * schoolCapacityPerCell

  // Calculate coverage - utiliser les bâtiments uniques pour le calcul
  const uniquePolice = await getUniqueBuildingsOfType(grid, 'police')
  const uniqueFire = await getUniqueBuildingsOfType(grid, 'fire')

  let coveredHouses = 0
  for (const house of uniqueHouses) {
    let covered = false
    for (const p of uniquePolice) {
      if (manhattanDistance(house.x, house.y, p.x, p.y) <= 12) {
        covered = true
        break
      }
    }
    if (covered) coveredHouses++
  }
  const policeCoverage = uniqueHouses.length > 0 ? (coveredHouses / uniqueHouses.length) * 100 : 0

  coveredHouses = 0
  for (const house of uniqueHouses) {
    let covered = false
    for (const f of uniqueFire) {
      if (manhattanDistance(house.x, house.y, f.x, f.y) <= 10) {
        covered = true
        break
      }
    }
    if (covered) coveredHouses++
  }
  const fireCoverage = uniqueHouses.length > 0 ? (coveredHouses / uniqueHouses.length) * 100 : 0

  // Calculate crime (base crime - police coverage - policy effects)
  let baseCrime = 20
  const policeReduction = Math.max(0, policeCoverage / 100) * 30
  baseCrime -= policeReduction

  const policies = await loadPoliciesConfig()
  for (const policyId of activePolicies) {
    const policy = policies.find(p => p.id === policyId)
    if (policy?.crimeDelta) {
      baseCrime += policy.crimeDelta
    }
  }

  const crime = Math.max(0, Math.min(100, baseCrime))

  // Generate demands
  const demands: string[] = []
  if (totalHospitalCapacity < totalCitizens * 0.8) {
    demands.push("Pas assez d'hôpitaux")
  }
  if (totalSchoolCapacity < totalCitizens * 0.7) {
    demands.push("Pas assez d'écoles")
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
