import type {
  BuildingConfig,
  PolicyConfig,
  EconomyConfig,
  GameConfig,
} from '@/types/domain'
import {
  validateBuildingConfig,
  validatePoliciesConfig,
  validateEconomyConfig,
  validateGameConfig,
} from '@/types/dto'

let buildingsConfig: Record<string, BuildingConfig> | null = null
let policiesConfig: PolicyConfig[] | null = null
let economyConfig: EconomyConfig | null = null
let gameConfig: GameConfig | null = null

export async function loadBuildingsConfig(): Promise<
  Record<string, BuildingConfig>
> {
  if (buildingsConfig) return buildingsConfig

  const response = await fetch('/src/config/buildings.json')
  const data = await response.json()
  validateBuildingConfig(data)
  buildingsConfig = data
  return buildingsConfig
}

export async function loadPoliciesConfig(): Promise<PolicyConfig[]> {
  if (policiesConfig) return policiesConfig

  const response = await fetch('/src/config/policies.json')
  const data = await response.json()
  validatePoliciesConfig(data)
  policiesConfig = data
  return policiesConfig
}

export async function loadEconomyConfig(): Promise<EconomyConfig> {
  if (economyConfig) return economyConfig

  const response = await fetch('/src/config/economy.json')
  const data = await response.json()
  validateEconomyConfig(data)
  economyConfig = data
  return economyConfig
}

export async function loadGameConfig(): Promise<GameConfig> {
  if (gameConfig) return gameConfig

  const response = await fetch('/src/config/game.json')
  const data = await response.json()
  validateGameConfig(data)
  gameConfig = data
  return gameConfig
}

