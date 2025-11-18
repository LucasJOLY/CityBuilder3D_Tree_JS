import { Box, Edges, useGLTF } from '@react-three/drei'
import { Suspense, Component, type ReactNode, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import type { BuildingType, TileOrientation } from '@/types/domain'
import { buildingModelPaths, hasModel, markModelAsFailed, isModelFailed } from './model-loader'

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
  roadTurn: '#555555',
  house: '#8B4513',
  apartment: '#654321',
  hospital: '#FFFFFF',
  school: '#FFD700',
  police: '#0000FF',
  fire: '#FF0000',
  park: '#00FF00',
  parkLarge: '#00AA00',
  monument: '#FFD700',
  skycraper: '#708090',
  prison: '#2F2F2F',
  church: '#F5F5DC',
  bar: '#8B4513',
}

/**
 * Composant pour charger et afficher un modèle .glb avec gestion d'erreur
 */
function GLTFModel({
  modelPath,
  position,
  rotation,
  size,
  isSelected,
}: {
  modelPath: string
  position: [number, number, number]
  rotation: number
  size: [number, number]
  isSelected: boolean
}) {
  // Ne pas charger si le modèle a déjà échoué
  if (isModelFailed(modelPath)) {
    return null
  }

  // useGLTF doit être appelé de manière inconditionnelle (règle des hooks React)
  // L'erreur sera gérée par l'ErrorBoundary et les intercepteurs globaux
  const { scene } = useGLTF(modelPath)

  // Calculer le bounding box du modèle pour déterminer sa taille réelle
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
    return { x: sizeX || 1, z: sizeZ || 1 } // Par défaut 1x1 si le bounding box est invalide
  }, [boundingBox])

  // Calculer le scale pour que le modèle s'adapte exactement à la taille demandée
  const scaleX = size[0] / modelSize.x
  const scaleZ = size[1] / modelSize.z
  // Utiliser le même scale pour Y pour préserver les proportions du modèle
  const scaleY = Math.min(scaleX, scaleZ)

  // Calculer la hauteur pour positionner le modèle correctement
  // Le modèle doit être posé sur le sol (y=0 dans le système de coordonnées du groupe)
  // Le groupe est déjà positionné à une hauteur dans BuildingMesh, donc on met le modèle à y=0
  const isRoad = modelPath.includes('road')

  // Pour les routes, utiliser une hauteur minimale
  // Pour les autres bâtiments, positionner la base du modèle exactement à y=0
  // Si boundingBox.min.y est négatif, cela signifie que le modèle s'étend en dessous de l'origine
  // On doit donc le remonter pour que sa base soit à y=0
  let baseHeight = 0
  if (isRoad) {
    baseHeight = 0.05
  } else {
    // Positionner la base du modèle à y=0 en compensant le min.y
    // Si min.y = -1 et scaleY = 0.5, alors baseHeight = -(-1) * 0.5 = 0.5
    // Cela remonte le modèle pour que sa base soit à y=0
    baseHeight = boundingBox.min.y < 0 ? -boundingBox.min.y * scaleY : 0
  }

  // Cloner la scène pour éviter les problèmes de référence
  const clonedScene = scene.clone()

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive
        object={clonedScene}
        scale={[scaleX, scaleY, scaleZ]}
        position={[0, baseHeight, 0]}
      />
      {isSelected && (
        <Edges scale={1.1} threshold={15} color="#ff8800">
          <Box args={[size[0], (boundingBox.max.y - boundingBox.min.y) * scaleY, size[1]]} />
        </Edges>
      )}
    </group>
  )
}

/**
 * ErrorBoundary React classique pour capturer les erreurs de chargement
 */
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode; onError?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Ignorer silencieusement les erreurs de chargement de modèles
    console.warn('Modèle GLB non disponible, utilisation du fallback:', error.message)
    this.props.onError?.()
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>
    }

    return <>{this.props.children}</>
  }
}

/**
 * Composant wrapper avec gestion d'erreur pour gérer les erreurs de chargement
 */
function GLTFModelWrapper({
  modelPath,
  position,
  rotation,
  size,
  isSelected,
  fallback,
}: {
  modelPath: string
  position: [number, number, number]
  rotation: number
  size: [number, number]
  isSelected: boolean
  fallback: React.ReactNode
}) {
  const [useFallback, setUseFallback] = useState(isModelFailed(modelPath))

  // Intercepter les erreurs de chargement au niveau global AVANT qu'elles ne soient lancées
  useEffect(() => {
    // Vérifier si le modèle a déjà échoué
    if (isModelFailed(modelPath)) {
      setUseFallback(true)
      return
    }

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || ''
      const errorFilename = event.filename || ''

      if (
        errorMessage.includes(modelPath) ||
        errorFilename.includes(modelPath) ||
        errorMessage.includes('.glb') ||
        errorMessage.includes('Unexpected token')
      ) {
        markModelAsFailed(modelPath)
        setUseFallback(true)
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || ''
      if (
        reason.includes(modelPath) ||
        reason.includes('.glb') ||
        reason.includes('Unexpected token')
      ) {
        markModelAsFailed(modelPath)
        setUseFallback(true)
        event.preventDefault()
      }
    }

    // Utiliser capture phase pour intercepter avant que l'erreur ne remonte
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [modelPath])

  if (useFallback) {
    return <>{fallback}</>
  }

  return (
    <ModelErrorBoundary
      fallback={fallback}
      onError={() => {
        markModelAsFailed(modelPath)
        setUseFallback(true)
      }}
    >
      <GLTFModel
        modelPath={modelPath}
        position={position}
        rotation={rotation}
        size={size}
        isSelected={isSelected}
      />
    </ModelErrorBoundary>
  )
}

/**
 * Fonction centralisée pour créer les formes 3D des bâtiments.
 * Utilise des modèles .glb si disponibles, sinon utilise des cubes par défaut.
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

  // Créer le fallback (cube) une fois
  const createFallback = () => {
    if (type === 'road' || type === 'roadTurn') {
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

  // Si un modèle .glb existe pour ce type de bâtiment, essayer de l'utiliser
  // MAIS seulement si le modèle n'a pas déjà échoué
  if (hasModel(type)) {
    const modelPath = buildingModelPaths[type]!

    // Si le modèle a déjà échoué, utiliser directement le fallback
    if (isModelFailed(modelPath)) {
      return createFallback()
    }

    const fallback = createFallback()

    return (
      <Suspense key={key || `${position[0]}-${position[2]}`} fallback={fallback}>
        <GLTFModelWrapper
          modelPath={modelPath}
          position={position}
          rotation={rotation}
          size={size}
          isSelected={isSelected}
          fallback={fallback}
        />
      </Suspense>
    )
  }

  // Fallback: utiliser des cubes pour les routes et autres bâtiments sans modèle
  if (type === 'road' || type === 'roadTurn') {
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
