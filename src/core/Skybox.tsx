import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface SkyboxOption {
  id: string
  name: string
  urls: string[] // 6 URLs pour les 6 faces d'un cube
}

export const skyboxOptions: SkyboxOption[] = [
  {
    id: 'default',
    name: 'Par défaut (Gris)',
    urls: [
      '#808080', // right
      '#808080', // left
      '#808080', // top
      '#808080', // bottom
      '#808080', // front
      '#808080', // back
    ],
  },
  {
    id: 'blue',
    name: 'Bleu ciel',
    urls: [
      '#87CEEB', // right
      '#87CEEB', // left
      '#87CEEB', // top
      '#87CEEB', // bottom
      '#87CEEB', // front
      '#87CEEB', // back
    ],
  },
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    urls: [
      '#FF6B6B', // right
      '#FF6B6B', // left
      '#FFB347', // top
      '#2C3E50', // bottom
      '#FF8C42', // front
      '#FF6B6B', // back
    ],
  },
  {
    id: 'night',
    name: 'Nuit',
    urls: [
      '#1a1a2e', // right
      '#1a1a2e', // left
      '#0f0f1e', // top
      '#16213e', // bottom
      '#1a1a2e', // front
      '#1a1a2e', // back
    ],
  },
  {
    id: 'green',
    name: 'Vert nature',
    urls: [
      '#90EE90', // right
      '#90EE90', // left
      '#98FB98', // top
      '#228B22', // bottom
      '#90EE90', // front
      '#90EE90', // back
    ],
  },
]

interface SkyboxProps {
  skyboxId: string
}

export function Skybox({ skyboxId }: SkyboxProps) {
  const { scene } = useThree()
  const skyboxRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    const option = skyboxOptions.find(opt => opt.id === skyboxId) || skyboxOptions[0]

    // Créer un matériau de couleur pour chaque face
    const materials = option.urls.map(color => {
      const material = new THREE.MeshBasicMaterial({
        color: color.startsWith('#') ? color : '#808080',
        side: THREE.BackSide,
      })
      return material
    })

    // Créer la géométrie du cube
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000)

    // Nettoyer l'ancien skybox s'il existe
    if (skyboxRef.current) {
      scene.remove(skyboxRef.current)
      skyboxRef.current.geometry.dispose()
      if (Array.isArray(skyboxRef.current.material)) {
        skyboxRef.current.material.forEach((mat: THREE.Material) => mat.dispose())
      } else {
        skyboxRef.current.material.dispose()
      }
    }

    // Créer le mesh du skybox
    const skybox = new THREE.Mesh(geometry, materials)
    skyboxRef.current = skybox
    scene.add(skybox)

    return () => {
      if (skyboxRef.current) {
        scene.remove(skyboxRef.current)
        skyboxRef.current.geometry.dispose()
        if (Array.isArray(skyboxRef.current.material)) {
          skyboxRef.current.material.forEach((mat: THREE.Material) => mat.dispose())
        } else {
          skyboxRef.current.material.dispose()
        }
        skyboxRef.current = null
      }
    }
  }, [skyboxId, scene])

  return null
}

