import * as THREE from 'three'

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(25, 30, 25)
  camera.lookAt(0, 0, 0)
  return camera
}

export function updateCameraAspect(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): void {
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

