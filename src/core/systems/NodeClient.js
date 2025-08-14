import { num } from '../utils'
import { System } from './System'

const TICK_RATE = 1 / 30

/**
 * Node Client System
 *
 * - Runs on node
 * - Ticks!
 *
 */
export class NodeClient extends System {
  constructor(world) {
    super(world)
    this.timerId = null
  }

  start() {
    this.tick()
  }

  tick = () => {
    const time = performance.now()
    this.world.tick(time)
    this.timerId = setTimeout(this.tick, TICK_RATE * 1000)
  }

  destroy() {
    clearTimeout(this.timerId)
  }
}
