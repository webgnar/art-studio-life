import { App } from '../entities/App'
import { PlayerLocal } from '../entities/PlayerLocal'
import { PlayerRemote } from '../entities/PlayerRemote'
import { System } from './System'

const Types = {
  app: App,
  playerLocal: PlayerLocal,
  playerRemote: PlayerRemote,
}

/**
 * Entities System
 *
 * - Runs on both the server and client.
 * - Supports inserting entities into the world
 * - Executes entity scripts
 *
 */
export class Entities extends System {
  constructor(world) {
    super(world)
    this.items = new Map()
    this.players = new Map()
    this.player = null
    this.hot = new Set()
    this.removed = []
  }

  get(id) {
    return this.items.get(id)
  }

  getPlayer(entityId) {
    return this.players.get(entityId)
  }

  add(data, local) {
    let Entity
    if (data.type === 'player') {
      Entity = Types[data.owner === this.world.network.id ? 'playerLocal' : 'playerRemote']
    } else {
      Entity = Types[data.type]
    }
    const entity = new Entity(this.world, data, local)
    this.items.set(entity.data.id, entity)
    if (data.type === 'player') {
      this.players.set(entity.data.id, entity)
      // on the client remote players emit enter events here.
      // but on the server, enter events is delayed for players entering until after their snapshot is sent
      // that way they can actually respond correctly to follow-through events.
      // see ServerNetwork.js -> onConnection
      if (this.world.network.isClient && data.owner !== this.world.network.id) {
        this.world.events.emit('enter', { playerId: entity.data.id })
      }
    }
    if (data.owner === this.world.network.id) {
      this.player = entity
      this.world.emit('player', entity)
    }
    this.emit('added')
    return entity
  }

  remove(id) {
    const entity = this.items.get(id)
    if (!entity) return console.warn(`tried to remove entity that did not exist: ${id}`)
    if (entity.isPlayer) this.players.delete(entity.data.id)
    entity.destroy()
    this.items.delete(id)
    this.removed.push(id)
    this.emit('removed')
  }

  setHot(entity, hot) {
    if (hot) {
      this.hot.add(entity)
    } else {
      this.hot.delete(entity)
    }
  }

  fixedUpdate(delta) {
    for (const entity of this.hot) {
      entity.fixedUpdate(delta)
    }
  }

  update(delta) {
    for (const entity of this.hot) {
      entity.update(delta)
    }
  }

  lateUpdate(delta) {
    for (const entity of this.hot) {
      entity.lateUpdate(delta)
    }
  }

  serialize() {
    const data = []
    this.items.forEach(entity => {
      data.push(entity.serialize())
    })
    return data
  }

  deserialize(datas) {
    for (const data of datas) {
      this.add(data)
    }
  }

  destroy() {
    this.items.forEach(item => {
      this.remove(item.data.id)
    })
    this.items.clear()
    this.players.clear()
    this.hot.clear()
  }
}
