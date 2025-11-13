import { useMemo, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { BuildingType, TileOrientation } from '@/types/domain'
import { loadBuildingsConfig } from '@/utils/config-loader'
import { createBuildingShape } from './building-factory'
import { useWorldStore } from '@/stores/world-store'

interface BuildingMeshProps {
  x: number
  y: number
  type: BuildingType
  orientation: TileOrientation
}

export function BuildingMesh({ x, y, type, orientation }: BuildingMeshProps) {
  const [size, setSize] = useState<[number, number]>([1, 1])
  const selectedPlacedBuilding = useWorldStore(state => state.selectedPlacedBuilding)
  const setSelectedPlacedBuilding = useWorldStore(state => state.setSelectedPlacedBuilding)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)
  const isMovingBuilding = useWorldStore(state => state.isMovingBuilding)

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
    const height = type === 'road' ? 0.05 : Math.max(size[0], size[1]) * 0.25
    const offsetZ = y - gridSize / 2 + size[1] / 2
    return [offsetX, height, offsetZ] as [number, number, number]
  }, [x, y, size, type])

  const isSelected = useMemo(() => {
    return (
      selectedPlacedBuilding?.x === x &&
      selectedPlacedBuilding?.y === y
    )
  }, [selectedPlacedBuilding, x, y])

  const handleClick = (e: any) => {
    e.stopPropagation()
    // Ne pas sélectionner si on est en train de placer un bâtiment
    if (selectedBuilding || isMovingBuilding) return
    setSelectedPlacedBuilding({ x, y })
  }

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    // Empêcher GridPlane de traiter le clic si on clique sur un bâtiment
    if (!selectedBuilding && !isMovingBuilding) {
      handleClick(e)
    }
  }

  return (
    <group 
      onClick={handleClick} 
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        if (!selectedBuilding && !isMovingBuilding) {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }
      }} 
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {createBuildingShape({
        type,
        size,
        orientation,
        position,
        key: `${x}-${y}`,
        isSelected,
      })}
    </group>
  )
}

