import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { GridPlane } from './GridPlane'
import { BuildingMesh } from './BuildingMesh'

export function Canvas3D() {
  const grid = useWorldStore((state) => state.grid)

  return (
    <Canvas
      camera={{ position: [25, 30, 25], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <MapControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.2}
        />
        <GridPlane />
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell.buildingType) {
              return (
                <BuildingMesh
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  type={cell.buildingType}
                  orientation={cell.orientation}
                />
              )
            }
            return null
          })
        )}
      </Suspense>
    </Canvas>
  )
}

