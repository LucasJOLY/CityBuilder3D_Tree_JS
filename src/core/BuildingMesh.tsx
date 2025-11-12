import { useMemo } from 'react'
import { Box } from '@react-three/drei'
import type { BuildingType, TileOrientation } from '@/types/domain'
import { loadBuildingsConfig } from '@/utils/config-loader'
import { useEffect, useState } from 'react'

interface BuildingMeshProps {
  x: number
  y: number
  type: BuildingType
  orientation: TileOrientation
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

export function BuildingMesh({ x, y, type, orientation }: BuildingMeshProps) {
  const [size, setSize] = useState<[number, number]>([1, 1])

  useEffect(() => {
    loadBuildingsConfig().then((configs) => {
      const config = configs[type]
      if (config) {
        setSize(config.size)
      }
    })
  }, [type])

  const position = useMemo(() => {
    const gridSize = 50
    const offsetX = x - gridSize / 2 + size[0] / 2
    const offsetZ = y - gridSize / 2 + size[1] / 2
    return [offsetX, size[0] / 2, offsetZ] as [number, number, number]
  }, [x, y, size])

  const rotation = useMemo(() => {
    return (orientation * Math.PI) / 2
  }, [orientation])

  return (
    <Box
      args={[size[0], size[0] * 0.5, size[1]]}
      position={position}
      rotation={[0, rotation, 0]}
    >
      <meshStandardMaterial color={buildingColors[type]} />
    </Box>
  )
}

