import { useState, useEffect, useMemo, Suspense, Component, ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box, Edges } from '@react-three/drei'
import { useWorldStore } from '@/stores/world-store'
import { loadDecorativeObjectsConfig } from '@/utils/config-loader'
import type { DecorativeObjectType } from '@/types/domain'
import { markModelAsFailed, isModelFailed } from './model-loader'
import * as THREE from 'three'

interface DecorativeObjectMeshProps {
  x: number
  y: number
  type: DecorativeObjectType
}

export function DecorativeObjectMesh({ x, y, type }: DecorativeObjectMeshProps) {
  const [size, setSize] = useState<[number, number]>([1, 1])
  const [modelPath, setModelPath] = useState<string | null>(null)
  const selectedPlacedBuilding = useWorldStore(state => state.selectedPlacedBuilding)
  const setSelectedPlacedBuilding = useWorldStore(state => state.setSelectedPlacedBuilding)
  const selectedBuilding = useWorldStore(state => state.selectedBuilding)
  const isMovingBuilding = useWorldStore(state => state.isMovingBuilding)

  useEffect(() => {
    loadDecorativeObjectsConfig().then(configs => {
      const config = configs.find(obj => obj.id === type)
      if (config) {
        setSize(config.size)
        setModelPath(config.modelPath)
      }
    })
  }, [type])

  const position = useMemo(() => {
    const gridSize = 50
    const offsetX = x - gridSize / 2 + size[0] / 2
    const offsetZ = y - gridSize / 2 + size[1] / 2
    return [offsetX, 0, offsetZ] as [number, number, number]
  }, [x, y, size])

  const isSelected = useMemo(() => {
    return selectedPlacedBuilding?.x === x && selectedPlacedBuilding?.y === y
  }, [selectedPlacedBuilding, x, y])

  const handleClick = (e: any) => {
    e.stopPropagation()
    // Ne pas sélectionner si on est en train de placer un bâtiment
    if (selectedBuilding || isMovingBuilding) return
    setSelectedPlacedBuilding({ x, y })
  }

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    // Empêcher GridPlane de traiter le clic si on clique sur un objet décoratif
    if (!selectedBuilding && !isMovingBuilding) {
      handleClick(e)
    }
  }

  // Fallback : utiliser un cube coloré
  const fallbackColor = type === 'tree' ? '#228B22' : '#696969'
  const useFallback = !modelPath || isModelFailed(modelPath)

  // Composant pour charger le modèle GLB (doit toujours appeler useGLTF de manière inconditionnelle)
  const GLTFModel = ({ modelPath: path }: { modelPath: string }) => {
    // Ne pas charger si le modèle a déjà échoué
    if (isModelFailed(path)) {
      return null
    }

    // useGLTF doit être appelé de manière inconditionnelle (règle des hooks React)
    const { scene } = useGLTF(path)

    // Calculer le bounding box pour positionner correctement le modèle
    const boundingBox = useMemo(() => {
      const box = new THREE.Box3()
      const clonedScene = scene.clone()
      box.setFromObject(clonedScene)
      return box
    }, [scene])

    // Calculer le scale pour adapter le modèle à la taille de la grille
    const modelSize = useMemo(() => {
      const sizeX = boundingBox.max.x - boundingBox.min.x
      const sizeZ = boundingBox.max.z - boundingBox.min.z
      return { x: sizeX || 1, z: sizeZ || 1 }
    }, [boundingBox])

    const scaleX = size[0] / modelSize.x
    const scaleZ = size[1] / modelSize.z
    const scaleY = Math.min(scaleX, scaleZ)

    // Positionner la base du modèle à y=0
    const baseHeight = boundingBox.min.y < 0 ? -boundingBox.min.y * scaleY : 0

    const clonedScene = scene.clone()

    return (
      <primitive
        object={clonedScene}
        scale={[scaleX, scaleY, scaleZ]}
        position={[0, baseHeight, 0]}
      />
    )
  }

  // ErrorBoundary pour capturer les erreurs de chargement
  class ModelErrorBoundary extends Component<
    { children: ReactNode; fallback: ReactNode; modelPath?: string; onError?: () => void },
    { hasError: boolean }
  > {
    constructor(props: {
      children: ReactNode
      fallback: ReactNode
      modelPath?: string
      onError?: () => void
    }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return { hasError: true }
    }

    componentDidCatch(error: Error) {
      console.warn('Modèle GLB non disponible, utilisation du fallback:', error.message)
      if (this.props.modelPath) {
        markModelAsFailed(this.props.modelPath)
      }
      this.props.onError?.()
    }

    render() {
      if (this.state.hasError) {
        return <>{this.props.fallback}</>
      }
      return <>{this.props.children}</>
    }
  }

  // Composant wrapper avec gestion d'erreur
  const GLTFModelWrapper = ({
    modelPath: path,
    fallback,
  }: {
    modelPath: string
    fallback: ReactNode
  }) => {
    return (
      <ModelErrorBoundary
        fallback={fallback}
        modelPath={path}
        onError={() => {
          if (path) {
            markModelAsFailed(path)
          }
        }}
      >
        <Suspense fallback={fallback}>
          <GLTFModel modelPath={path} />
        </Suspense>
      </ModelErrorBoundary>
    )
  }

  const FallbackCube = () => (
    <Box args={[size[0], size[0] * 0.5, size[1]]}>
      <meshStandardMaterial color={fallbackColor} />
      {isSelected && <Edges scale={1.1} threshold={15} color="#ff8800" />}
    </Box>
  )

  return (
    <group
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      position={position}
      onPointerOver={e => {
        if (!selectedBuilding && !isMovingBuilding) {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {useFallback || !modelPath ? (
        <FallbackCube />
      ) : (
        <group scale={[size[0], size[0], size[1]]}>
          <GLTFModelWrapper modelPath={modelPath} fallback={<FallbackCube />} />
          {isSelected && (
            <Edges scale={1.1} threshold={15} color="#ff8800">
              <Box args={[size[0], size[0] * 0.5, size[1]]} />
            </Edges>
          )}
        </group>
      )}
    </group>
  )
}
