import { isBoolean, isString } from 'lodash-es'
import { Node } from './Node'
import * as THREE from 'three'

const defaults = {
  src: null,
  emote: null,
  visible: true,
  onLoad: null,
}

export class Avatar extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'avatar'

    this.src = data.src
    this.emote = data.emote
    this.visible = data.visible
    this.onLoad = data.onLoad

    this.factory = data.factory
    this.hooks = data.hooks
    this.instance = null
    this.n = 0
  }

  async mount() {
    this.needsRebuild = false
    if (this._src) {
      const n = ++this.n
      let avatar = this.ctx.world.loader.get('avatar', this._src)
      if (!avatar) avatar = await this.ctx.world.loader.load('avatar', this._src)
      if (this.n !== n) return
      this.factory = avatar?.factory
      this.hooks = avatar?.hooks
    }
    if (this.factory) {
      this.instance = this.factory.create(this.matrixWorld, this.hooks, this)
      this.instance.setEmote(this._emote)
      this.instance.setVisible(this._visible)
      if (this._disableRateCheck) {
        this.instance.disableRateCheck()
        // this._disableRateCheck = null
      }
      this.ctx.world?.setHot(this.instance, true)
      this.ctx.world?.avatars.add(this.instance)
      this.onLoad?.()
    }
  }

  commit(didMove) {
    if (this.needsRebuild) {
      this.unmount()
      this.mount()
    }
    if (didMove) {
      this.instance?.move(this.matrixWorld)
    }
  }

  unmount() {
    this.n++
    if (this.instance) {
      this.ctx.world?.setHot(this.instance, false)
      this.ctx.world?.avatars.remove(this.instance)
      this.instance.destroy()
      this.instance = null
    }
  }

  applyStats(stats) {
    this.factory?.applyStats(stats)
  }

  get src() {
    return this._src
  }

  set src(value = defaults.src) {
    if (value !== null && !isString(value)) {
      throw new Error('[avatar] src not a string')
    }
    if (this._src === value) return
    this._src = value
    this.needsRebuild = true
    this.setDirty()
  }

  get emote() {
    return this._emote
  }

  set emote(value = defaults.emote) {
    if (value !== null && !isString(value)) {
      throw new Error('[avatar] emote not a string')
    }
    if (this._emote === value) return
    this._emote = value
    this.instance?.setEmote(value)
  }

  get visible() {
    return this._visible
  }

  set visible(value = defaults.visible) {
    if (!isBoolean(value)) {
      throw new Error('[avatar] visible not a boolean')
    }
    if (this._visible === value) return
    this._visible = value
    this.instance?.setVisible(value)
  }

  get onLoad() {
    return this._onLoad
  }

  set onLoad(value) {
    this._onLoad = value
  }

  getHeight() {
    return this.instance?.height || null
  }

  getHeadToHeight() {
    return this.instance?.headToHeight || null
  }

  getBoneTransform(boneName) {
    return this.instance?.getBoneTransform(boneName)
  }

  disableRateCheck() {
    if (this.instance) {
      this.instance.disableRateCheck()
    } else {
      this._disableRateCheck = true
    }
  }

  setLocomotion(mode, axis, gazeDir) {
    this.instance?.setLocomotion(mode, axis, gazeDir)
  }

  setEmote(url) {
    // DEPRECATED: use .emote
    this.emote = url
  }

  get height() {
    // DEPRECATED: use .getHeight()
    return this.getHeight()
  }

  copy(source, recursive) {
    super.copy(source, recursive)
    this._src = source._src
    this._emote = source._emote
    this._visible = source._visible
    this._onLoad = source._onLoad

    this.factory = source.factory
    this.hooks = source.hooks
    return this
  }

  getProxy() {
    if (!this.proxy) {
      const self = this
      let proxy = {
        get src() {
          return self.src
        },
        set src(value) {
          self.src = value
        },
        get emote() {
          return self.emote
        },
        set emote(value) {
          self.emote = value
        },
        get visible() {
          return self.visible
        },
        set visible(value) {
          self.visible = value
        },
        get onLoad() {
          return self.onLoad
        },
        set onLoad(value) {
          self.onLoad = value
        },
        getHeight() {
          return self.getHeight()
        },
        getHeadToHeight() {
          return self.getHeadToHeight()
        },
        getBoneTransform(boneName) {
          return self.getBoneTransform(boneName)
        },
        setLocomotion(mode, axis, gazeDir) {
          self.setLocomotion(mode, axis, gazeDir)
        },
        setEmote(url) {
          // DEPRECATED: use .emote
          return self.setEmote(url)
        },
        get height() {
          // DEPRECATED: use .getHeight()
          return self.height
        },
      }
      proxy = Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(super.getProxy())) // inherit Node properties
      this.proxy = proxy
    }
    return this.proxy
  }
}
