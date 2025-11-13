import { useMemo, useEffect, useState } from 'react'
import { Box } from '@react-three/drei'
import type { BuildingType, TileOrientation } from '@/types/domain'
import { loadBuildingsConfig } from '@/utils/config-loader'
import { useWorldStore } from '@/stores/world-store'

interface PreviewBuildingProps {
  x: number
  y: number
  type: BuildingType
  orientation: TileOrientation
  gridSize: number
  isMoving?: boolean
  sourcePosition?: { x: number; y: number }
}

export function PreviewBuilding({ 
  x, 
  y, 
  type, 
  orientation, 
  gridSize, 
  isMoving = false,
  sourcePosition 
}: PreviewBuildingProps) {
  const [size, setSize] = useState<[number, number]>([1, 1])
  const [sizeLoaded, setSizeLoaded] = useState(false)
  const [sourceSize, setSourceSize] = useState<[number, number] | null>(null)
  const grid = useWorldStore((state) => state.grid)

  useEffect(() => {
    loadBuildingsConfig().then((configs) => {
      const config = configs[type]
      if (config) {
        setSize(config.size)
        setSizeLoaded(true)
      }
      
      // Charger aussi la taille du bâtiment source si en mode déplacement
      if (isMoving && sourcePosition) {
        const sourceCell = grid[sourcePosition.y]?.[sourcePosition.x]
        if (sourceCell?.buildingType) {
          const sourceConfig = configs[sourceCell.buildingType]
          if (sourceConfig) {
            setSourceSize(sourceConfig.size)
          }
        }
      }
    })
  }, [type, isMoving, sourcePosition, grid])

  // Vérifier si le placement est valide (pas de conflit)
  const isValid = useMemo(() => {
    if (!sizeLoaded) return false // Retourner false si la taille n'est pas encore chargée
    
    // Calculer toutes les cellules occupées par ce bâtiment
    const occupiedCells: { x: number; y: number }[] = []
    for (let dy = 0; dy < size[1]; dy++) {
      for (let dx = 0; dx < size[0]; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          occupiedCells.push({ x: nx, y: ny })
        } else {
          // Si une cellule est hors limites, le placement n'est pas valide
          return false
        }
      }
    }

    // Vérifier qu'aucune cellule n'est occupée
    // Si on est en mode déplacement, ignorer les cellules du bâtiment source
    for (const cell of occupiedCells) {
      const cellBuilding = grid[cell.y]?.[cell.x]?.buildingType
      if (cellBuilding !== null) {
        // Si on déplace un bâtiment, ignorer les cellules du bâtiment source
        if (isMoving && sourcePosition && sourceSize) {
          // Vérifier si cette cellule fait partie du bâtiment source
          const isSourceCell =
            cell.x >= sourcePosition.x &&
            cell.x < sourcePosition.x + sourceSize[0] &&
            cell.y >= sourcePosition.y &&
            cell.y < sourcePosition.y + sourceSize[1]
          if (isSourceCell) {
            continue // Ignorer les cellules du bâtiment source
          }
        }
        return false
      }
    }

    return true
  }, [x, y, size, gridSize, grid, sizeLoaded, isMoving, sourcePosition, sourceSize])

  // Utiliser exactement la même logique que BuildingMesh pour garantir la même taille et position
  // BuildingMesh utilise gridSize = 50 codé en dur, donc on fait pareil ici
  const position = useMemo(() => {
    const gridSizeForPosition = 50 // Même valeur que BuildingMesh
    const offsetX = x - gridSizeForPosition / 2 + size[0] / 2
    const height = type === 'road' ? 0.05 : Math.max(size[0], size[1]) * 0.25
    const offsetZ = y - gridSizeForPosition / 2 + size[1] / 2
    return [offsetX, height, offsetZ] as [number, number, number]
  }, [x, y, size, type])

  // Ne pas rendre si la taille n'est pas encore chargée pour éviter d'afficher une taille incorrecte
  if (!sizeLoaded) {
    return null
  }

  // Utiliser exactement la même géométrie que createBuildingShape avec Box de drei
  const rotation = (orientation * Math.PI) / 2
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
  const baseColor = buildingColors[type]
  const previewColor = isValid ? baseColor : '#ff0000' // Rouge si conflit

  // Calculer la hauteur exactement comme dans createBuildingShape
  const buildingHeight = type === 'road' ? 0.1 : Math.max(size[0], size[1]) * 0.5

  return (
    <group>
      {/* Utiliser Box de drei exactement comme dans createBuildingShape */}
      <Box
        args={[size[0], buildingHeight, size[1]]}
        position={position}
        rotation={[0, rotation, 0]}
      >
        <meshStandardMaterial color={previewColor} transparent opacity={0.5} />
      </Box>
      {/* Indicateur de validité au sol */}
      <mesh
        position={[position[0], 0.02, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          color={isValid ? '#00ff00' : '#ff0000'}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}

