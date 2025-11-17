import { z } from 'zod'
import type {
  BuildingConfig,
  PolicyConfig,
  EconomyConfig,
  GameConfig,
} from './domain'

export const BuildingConfigSchema = z.object({
  size: z.tuple([z.number(), z.number()]),
  cost: z.number(),
  requiresRoad: z.boolean(),
  citizens: z.number(),
  capacity: z.number(),
  coverage: z.number(),
  happiness: z.number(),
  maintKey: z.string(),
})

export const PolicyConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  taxMultiplier: z.number().optional(),
  happinessDelta: z.number().optional(),
  crimeDelta: z.number().optional(),
  maintenanceMultiplier: z.number().optional(),
  maintenancePoliceMultiplier: z.number().optional(),
})

export const EconomyConfigSchema = z.object({
  baseTaxPerCitizen: z.number(),
  monthDurationSeconds: z.number(),
  maintenance: z.record(z.string(), z.number()),
  happinessIncomeBonus: z.number(),
  taxMin: z.number(),
  taxMax: z.number(),
})

export const GameConfigSchema = z.object({
  gridSize: z.number(),
  startMoney: z.number(),
  startCitizens: z.number(),
  adminCode: z.string(),
})

export function validateBuildingConfig(
  data: unknown
): asserts data is Record<string, BuildingConfig> {
  const schema = z.record(z.string(), BuildingConfigSchema)
  schema.parse(data)
}

export function validatePoliciesConfig(
  data: unknown
): asserts data is PolicyConfig[] {
  z.array(PolicyConfigSchema).parse(data)
}

export function validateEconomyConfig(
  data: unknown
): asserts data is EconomyConfig {
  EconomyConfigSchema.parse(data)
}

export function validateGameConfig(
  data: unknown
): asserts data is GameConfig {
  GameConfigSchema.parse(data)
}

