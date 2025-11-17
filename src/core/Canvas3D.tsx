import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Suspense, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useWorldStore } from '@/stores/world-store'
import { useUIStore } from '@/stores/ui-store'
import { GridPlane } from './GridPlane'
import { BuildingMesh } from './BuildingMesh'
import { DecorativeObjectMesh } from './DecorativeObjectMesh'
import { PreviewBuilding } from './PreviewBuilding'
import { Skybox } from './Skybox'
import { loadBuildingsConfig } from '@/utils/config-loader'
import type { BuildingConfig } from '@/types/domain'

export function Canvas3D() {
  const grid = useWorldStore(state => state.grid)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)
  const selectedPlacedBuilding = useWorldStore(state => state.selectedPlacedBuilding)
  const isMovingBuilding = useWorldStore(state => state.isMovingBuilding)
  const hoveredCell = useWorldStore(state => state.hoveredCell)
  const placementRotation = useWorldStore(state => state.placementRotation)
  const skyboxId = useUIStore(state => state.skyboxId)
  const gridSize = grid.length || 50
  const [buildingsConfig, setBuildingsConfig] = useState<Record<string, BuildingConfig> | null>(
    null
  )

  // Charger la config des bâtiments une fois
  useEffect(() => {
    loadBuildingsConfig().then(setBuildingsConfig)
  }, [])

  // Fonction helper pour vérifier si une cellule est le coin supérieur gauche d'un bâtiment
  const isTopLeftCorner = (
    x: number,
    y: number,
    buildingType: string,
    orientation: number,
    configs: Record<string, BuildingConfig>
  ): boolean => {
    // Vérifier la cellule à gauche
    if (x > 0) {
      const leftCell = grid[y]?.[x - 1]
      if (leftCell?.buildingType === buildingType && leftCell?.orientation === orientation) {
        // La cellule à gauche a le même type/orientation
        // Vérifier si elle EST le coin supérieur gauche d'un bâtiment qui inclurait (x, y)
        const leftConfig = configs[leftCell.buildingType]
        if (leftConfig) {
          const leftSize = leftConfig.size
          // Vérifier si (x-1, y) est le coin supérieur gauche (récursif)
          const leftIsTopLeft = isTopLeftCorner(x - 1, y, buildingType, orientation, configs)
          if (leftIsTopLeft) {
            // Si (x-1, y) est le coin supérieur gauche, vérifier si un bâtiment à partir de là inclurait (x, y)
            // Un bâtiment à (x-1, y) avec taille [width, height] occupe de (x-1, y) à (x-1+width-1, y+height-1)
            // (x, y) est dans cette zone si x <= x-1+width-1 ET y <= y+height-1
            if (x <= x - 1 + leftSize[0] - 1 && y <= y + leftSize[1] - 1) {
              return false // (x, y) fait partie d'un bâtiment qui commence à (x-1, y)
            }
          }
        }
      }
    }

    // Vérifier la cellule au-dessus
    if (y > 0) {
      const topCell = grid[y - 1]?.[x]
      if (topCell?.buildingType === buildingType && topCell?.orientation === orientation) {
        // La cellule au-dessus a le même type/orientation
        // Vérifier si elle EST le coin supérieur gauche d'un bâtiment qui inclurait (x, y)
        const topConfig = configs[topCell.buildingType]
        if (topConfig) {
          const topSize = topConfig.size
          // Vérifier si (x, y-1) est le coin supérieur gauche (récursif)
          const topIsTopLeft = isTopLeftCorner(x, y - 1, buildingType, orientation, configs)
          if (topIsTopLeft) {
            // Si (x, y-1) est le coin supérieur gauche, vérifier si un bâtiment à partir de là inclurait (x, y)
            // Un bâtiment à (x, y-1) avec taille [width, height] occupe de (x, y-1) à (x+width-1, y-1+height-1)
            // (x, y) est dans cette zone si x <= x+width-1 ET y <= y-1+height-1
            if (x <= x + topSize[0] - 1 && y <= y - 1 + topSize[1] - 1) {
              return false // (x, y) fait partie d'un bâtiment qui commence à (x, y-1)
            }
          }
        }
      }
    }

    return true // C'est le coin supérieur gauche
  }

  // Créer une liste des bâtiments à rendre (un seul par bâtiment)
  // Ne rendre que le coin supérieur gauche de chaque bâtiment pour éviter les doublons
  const buildingsToRender = useMemo(() => {
    if (!buildingsConfig) return []

    const buildings: Array<{ x: number; y: number; type: string; orientation: number }> = []
    const processed = new Set<string>()

    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.buildingType) {
          const config = buildingsConfig[cell.buildingType]
          if (!config) return

          const buildingSize = config.size

          // Vérifier si cette cellule est le coin supérieur gauche
          if (!isTopLeftCorner(x, y, cell.buildingType, cell.orientation, buildingsConfig)) {
            return // Pas le coin supérieur gauche, passer à la suivante
          }

          // Vérifier que toutes les cellules qu'un bâtiment occuperait depuis cette position
          // ont le même type et la même orientation
          let isValidBuilding = true
          const buildingCells: Array<{ x: number; y: number }> = []
          for (let dy = 0; dy < buildingSize[1] && isValidBuilding; dy++) {
            for (let dx = 0; dx < buildingSize[0]; dx++) {
              const nx = x + dx
              const ny = y + dy
              const checkCell = grid[ny]?.[nx]
              if (
                !checkCell ||
                checkCell.buildingType !== cell.buildingType ||
                checkCell.orientation !== cell.orientation
              ) {
                isValidBuilding = false
                break
              }
              buildingCells.push({ x: nx, y: ny })
            }
          }

          if (!isValidBuilding) return // Bâtiment invalide ou incomplet

          // Vérifier si aucune des cellules de ce bâtiment n'a déjà été traitée
          const alreadyProcessed = buildingCells.some(c => processed.has(`${c.x}-${c.y}`))

          if (!alreadyProcessed) {
            buildings.push({
              x,
              y,
              type: cell.buildingType,
              orientation: cell.orientation,
            })
            // Marquer toutes les cellules occupées comme traitées
            buildingCells.forEach(c => {
              processed.add(`${c.x}-${c.y}`)
            })
          }
        }
      })
    })

    return buildings
  }, [grid, buildingsConfig])

  return (
    <Canvas camera={{ position: [25, 30, 25], fov: 75 }} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <Skybox skyboxId={skyboxId} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <MapControls
          enablePan={!selectedBuilding && !isMovingBuilding}
          enableZoom={true}
          enableRotate={!selectedBuilding && !isMovingBuilding}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.2}
          mouseButtons={{
            LEFT: selectedBuilding || isMovingBuilding ? undefined : THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
        <GridPlane />
        {buildingsToRender.map(building => (
          <BuildingMesh
            key={`building-${building.x}-${building.y}`}
            x={building.x}
            y={building.y}
            type={building.type as any}
            orientation={building.orientation as 0 | 1 | 2 | 3}
          />
        ))}
        {/* Rendre les objets décoratifs */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell.decorativeObject) {
              return (
                <DecorativeObjectMesh
                  key={`decorative-${x}-${y}`}
                  x={x}
                  y={y}
                  type={cell.decorativeObject}
                />
              )
            }
            return null
          })
        )}
        {/* Prévisualisation du bâtiment à placer */}
        {selectedBuilding && hoveredCell && grid.length > 0 && (
          <PreviewBuilding
            x={hoveredCell.x}
            y={hoveredCell.y}
            type={selectedBuilding}
            orientation={placementRotation}
            gridSize={gridSize}
          />
        )}
        {/* Prévisualisation du bâtiment en déplacement */}
        {isMovingBuilding && selectedPlacedBuilding && hoveredCell && grid.length > 0 && (
          <PreviewBuilding
            x={hoveredCell.x}
            y={hoveredCell.y}
            type={
              grid[selectedPlacedBuilding.y]?.[selectedPlacedBuilding.x]?.buildingType || 'house'
            }
            orientation={
              grid[selectedPlacedBuilding.y]?.[selectedPlacedBuilding.x]?.orientation || 0
            }
            gridSize={gridSize}
            isMoving={true}
            sourcePosition={selectedPlacedBuilding}
          />
        )}
      </Suspense>
    </Canvas>
  )
}
