import type { BuildingType } from '@/types/domain'

export const buildingLabels: Record<BuildingType, string> = {
  road: 'Route',
  roadTurn: 'Virage',
  house: 'Maison',
  apartment: 'Immeuble HLM',
  hospital: 'Hôpital',
  school: 'École',
  police: 'Commissariat',
  fire: 'Caserne de pompiers',
  park: 'Parc',
  parkLarge: 'Grand parc',
  monument: 'Monument',
  skycraper: 'Gratte-ciel',
  prison: 'Prison',
  church: 'Église',
  bar: 'Bar',
}

