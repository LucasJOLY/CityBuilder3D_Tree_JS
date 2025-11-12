import * as THREE from 'three'
import { Raycaster, Vector2 } from 'three'

export interface PickResult {
  point: THREE.Vector3 | null
  cell: { x: number; y: number } | null
}

export class GridPicker {
  private raycaster: Raycaster
  private mouse: Vector2
  private plane: THREE.Plane
  private gridSize: number

  constructor(gridSize: number) {
    this.raycaster = new Raycaster()
    this.mouse = new Vector2()
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    this.gridSize = gridSize
  }

  updateMouse(event: MouseEvent, width: number, height: number): void {
    this.mouse.x = (event.clientX / width) * 2 - 1
    this.mouse.y = -(event.clientY / height) * 2 + 1
  }

  pick(
    camera: THREE.Camera,
    gridSize: number
  ): PickResult {
    this.raycaster.setFromCamera(this.mouse, camera)

    const intersectionPoint = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(this.plane, intersectionPoint)

    if (intersectionPoint) {
      const x = Math.floor(intersectionPoint.x + gridSize / 2)
      const y = Math.floor(intersectionPoint.z + gridSize / 2)

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        return {
          point: intersectionPoint,
          cell: { x, y },
        }
      }
    }

    return { point: null, cell: null }
  }

  setGridSize(size: number): void {
    this.gridSize = size
  }
}

