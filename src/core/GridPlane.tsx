import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useSnackbar } from 'notistack'
import { useWorldStore } from '@/stores/world-store'
import { useGameStore } from '@/stores/game-store'
import { useUIStore } from '@/stores/ui-store'
import { GridPicker } from './picker'
import { loadGameConfig, loadBuildingsConfig } from '@/utils/config-loader'

export function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const pickerRef = useRef<GridPicker | null>(null)
  const { camera, size, gl } = useThree()
  const { enqueueSnackbar } = useSnackbar()
  const grid = useWorldStore(state => state.grid)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)
  const selectedPlacedBuilding = useWorldStore(state => state.selectedPlacedBuilding)
  const isMovingBuilding = useWorldStore(state => state.isMovingBuilding)
  const placementRotation = useWorldStore(state => state.placementRotation)
  const setHoveredCell = useWorldStore(state => state.setHoveredCell)
  const placeBuilding = useWorldStore(state => state.placeBuilding)
  const moveBuilding = useWorldStore(state => state.moveBuilding)
  const setIsMovingBuilding = useWorldStore(state => state.setIsMovingBuilding)
  const setSelectedBuilding = useWorldStore(state => state.setSelectedBuilding)
  const setSelectedPlacedBuilding = useWorldStore(state => state.setSelectedPlacedBuilding)
  const money = useGameStore(state => state.money)
  const addMoney = useGameStore(state => state.addMoney)
  const setGameOver = useUIStore(state => state.setGameOver)

  useEffect(() => {
    loadGameConfig().then(config => {
      pickerRef.current = new GridPicker(config.gridSize)
    })
  }, [])

  // Gérer la touche Échap pour annuler placement/déplacement
  // Gérer la touche Espace pour désélectionner le bâtiment (surtout pour les routes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Annuler le placement
        if (selectedBuilding) {
          setSelectedBuilding(null)
          enqueueSnackbar('Placement annulé', {
            variant: 'info',
            autoHideDuration: 2000,
          })
        }
        // Annuler le déplacement
        if (isMovingBuilding) {
          setIsMovingBuilding(false)
          setSelectedPlacedBuilding(null)
          enqueueSnackbar('Déplacement annulé', {
            variant: 'info',
            autoHideDuration: 2000,
          })
        }
      }
      // Espace pour désélectionner le bâtiment (surtout pour les routes)
      if (e.key === ' ') {
        e.preventDefault()
        if (selectedBuilding) {
          setSelectedBuilding(null)
          enqueueSnackbar('Placement terminé', {
            variant: 'info',
            autoHideDuration: 2000,
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedBuilding,
    isMovingBuilding,
    setSelectedBuilding,
    setIsMovingBuilding,
    setSelectedPlacedBuilding,
    enqueueSnackbar,
  ])

  useEffect(() => {
    console.log('GridPlane useEffect triggered', {
      pickerReady: !!pickerRef.current,
      gridLength: grid.length,
      hasCanvas: !!gl.domElement,
      hasMesh: !!meshRef.current,
      selectedBuilding,
    })

    if (!gl.domElement) {
      console.log('No canvas element')
      return
    }

    if (grid.length === 0) {
      console.log('Grid not initialized, initializing now...')
      // Try to initialize grid if not already done
      const { initializeGrid } = useWorldStore.getState()
      initializeGrid().then(() => {
        console.log('Grid initialized, new length:', useWorldStore.getState().grid.length)
      })
      return
    }

    if (!meshRef.current) {
      console.log('Mesh ref not ready, will retry')
      // Retry after a short delay
      const timeout = setTimeout(() => {
        console.log('Retry: mesh ref now available?', !!meshRef.current)
      }, 100)
      return () => clearTimeout(timeout)
    }

    const canvas = gl.domElement
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    console.log('Setting up event listeners on canvas', canvas)

    const handleMouseMove = (event: MouseEvent) => {
      if (!meshRef.current) {
        console.log('handleMouseMove: mesh ref not available')
        return
      }

      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(meshRef.current)

      if (intersects.length > 0) {
        const point = intersects[0]?.point
        const gridSize = grid.length
        const x = Math.floor((point?.x ?? 0) + gridSize / 2)
        const y = Math.floor((point?.z ?? 0) + gridSize / 2)

        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          setHoveredCell({ x, y })
        } else {
          setHoveredCell(null)
        }
      } else {
        setHoveredCell(null)
      }
    }

    // handleClick désactivé - on utilise onPointerDown à la place qui est plus précis
    // const handleClick = async (event: MouseEvent) => { ... }

    // Use capture phase to catch events before MapControls
    // Note: handleClick désactivé car onPointerDown gère mieux les événements
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    // canvas.addEventListener('click', handleClick, { capture: true })

    console.log('Event listeners attached')

    return () => {
      console.log('Cleaning up event listeners')
      canvas.removeEventListener('mousemove', handleMouseMove)
      // canvas.removeEventListener('click', handleClick, { capture: true })
    }
  }, [
    gl,
    camera,
    size,
    grid,
    selectedBuilding,
    placementRotation,
    money,
    placeBuilding,
    addMoney,
    setHoveredCell,
  ])

  const gridSize = grid.length || 50

  const handlePointerMove = (e: any) => {
    e.stopPropagation()
    if (!selectedBuilding || grid.length === 0) return
    const point = e.point
    const gridSize = grid.length
    const x = Math.floor(point.x + gridSize / 2)
    const y = Math.floor(point.z + gridSize / 2)
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setHoveredCell({ x, y })
    }
  }

  const handlePointerDown = async (e: any) => {
    e.stopPropagation()

    if (grid.length === 0) {
      console.log('Grid not initialized, initializing...')
      const { initializeGrid } = useWorldStore.getState()
      await initializeGrid()
      console.log('Grid initialized, length:', useWorldStore.getState().grid.length)
    }

    const currentGrid = useWorldStore.getState().grid
    const gridSize = currentGrid.length

    console.log('=== onPointerDown triggered ===', {
      selectedBuilding,
      isMovingBuilding,
      selectedPlacedBuilding,
      point: e.point,
      hasSelectedBuilding: !!selectedBuilding,
      gridLength: gridSize,
    })

    // Gérer le déplacement de bâtiment
    if (isMovingBuilding && selectedPlacedBuilding) {
      const point = e.point
      const x = Math.floor(point.x + gridSize / 2)
      const y = Math.floor(point.z + gridSize / 2)

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        const moved = await moveBuilding(selectedPlacedBuilding.x, selectedPlacedBuilding.y, x, y)
        if (moved) {
          enqueueSnackbar('Bâtiment déplacé avec succès', {
            variant: 'success',
            autoHideDuration: 2000,
          })
          setIsMovingBuilding(false)
        } else {
          enqueueSnackbar('Impossible de déplacer le bâtiment à cet emplacement', {
            variant: 'error',
            autoHideDuration: 3000,
          })
        }
      }
      return
    }

    if (!selectedBuilding) {
      console.log('No building selected in onPointerDown')
      return
    }

    if (gridSize === 0) {
      console.log('Grid still not initialized')
      return
    }

    const point = e.point
    const x = Math.floor(point.x + gridSize / 2)
    const y = Math.floor(point.z + gridSize / 2)

    console.log('Pointer down at:', { x, y, point, gridSize })

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const buildings = await loadBuildingsConfig()
      const building = buildings[selectedBuilding]
      if (!building) {
        console.log('Building config not found:', selectedBuilding)
        return
      }

      if (money < building.cost) {
        console.log('Not enough money:', money, 'needed:', building.cost)
        return
      }

      // Vérifier d'abord si le placement est valide avant de placer
      const currentGrid = useWorldStore.getState().grid
      const buildingSize = building.size
      let hasConflict = false

      // Vérifier toutes les cellules que ce bâtiment occuperait
      for (let dy = 0; dy < buildingSize[1]; dy++) {
        for (let dx = 0; dx < buildingSize[0]; dx++) {
          const nx = x + dx
          const ny = y + dy

          // Vérifier les limites
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            hasConflict = true
            break
          }

          // Vérifier si la cellule est occupée (bâtiment ou objet décoratif)
          if (
            currentGrid[ny]?.[nx]?.buildingType !== null ||
            currentGrid[ny]?.[nx]?.decorativeObject !== null
          ) {
            hasConflict = true
            break
          }
        }
        if (hasConflict) break
      }

      if (hasConflict) {
        enqueueSnackbar("L'emplacement est occupé ou invalide", {
          variant: 'warning',
          autoHideDuration: 3000,
        })
        console.log('Placement failed - conflict detected')
        return
      }

      const placed = await placeBuilding(x, y, selectedBuilding, placementRotation)
      console.log('Placement result:', placed, 'at', { x, y })
      if (placed) {
        addMoney(-building.cost)

        // Vérifier si le joueur a perdu (dette de -1000€)
        const newMoney = useGameStore.getState().money
        if (newMoney <= -1000) {
          setGameOver(true)
        }

        console.log('Building placed successfully!')
        enqueueSnackbar('Le bâtiment a été placé avec succès', {
          variant: 'success',
          autoHideDuration: 2000,
        })
        // Ne pas désélectionner le bâtiment après placement si c'est une route
        // L'utilisateur peut continuer à placer des routes jusqu'à appuyer sur Espace
        const isRoad = selectedBuilding === 'road' || selectedBuilding === 'roadTurn'
        if (!isRoad) {
          // Désélectionner le bâtiment après placement réussi (sauf pour les routes)
          const { setSelectedBuilding } = useWorldStore.getState()
          setSelectedBuilding(null)
        }
      } else {
        console.log('Placement failed - unexpected error')
        enqueueSnackbar('Impossible de placer le bâtiment', {
          variant: 'error',
          autoHideDuration: 3000,
        })
      }
    } else {
      console.log('Cell out of bounds:', { x, y }, 'Grid size:', gridSize)
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={[0, -500, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <boxGeometry args={[gridSize, 1000, gridSize]} />
      <meshStandardMaterial color="#a8d5ba" flatShading={true} roughness={1} metalness={0} />
    </mesh>
  )
}
