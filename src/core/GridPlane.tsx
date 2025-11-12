import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { GridPicker } from './picker'
import { loadGameConfig, loadBuildingsConfig } from '@/utils/config-loader'

export function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const pickerRef = useRef<GridPicker | null>(null)
  const { camera, size, gl } = useThree()
  const grid = useWorldStore((state) => state.grid)
  const selectedBuilding = useWorldStore((state) => state.selectedBuilding)
  const placementRotation = useWorldStore((state) => state.placementRotation)
  const setHoveredCell = useWorldStore((state) => state.setHoveredCell)
  const placeBuilding = useWorldStore((state) => state.placeBuilding)
  const money = useGameStore((state) => state.money)
  const addMoney = useGameStore((state) => state.addMoney)

  useEffect(() => {
    loadGameConfig().then((config) => {
      pickerRef.current = new GridPicker(config.gridSize)
    })
  }, [])

  useEffect(() => {
    if (!pickerRef.current || grid.length === 0) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!pickerRef.current) return
      pickerRef.current.updateMouse(event, size.width, size.height)
      const result = pickerRef.current.pick(camera, grid.length)
      setHoveredCell(result.cell)
    }

    const handleClick = async (event: MouseEvent) => {
      if (!pickerRef.current || !selectedBuilding) return

      pickerRef.current.updateMouse(event, size.width, size.height)
      const result = pickerRef.current.pick(camera, grid.length)

      if (result.cell) {
        const buildings = await loadBuildingsConfig()
        const building = buildings[selectedBuilding]
        if (!building) return

        if (money >= building.cost) {
          const placed = placeBuilding(
            result.cell.x,
            result.cell.y,
            selectedBuilding,
            placementRotation
          )
          if (placed) {
            addMoney(-building.cost)
          }
        }
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gl, camera, size, grid, selectedBuilding, placementRotation, money, placeBuilding, addMoney, setHoveredCell])

  const gridSize = grid.length || 50

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[gridSize, gridSize]} />
      <meshStandardMaterial color="#2a2a2a" transparent opacity={0.3} />
    </mesh>
  )
}

