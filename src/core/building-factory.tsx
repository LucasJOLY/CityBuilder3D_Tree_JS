import { Box, Edges } from '@react-three/drei'
import type { BuildingType, TileOrientation } from '@/types/domain'

export interface BuildingShapeProps {
  type: BuildingType
  size: [number, number]
  orientation: TileOrientation
  position: [number, number, number]
  key?: string
  isSelected?: boolean
}

const buildingColors: Record<BuildingType, string> = {
  road: '#444444',
  house: '#8B4513',
  hospital: '#FFFFFF',
  school: '#FFD700',
  police: '#0000FF',
  fire: '#FF0000',
  park: '#00FF00',
  monument: '#FFD700',
}

/**
 * Fonction centralisée pour créer les formes 3D des bâtiments.
 * Cette fonction sera facilement remplaçable par des modèles glTF plus tard.
 */
export function createBuildingShape({
  type,
  size,
  orientation,
  position,
  key,
  isSelected = false,
}: BuildingShapeProps) {
  const rotation = (orientation * Math.PI) / 2
  const color = buildingColors[type]

  // Routes: rectangles légèrement épais
  if (type === 'road') {
    return (
      <Box
        key={key || `${position[0]}-${position[2]}`}
        args={[size[0], 0.1, size[1]]}
        position={position}
        rotation={[0, rotation, 0]}
      >
        <meshStandardMaterial color={color} />
        {isSelected && <Edges scale={1.1} threshold={15} color="#ff8800" />}
      </Box>
    )
  }

  // Autres bâtiments: cubes/rectangles avec hauteur proportionnelle
  const height = Math.max(size[0], size[1]) * 0.5

  return (
    <Box
      key={key || `${position[0]}-${position[2]}`}
      args={[size[0], height, size[1]]}
      position={position}
      rotation={[0, rotation, 0]}
    >
      <meshStandardMaterial color={color} />
      {isSelected && <Edges scale={1.1} threshold={15} color="#ff8800" />}
    </Box>
  )
}

