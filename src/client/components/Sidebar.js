import { css } from '@firebolt-dev/css'
import { MenuIcon, MicIcon, MicOffIcon, SettingsIcon, VRIcon } from './Icons'
import {
  BookTextIcon,
  BoxIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CirclePlusIcon,
  CodeIcon,
  DownloadIcon,
  EarthIcon,
  UsersIcon,
  InfoIcon,
  LayersIcon,
  ListTreeIcon,
  LoaderPinwheelIcon,
  MessageSquareTextIcon,
  Move3DIcon,
  OctagonXIcon,
  PinIcon,
  RocketIcon,
  SaveIcon,
  SearchIcon,
  SparkleIcon,
  SquareCheckBigIcon,
  SquareIcon,
  SquareMenuIcon,
  TagIcon,
  Trash2Icon,
  UserXIcon,
  ShieldBanIcon,
  Volume2Icon,
  HammerIcon,
  CircleArrowRightIcon,
} from 'lucide-react'
import { cls } from './cls'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  FieldBtn,
  FieldCurve,
  FieldFile,
  FieldNumber,
  FieldRange,
  FieldSwitch,
  FieldText,
  FieldTextarea,
  FieldToggle,
  FieldVec3,
} from './Fields'
import { HintContext, HintProvider } from './Hint'
import { useFullscreen } from './useFullscreen'
import { downloadFile } from '../../core/extras/downloadFile'
import { exportApp } from '../../core/extras/appTools'
import { hashFile } from '../../core/utils-client'
import { cloneDeep, isArray, isBoolean, sortBy } from 'lodash-es'
import { storage } from '../../core/storage'
import { ScriptEditor } from './ScriptEditor'
import { NodeHierarchy } from './NodeHierarchy'
import { AppsList } from './AppsList'
import { DEG2RAD, RAD2DEG } from '../../core/extras/general'
import * as THREE from '../../core/extras/three'
import { isTouch } from '../utils'
import { uuid } from '../../core/utils'
import { useRank } from './useRank'
import { Ranks } from '../../core/extras/ranks'

const mainSectionPanes = ['prefs']
const worldSectionPanes = ['world', 'docs', 'apps', 'add']
const appSectionPanes = ['app', 'script', 'nodes', 'meta']

const e1 = new THREE.Euler(0, 0, 0, 'YXZ')
const q1 = new THREE.Quaternion()

/**
 * frosted
 * 
background: rgba(11, 10, 21, 0.85); 
border: 0.0625rem solid #2a2b39;
backdrop-filter: blur(5px);
 *
 */

export function Sidebar({ world, ui }) {
  const player = world.entities.player
  const { isAdmin, isBuilder } = useRank(world, player)
  const [livekit, setLiveKit] = useState(() => world.livekit.status)
  useEffect(() => {
    const onLiveKitStatus = status => {
      setLiveKit({ ...status })
    }
    world.livekit.on('status', onLiveKitStatus)
    return () => {
      world.livekit.off('status', onLiveKitStatus)
    }
  }, [])
  const activePane = ui.active ? ui.pane : null
  return (
    <HintProvider>
      <div
        className='sidebar'
        css={css`
          position: absolute;
          font-size: 1rem;
          top: calc(2rem + env(safe-area-inset-top));
          right: calc(2rem + env(safe-area-inset-right));
          bottom: calc(2rem + env(safe-area-inset-bottom));
          left: calc(2rem + env(safe-area-inset-left));
          display: flex;
          gap: 0.625rem;
          z-index: 1; // above chat etc
          @media all and (max-width: 1200px) {
            top: calc(1rem + env(safe-area-inset-top));
            right: calc(1rem + env(safe-area-inset-right));
            bottom: calc(1rem + env(safe-area-inset-bottom));
            left: calc(1rem + env(safe-area-inset-left));
          }
          .sidebar-sections {
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            gap: 0.625rem;
          }
        `}
      >
        <div className='sidebar-sections'>
          <Section active={activePane} bottom>
            <Btn
              active={activePane === 'prefs'}
              suspended={ui.pane === 'prefs' && !activePane}
              onClick={() => world.ui.togglePane('prefs')}
            >
              <MenuIcon size='1.25rem' />
            </Btn>
            <Btn
              active={activePane === 'players'}
              suspended={ui.pane === 'players' && !activePane}
              onClick={() => world.ui.togglePane('players')}
            >
              <UsersIcon size='1.25rem' />
            </Btn>
            {isTouch && (
              <Btn
                onClick={() => {
                  world.emit('sidebar-chat-toggle')
                }}
              >
                <MessageSquareTextIcon size='1.25rem' />
              </Btn>
            )}
            {livekit.available && !livekit.connected && (
              <Btn disabled>
                <MicOffIcon size='1.25rem' />
              </Btn>
            )}
            {livekit.available && livekit.connected && (
              <Btn
                muted={livekit.mic && (livekit.level === 'disabled' || livekit.muted)}
                onClick={() => {
                  world.livekit.setMicrophoneEnabled()
                }}
              >
                {livekit.mic && livekit.level !== 'disabled' && !livekit.muted ? (
                  <MicIcon size='1.25rem' />
                ) : (
                  <MicOffIcon size='1.25rem' />
                )}
              </Btn>
            )}
            {world.xr.supportsVR && (
              <Btn
                onClick={() => {
                  world.xr.enter()
                }}
              >
                <VRIcon size='1.25rem' />
              </Btn>
            )}
          </Section>
          {isBuilder && (
            <Section active={activePane} top bottom>
              <Btn
                active={activePane === 'world'}
                suspended={ui.pane === 'world' && !activePane}
                onClick={() => world.ui.togglePane('world')}
              >
                <EarthIcon size='1.25rem' />
              </Btn>
              {/* <Btn
              active={activePane === 'docs'}
              suspended={ui.pane === 'docs' && !activePane}
              onClick={() => world.ui.togglePane('docs')}
            >
              <BookTextIcon size='1.25rem' />
            </Btn> */}
              <Btn
                active={activePane === 'apps'}
                suspended={ui.pane === 'apps' && !activePane}
                onClick={() => world.ui.togglePane('apps')}
              >
                <LayersIcon size='1.25rem' />
              </Btn>
              <Btn
                active={activePane === 'add'}
                suspended={ui.pane === 'add' && !activePane}
                onClick={() => world.ui.togglePane('add')}
              >
                <CirclePlusIcon size='1.25rem' />
              </Btn>
            </Section>
          )}
          {ui.app && (
            <Section active={activePane} top bottom>
              <Btn
                active={activePane === 'app'}
                suspended={ui.pane === 'app' && !activePane}
                onClick={() => world.ui.togglePane('app')}
              >
                <SquareMenuIcon size='1.25rem' />
              </Btn>
              <Btn
                active={activePane === 'script'}
                suspended={ui.pane === 'script' && !activePane}
                onClick={() => world.ui.togglePane('script')}
              >
                <CodeIcon size='1.25rem' />
              </Btn>
              <Btn
                active={activePane === 'nodes'}
                suspended={ui.pane === 'nodes' && !activePane}
                onClick={() => world.ui.togglePane('nodes')}
              >
                <ListTreeIcon size='1.25rem' />
              </Btn>
              <Btn
                active={activePane === 'meta'}
                suspended={ui.pane === 'meta' && !activePane}
                onClick={() => world.ui.togglePane('meta')}
              >
                <TagIcon size='1.25rem' />
              </Btn>
            </Section>
          )}
        </div>
        {ui.pane === 'prefs' && <Prefs world={world} hidden={!ui.active} />}
        {ui.pane === 'world' && <World world={world} hidden={!ui.active} />}
        {ui.pane === 'apps' && <Apps world={world} hidden={!ui.active} />}
        {ui.pane === 'add' && <Add world={world} hidden={!ui.active} />}
        {ui.pane === 'app' && <App key={ui.app.data.id} world={world} hidden={!ui.active} />}
        {ui.pane === 'script' && <Script key={ui.app.data.id} world={world} hidden={!ui.active} />}
        {ui.pane === 'nodes' && <Nodes key={ui.app.data.id} world={world} hidden={!ui.active} />}
        {ui.pane === 'meta' && <Meta key={ui.app.data.id} world={world} hidden={!ui.active} />}
        {ui.pane === 'players' && <Players world={world} hidden={!ui.active} />}
      </div>
    </HintProvider>
  )
}

function Section({ active, top, bottom, children }) {
  return (
    <div
      className={cls('sidebar-section', { active, top, bottom })}
      css={css`
        background: rgba(11, 10, 21, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 2rem;
        padding: 0.6875rem 0;
        pointer-events: auto;
        position: relative;
        &.active {
          background: rgba(11, 10, 21, 0.9);
        }
      `}
    >
      {children}
    </div>
  )
}

function Btn({ disabled, suspended, active, muted, children, ...props }) {
  return (
    <div
      className={cls('sidebar-btn', { disabled, suspended, active, muted })}
      css={css`
        width: 2.75rem;
        height: 1.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        position: relative;
        .sidebar-btn-dot {
          display: none;
          position: absolute;
          top: 0.8rem;
          right: 0.2rem;
          width: 0.3rem;
          height: 0.3rem;
          border-radius: 0.15rem;
          background: white;
        }
        &:hover {
          cursor: pointer;
          color: white;
        }
        &.active {
          color: white;
          .sidebar-btn-dot {
            display: block;
          }
        }
        &.suspended {
          .sidebar-btn-dot {
            display: block;
            /* background: rgb(26, 151, 241); */
          }
        }
        &.disabled {
          color: rgba(255, 255, 255, 0.3);
        }
        &.muted {
          color: #ff4b4b;
        }
      `}
      {...props}
    >
      {children}
      <div className='sidebar-btn-dot' />
    </div>
  )
}

function Content({ width = '20rem', hidden, children }) {
  return (
    <div
      className={cls('sidebar-content', { hidden })}
      css={css`
        width: ${width};
        pointer-events: auto;
        .sidebar-content-main {
          background: rgba(11, 10, 21, 0.85);
          border: 0.0625rem solid #2a2b39;
          backdrop-filter: blur(5px);
          border-radius: 1rem;
          display: flex;
          align-items: stretch;
        }
        &.hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}
    >
      <div className='sidebar-content-main'>{children}</div>
      <Hint />
    </div>
  )
}

function Pane({ width = '20rem', hidden, children }) {
  return (
    <div
      className={cls('sidebarpane', { hidden })}
      css={css`
        width: ${width};
        max-width: 100%;
        display: flex;
        flex-direction: column;
        .sidebarpane-content {
          pointer-events: auto;
          max-height: 100%;
          display: flex;
          flex-direction: column;
        }
        &.hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}
    >
      <div className='sidebarpane-content'>{children}</div>
      <Hint />
    </div>
  )
}

function Hint() {
  const { hint } = useContext(HintContext)
  if (!hint) return null
  return (
    <div
      className='hint'
      css={css`
        margin-top: 0.25rem;
        background: rgba(11, 10, 21, 0.85);
        border: 0.0625rem solid #2a2b39;
        backdrop-filter: blur(5px);
        border-radius: 1rem;
        min-width: 0;
        padding: 1rem;
        font-size: 0.9375rem;
      `}
    >
      <span>{hint}</span>
    </div>
  )
}

function Group({ label }) {
  return (
    <>
      <div
        css={css`
          height: 0.0625rem;
          background: rgba(255, 255, 255, 0.05);
          margin: 0.6rem 0;
        `}
      />
      {label && (
        <div
          css={css`
            font-weight: 500;
            line-height: 1;
            padding: 0.75rem 0 0.75rem 1rem;
            margin-top: -0.6rem;
          `}
        >
          {label}
        </div>
      )}
    </>
  )
}

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'Low', value: 'low' },
  { label: 'Med', value: 'med' },
  { label: 'High', value: 'high' },
]
function Prefs({ world, hidden }) {
  const player = world.entities.player
  const { isAdmin, isBuilder } = useRank(world, player)
  const [name, setName] = useState(() => player.data.name)
  const [dpr, setDPR] = useState(world.prefs.dpr)
  const [shadows, setShadows] = useState(world.prefs.shadows)
  const [postprocessing, setPostprocessing] = useState(world.prefs.postprocessing)
  const [bloom, setBloom] = useState(world.prefs.bloom)
  const [ao, setAO] = useState(world.prefs.ao)
  const [music, setMusic] = useState(world.prefs.music)
  const [sfx, setSFX] = useState(world.prefs.sfx)
  const [voice, setVoice] = useState(world.prefs.voice)
  const [ui, setUI] = useState(world.prefs.ui)
  const [canFullscreen, isFullscreen, toggleFullscreen] = useFullscreen()
  const [actions, setActions] = useState(world.prefs.actions)
  const [stats, setStats] = useState(world.prefs.stats)
  const changeName = name => {
    if (!name) return setName(player.data.name)
    player.setName(name)
  }
  const dprOptions = useMemo(() => {
    const width = world.graphics.width
    const height = world.graphics.height
    const dpr = window.devicePixelRatio
    const options = []
    const add = (label, dpr) => {
      options.push({
        // label: `${Math.round(width * dpr)} x ${Math.round(height * dpr)}`,
        label,
        value: dpr,
      })
    }
    add('0.5x', 0.5)
    add('1x', 1)
    if (dpr >= 2) add('2x', 2)
    if (dpr >= 3) add('3x', dpr)
    return options
  }, [])
  useEffect(() => {
    const onPrefsChange = changes => {
      if (changes.dpr) setDPR(changes.dpr.value)
      if (changes.shadows) setShadows(changes.shadows.value)
      if (changes.postprocessing) setPostprocessing(changes.postprocessing.value)
      if (changes.bloom) setBloom(changes.bloom.value)
      if (changes.ao) setAO(changes.ao.value)
      if (changes.music) setMusic(changes.music.value)
      if (changes.sfx) setSFX(changes.sfx.value)
      if (changes.voice) setVoice(changes.voice.value)
      if (changes.ui) setUI(changes.ui.value)
      if (changes.actions) setActions(changes.actions.value)
      if (changes.stats) setStats(changes.stats.value)
    }
    world.prefs.on('change', onPrefsChange)
    return () => {
      world.prefs.off('change', onPrefsChange)
    }
  }, [])
  return (
    <Pane hidden={hidden}>
      <div
        className='prefs noscrollbar'
        css={css`
          overflow-y: auto;
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          padding: 0.6rem 0;
        `}
      >
        <FieldText label='Name' hint='Change your name' value={name} onChange={changeName} />
        <Group label='Interface' />
        <FieldRange
          label='Scale'
          hint='Change the scale of the user interface'
          min={0.5}
          max={1.5}
          step={0.1}
          value={ui}
          onChange={ui => world.prefs.setUI(ui)}
        />
        <FieldToggle
          label='Fullscreen'
          hint='Toggle fullscreen. Not supported in some browsers'
          value={isFullscreen}
          onChange={value => toggleFullscreen(value)}
          trueLabel='Enabled'
          falseLabel='Disabled'
        />
        {isBuilder && (
          <FieldToggle
            label='Build Prompts'
            hint='Show or hide action prompts when in build mode'
            value={actions}
            onChange={actions => world.prefs.setActions(actions)}
            trueLabel='Visible'
            falseLabel='Hidden'
          />
        )}
        <FieldToggle
          label='Stats'
          hint='Show or hide performance stats'
          value={world.prefs.stats}
          onChange={stats => world.prefs.setStats(stats)}
          trueLabel='Visible'
          falseLabel='Hidden'
        />
        {!isTouch && (
          <FieldBtn
            label='Hide Interface'
            note='Z'
            hint='Hide the user interface. Press Z to re-enable.'
            onClick={() => world.ui.toggleVisible()}
          />
        )}
        <Group label='Graphics' />
        <FieldSwitch
          label='Resolution'
          hint='Change your display resolution'
          options={dprOptions}
          value={dpr}
          onChange={dpr => world.prefs.setDPR(dpr)}
        />
        <FieldSwitch
          label='Shadows'
          hint='Change the quality of shadows in the world'
          options={shadowOptions}
          value={shadows}
          onChange={shadows => world.prefs.setShadows(shadows)}
        />
        <FieldToggle
          label='Post-processing'
          hint='Enable or disable all postprocessing effects'
          trueLabel='On'
          falseLabel='Off'
          value={postprocessing}
          onChange={postprocessing => world.prefs.setPostprocessing(postprocessing)}
        />
        <FieldToggle
          label='Bloom'
          hint='Enable or disable the bloom effect'
          trueLabel='On'
          falseLabel='Off'
          value={bloom}
          onChange={bloom => world.prefs.setBloom(bloom)}
        />
        {world.settings.ao && (
          <FieldToggle
            label='Ambient Occlusion'
            hint='Enable or disable the ambient occlusion effect'
            trueLabel='On'
            falseLabel='Off'
            value={ao}
            onChange={ao => world.prefs.setAO(ao)}
          />
        )}
        <Group label='Audio' />
        <FieldRange
          label='Music'
          hint='Adjust general music volume'
          min={0}
          max={2}
          step={0.05}
          value={music}
          onChange={music => world.prefs.setMusic(music)}
        />
        <FieldRange
          label='SFX'
          hint='Adjust sound effects volume'
          min={0}
          max={2}
          step={0.05}
          value={sfx}
          onChange={sfx => world.prefs.setSFX(sfx)}
        />
        <FieldRange
          label='Voice'
          hint='Adjust global voice chat volume'
          min={0}
          max={2}
          step={0.05}
          value={voice}
          onChange={voice => world.prefs.setVoice(voice)}
        />
      </div>
    </Pane>
  )
}

const voiceChatOptions = [
  { label: 'Disabled', value: 'disabled' },
  { label: 'Spatial', value: 'spatial' },
  { label: 'Global', value: 'global' },
]
const rankOptions = [
  { label: 'Admins', value: 2 },
  { label: 'Builders', value: 1 },
  { label: 'Visitors', value: 0 },
]
function World({ world, hidden }) {
  const player = world.entities.player
  const { isAdmin } = useRank(world, player)
  const [title, setTitle] = useState(world.settings.title)
  const [desc, setDesc] = useState(world.settings.desc)
  const [image, setImage] = useState(world.settings.image)
  const [avatar, setAvatar] = useState(world.settings.avatar)
  const [customAvatars, setCustomAvatars] = useState(world.settings.customAvatars)
  const [voice, setVoice] = useState(world.settings.voice)
  const [playerLimit, setPlayerLimit] = useState(world.settings.playerLimit)
  const [ao, setAO] = useState(world.settings.ao)
  const [rank, setRank] = useState(world.settings.rank)
  useEffect(() => {
    const onChange = changes => {
      if (changes.title) setTitle(changes.title.value)
      if (changes.desc) setDesc(changes.desc.value)
      if (changes.image) setImage(changes.image.value)
      if (changes.avatar) setAvatar(changes.avatar.value)
      if (changes.customAvatars) setCustomAvatars(changes.customAvatars.value)
      if (changes.voice) setVoice(changes.voice.value)
      if (changes.playerLimit) setPlayerLimit(changes.playerLimit.value)
      if (changes.ao) setAO(changes.ao.value)
      if (changes.rank) setRank(changes.rank.value)
    }
    world.settings.on('change', onChange)
    return () => {
      world.settings.off('change', onChange)
    }
  }, [])
  return (
    <Pane hidden={hidden}>
      <div
        className='world'
        css={css`
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          display: flex;
          flex-direction: column;
          min-height: 12rem;
          .world-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .world-title {
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
          }
          .world-content {
            flex: 1;
            padding: 0.5rem 0;
            overflow-y: auto;
          }
        `}
      >
        <div className='world-head'>
          <div className='world-title'>World</div>
        </div>
        <div className='world-content noscrollbar'>
          <FieldText
            label='Title'
            hint='Change the title of this world. Shown in the browser tab and when sharing links'
            placeholder='World'
            value={title}
            onChange={value => world.settings.set('title', value, true)}
          />
          <FieldText
            label='Description'
            hint='Change the description of this world. Shown in previews when sharing links to this world'
            value={desc}
            onChange={value => world.settings.set('desc', value, true)}
          />
          <FieldFile
            label='Image'
            hint='Change the image of the world. This is shown when loading into or sharing links to this world.'
            kind='image'
            value={image}
            onChange={value => world.settings.set('image', value, true)}
            world={world}
          />
          <FieldFile
            label='Avatar'
            hint='Change the default avatar everyone spawns into the world with'
            kind='avatar'
            value={avatar}
            onChange={value => world.settings.set('avatar', value, true)}
            world={world}
          />
          {isAdmin && world.settings.hasAdminCode && (
            <FieldToggle
              label='Custom Avatars'
              hint='Allow visitors to drag and drop custom VRM avatars.'
              trueLabel='On'
              falseLabel='Off'
              value={customAvatars}
              onChange={value => world.settings.set('customAvatars', value, true)}
            />
          )}
          <FieldSwitch
            label='Voice Chat'
            hint='Set the base voice chat mode. Apps are able to modify this using custom rules.'
            options={voiceChatOptions}
            value={voice}
            onChange={voice => world.settings.set('voice', voice, true)}
          />
          <FieldNumber
            label='Player Limit'
            hint='Set a maximum number of players that can be in the world at one time. Zero means unlimited.'
            value={playerLimit}
            onChange={value => world.settings.set('playerLimit', value, true)}
          />
          <FieldToggle
            label='Ambient Occlusion'
            hint={`Improves visuals by approximating darkened corners etc. When enabled, users also have an option to disable this on their device for performance.`}
            trueLabel='On'
            falseLabel='Off'
            value={ao}
            onChange={value => world.settings.set('ao', value, true)}
          />
          {isAdmin && world.settings.hasAdminCode && (
            <FieldToggle
              label='Free Build'
              hint='Allow everyone to build (and destroy) things in the world.'
              trueLabel='On'
              falseLabel='Off'
              value={rank >= Ranks.BUILDER}
              onChange={value => world.settings.set('rank', value ? Ranks.BUILDER : Ranks.VISITOR, true)}
            />
          )}
          {/* <FieldBtn
          label='Set Spawn'
          hint='Sets the location players spawn to the location you are currently standing'
          onClick={() => {
            world.network.send('spawnModified', 'set')
          }}
        /> */}
          {/* <FieldBtn
          label='Clear Spawn'
          hint='Resets the spawn point to origin'
          onClick={() => {
            world.network.send('spawnModified', 'clear')
          }}
        /> */}
        </div>
      </div>
    </Pane>
  )
}

const appsState = {
  query: '',
  perf: false,
  scrollTop: 0,
}
function Apps({ world, hidden }) {
  const contentRef = useRef()
  const [query, setQuery] = useState(appsState.query)
  const [perf, setPerf] = useState(appsState.perf)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    contentRef.current.scrollTop = appsState.scrollTop
  }, [])
  useEffect(() => {
    appsState.query = query
    appsState.perf = perf
  }, [query, perf])
  return (
    <Pane width={perf ? '40rem' : '20rem'} hidden={hidden}>
      <div
        className='apps'
        css={css`
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 17rem;
          .apps-head {
            height: 3.125rem;
            padding: 0 0.6rem 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .apps-title {
            flex: 1;
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
          }
          .apps-search {
            display: flex;
            align-items: center;
            input {
              margin-left: 0.5rem;
              width: 5rem;
              font-size: 0.9375rem;
              &::placeholder {
                color: #5d6077;
              }
              &::selection {
                background-color: white;
                color: rgba(0, 0, 0, 0.8);
              }
            }
          }
          .apps-toggle {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 0 0 1rem;
            color: #5d6077;
            &:hover {
              cursor: pointer;
            }
            &.active {
              color: white;
            }
          }
          .apps-content {
            flex: 1;
            overflow-y: auto;
          }
        `}
      >
        <div className='apps-head'>
          <div className='apps-title'>Apps</div>
          <label className='apps-search'>
            <SearchIcon size='1.125rem' />
            <input type='text' placeholder='Search' value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <div className={cls('apps-toggle', { active: perf })} onClick={() => setPerf(!perf)}>
            <RocketIcon size='1.125rem' />
          </div>
        </div>
        <div
          ref={contentRef}
          className='apps-content noscrollbar'
          onScroll={e => {
            appsState.scrollTop = contentRef.current.scrollTop
          }}
        >
          <AppsList world={world} query={query} perf={perf} refresh={refresh} setRefresh={setRefresh} />
        </div>
      </div>
    </Pane>
  )
}

function Add({ world, hidden }) {
  // note: multiple collections are supported by the engine but for now we just use the 'default' collection.
  const collection = world.collections.get('default')
  const span = 4
  const gap = '0.5rem'
  const add = blueprint => {
    blueprint = cloneDeep(blueprint)
    blueprint.id = uuid()
    blueprint.version = 0
    world.blueprints.add(blueprint, true)
    const transform = world.builder.getSpawnTransform(true)
    world.builder.toggle(true)
    world.builder.control.pointer.lock()
    setTimeout(() => {
      const data = {
        id: uuid(),
        type: 'app',
        blueprint: blueprint.id,
        position: transform.position,
        quaternion: transform.quaternion,
        scale: [1, 1, 1],
        mover: world.network.id,
        uploader: null,
        pinned: false,
        state: {},
      }
      const app = world.entities.add(data, true)
      world.builder.select(app)
    }, 100)
  }
  return (
    <Pane hidden={hidden}>
      <div
        className='add'
        css={css`
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          display: flex;
          flex-direction: column;
          min-height: 17rem;
          .add-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .add-title {
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
          }
          .add-content {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
          }
          .add-items {
            display: flex;
            align-items: stretch;
            flex-wrap: wrap;
            gap: ${gap};
          }
          .add-item {
            flex-basis: calc((100% / ${span}) - (${gap} * (${span} - 1) / ${span}));
            cursor: pointer;
          }
          .add-item-image {
            width: 100%;
            aspect-ratio: 1;
            background-color: #1c1d22;
            background-size: cover;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 0.7rem;
            margin: 0 0 0.4rem;
          }
          .add-item-name {
            text-align: center;
            font-size: 0.875rem;
          }
        `}
      >
        <div className='add-head'>
          <div className='add-title'>Add</div>
        </div>
        <div className='add-content noscrollbar'>
          <div className='add-items'>
            {collection.blueprints.map(blueprint => (
              <div className='add-item' key={blueprint.id} onClick={() => add(blueprint)}>
                <div
                  className='add-item-image'
                  css={css`
                    background-image: url(${world.resolveURL(blueprint.image?.url)});
                  `}
                ></div>
                <div className='add-item-name'>{blueprint.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Pane>
  )
}

const extToType = {
  glb: 'model',
  vrm: 'avatar',
}
const allowedModels = ['glb', 'vrm']
let showTransforms = false

function App({ world, hidden }) {
  const { setHint } = useContext(HintContext)
  const app = world.ui.state.app
  const [pinned, setPinned] = useState(app.data.pinned)
  const [transforms, setTransforms] = useState(showTransforms)
  const [blueprint, setBlueprint] = useState(app.blueprint)
  useEffect(() => {
    showTransforms = transforms
  }, [transforms])
  useEffect(() => {
    window.app = app
    const onModify = bp => {
      if (bp.id === blueprint.id) setBlueprint(bp)
    }
    world.blueprints.on('modify', onModify)
    return () => {
      world.blueprints.off('modify', onModify)
    }
  }, [])
  const frozen = blueprint.frozen // TODO: disable code editor, model change, metadata editing, flag editing etc
  const download = async () => {
    try {
      const file = await exportApp(app.blueprint, world.loader.loadFile)
      downloadFile(file)
    } catch (err) {
      console.error(err)
    }
  }
  const changeModel = async file => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!allowedModels.includes(ext)) return
    // immutable hash the file
    const hash = await hashFile(file)
    // use hash as glb filename
    const filename = `${hash}.${ext}`
    // canonical url to this file
    const url = `asset://${filename}`
    // cache file locally so this client can insta-load it
    const type = extToType[ext]
    world.loader.insert(type, url, file)
    // update blueprint locally (also rebuilds apps)
    const version = blueprint.version + 1
    world.blueprints.modify({ id: blueprint.id, version, model: url })
    // upload model
    await world.network.upload(file)
    // broadcast blueprint change to server + other clients
    world.network.send('blueprintModified', { id: blueprint.id, version, model: url })
  }
  const toggleKey = async (key, value) => {
    value = isBoolean(value) ? value : !blueprint[key]
    if (blueprint[key] === value) return
    const version = blueprint.version + 1
    world.blueprints.modify({ id: blueprint.id, version, [key]: value })
    world.network.send('blueprintModified', { id: blueprint.id, version, [key]: value })
  }
  const togglePinned = () => {
    const pinned = !app.data.pinned
    app.data.pinned = pinned
    world.network.send('entityModified', { id: app.data.id, pinned })
    setPinned(pinned)
  }
  return (
    <Pane hidden={hidden}>
      <div
        className='app'
        css={css`
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          display: flex;
          flex-direction: column;
          min-height: 1rem;
          .app-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .app-title {
            flex: 1;
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .app-btn {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.8);
            &:hover {
              cursor: pointer;
              color: white;
            }
          }
          .app-toggles {
            padding: 0.5rem 1.4rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .app-toggle {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6f7289;
            &:hover:not(.disabled) {
              cursor: pointer;
            }
            &.active {
              color: white;
            }
            &.disabled {
              color: #434556;
            }
          }
          .app-transforms {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .app-transforms-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.4rem;
            &:hover {
              cursor: pointer;
            }
          }
          .app-content {
            flex: 1;
            overflow-y: auto;
          }
        `}
      >
        <div className='app-head'>
          <div className='app-title'>{app.blueprint.name}</div>
          <div
            className='app-btn'
            onClick={download}
            onPointerEnter={() => setHint('Download this app')}
            onPointerLeave={() => setHint(null)}
          >
            <DownloadIcon size='1.125rem' />
          </div>
          {!frozen && (
            <AppModelBtn value={blueprint.model} onChange={changeModel}>
              <div
                className='app-btn'
                onPointerEnter={() => setHint('Change this apps base model')}
                onPointerLeave={() => setHint(null)}
              >
                <BoxIcon size='1.125rem' />
              </div>
            </AppModelBtn>
          )}
          {!blueprint.scene && (
            <div
              className='app-btn'
              onClick={() => {
                world.ui.setApp(null)
                app.destroy(true)
              }}
              onPointerEnter={() => setHint('Delete this app')}
              onPointerLeave={() => setHint(null)}
            >
              <Trash2Icon size='1.125rem' />
            </div>
          )}
        </div>
        {!blueprint.scene && (
          <div className='app-toggles'>
            <div
              className={cls('app-toggle', { active: blueprint.disabled })}
              onClick={() => toggleKey('disabled')}
              onPointerEnter={() => setHint('Disable this app so that it is no longer active in the world.')}
              onPointerLeave={() => setHint(null)}
            >
              <OctagonXIcon size='1.125rem' />
              {/* {blueprint.disabled ? <SquareIcon size='1.125rem' /> : <SquareCheckBigIcon size='1.125rem' />} */}
            </div>
            <div
              className={cls('app-toggle', { active: pinned })}
              onClick={() => togglePinned()}
              onPointerEnter={() => setHint("Pin this app so it can't accidentally be moved.")}
              onPointerLeave={() => setHint(null)}
            >
              <PinIcon size='1.125rem' />
            </div>
            <div
              className={cls('app-toggle', { active: blueprint.preload })}
              onClick={() => toggleKey('preload')}
              onPointerEnter={() => setHint('Preload this app before entering the world.')}
              onPointerLeave={() => setHint(null)}
            >
              <LoaderPinwheelIcon size='1.125rem' />
            </div>
            <div
              className={cls('app-toggle', { active: blueprint.unique })}
              onClick={() => toggleKey('unique')}
              onPointerEnter={() => setHint('Make this app unique so that new duplicates are not linked to this one.')}
              onPointerLeave={() => setHint(null)}
            >
              <SparkleIcon size='1.125rem' />
            </div>
          </div>
        )}
        <div className='app-content noscrollbar'>
          {!blueprint.scene && (
            <div className='app-transforms'>
              <div className='app-transforms-btn' onClick={() => setTransforms(!transforms)}>
                <ChevronsUpDownIcon size='1rem' />
              </div>
              {transforms && <AppTransformFields app={app} />}
            </div>
          )}
          <AppFields world={world} app={app} blueprint={blueprint} />
        </div>
      </div>
    </Pane>
  )
}

function AppTransformFields({ app }) {
  const [position, setPosition] = useState(app.root.position.toArray())
  const [rotation, setRotation] = useState(app.root.rotation.toArray().map(n => n * RAD2DEG))
  const [scale, setScale] = useState(app.root.scale.toArray())
  return (
    <>
      <FieldVec3
        label='Position'
        dp={1}
        step={0.1}
        bigStep={1}
        value={position}
        onChange={value => {
          console.log(value)
          setPosition(value)
          app.modify({ position: value })
          app.world.network.send('entityModified', {
            id: app.data.id,
            position: value,
          })
        }}
      />
      <FieldVec3
        label='Rotation'
        dp={1}
        step={1}
        bigStep={5}
        value={rotation}
        onChange={value => {
          setRotation(value)
          value = q1.setFromEuler(e1.fromArray(value.map(n => n * DEG2RAD))).toArray()
          app.modify({ quaternion: value })
          app.world.network.send('entityModified', {
            id: app.data.id,
            quaternion: value,
          })
        }}
      />
      <FieldVec3
        label='Scale'
        dp={1}
        step={0.1}
        bigStep={1}
        value={scale}
        onChange={value => {
          setScale(value)
          app.modify({ scale: value })
          app.world.network.send('entityModified', {
            id: app.data.id,
            scale: value,
          })
        }}
      />
    </>
  )
}

// todo: blueprint models need migrating to file object format so
// we can replace needing this and instead use MenuItemFile, but
// that will also somehow need to support both model and avatar kinds.
function AppModelBtn({ value, onChange, children }) {
  const [key, setKey] = useState(0)
  const handleDownload = e => {
    if (e.shiftKey) {
      e.preventDefault()
      const file = world.loader.getFile(value)
      if (!file) return
      downloadFile(file)
    }
  }
  const handleChange = e => {
    setKey(n => n + 1)
    onChange(e.target.files[0])
  }
  return (
    <label
      className='appmodelbtn'
      css={css`
        overflow: hidden;
        input {
          position: absolute;
          top: -9999px;
        }
      `}
      onClick={handleDownload}
    >
      <input key={key} type='file' accept='.glb,.vrm' onChange={handleChange} />
      {children}
    </label>
  )
}

function AppFields({ world, app, blueprint }) {
  const [fields, setFields] = useState(() => app.fields)
  const props = blueprint.props
  useEffect(() => {
    app.onFields = setFields
    return () => {
      app.onFields = null
    }
  }, [])
  const modify = (key, value) => {
    if (props[key] === value) return
    const bp = world.blueprints.get(blueprint.id)
    const newProps = { ...bp.props, [key]: value }
    // update blueprint locally (also rebuilds apps)
    const id = bp.id
    const version = bp.version + 1
    world.blueprints.modify({ id, version, props: newProps })
    // broadcast blueprint change to server + other clients
    world.network.send('blueprintModified', { id, version, props: newProps })
  }
  return fields.map(field => (
    <AppField key={field.key} world={world} props={props} field={field} value={props[field.key]} modify={modify} />
  ))
}

function AppField({ world, props, field, value, modify }) {
  if (field.hidden) {
    return null
  }
  if (field.when && isArray(field.when)) {
    for (const rule of field.when) {
      if (rule.op === 'eq' && props[rule.key] !== rule.value) {
        return null
      }
    }
  }
  if (field.type === 'section') {
    return <Group label={field.label} />
  }
  if (field.type === 'text') {
    return (
      <FieldText
        label={field.label}
        hint={field.hint}
        placeholder={field.placeholder}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'textarea') {
    return (
      <FieldTextarea label={field.label} hint={field.hint} value={value} onChange={value => modify(field.key, value)} />
    )
  }
  if (field.type === 'number') {
    return (
      <FieldNumber
        label={field.label}
        hint={field.hint}
        dp={field.dp}
        min={field.min}
        max={field.max}
        step={field.step}
        bigStep={field.bigStep}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'file') {
    return (
      <FieldFile
        label={field.label}
        hint={field.hint}
        kind={field.kind}
        value={value}
        onChange={value => modify(field.key, value)}
        world={world}
      />
    )
  }
  if (field.type === 'switch') {
    return (
      <FieldSwitch
        label={field.label}
        hint={field.hint}
        options={field.options}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'dropdown') {
    // deprecated, same as switch
    return (
      <FieldSwitch
        label={field.label}
        hint={field.hint}
        options={field.options}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'toggle') {
    return (
      <FieldToggle
        label={field.label}
        hint={field.hint}
        trueLabel={field.trueLabel}
        falseLabel={field.falseLabel}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'range') {
    return (
      <FieldRange
        label={field.label}
        hint={field.hint}
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'curve') {
    return (
      <FieldCurve
        label={field.label}
        hint={field.hint}
        yMin={field.yMin}
        yMax={field.yMax}
        value={value}
        onChange={value => modify(field.key, value)}
      />
    )
  }
  if (field.type === 'button') {
    return <FieldBtn label={field.label} hint={field.hint} onClick={field.onClick} />
  }
  return null
}

function Script({ world, hidden }) {
  const app = world.ui.state.app
  const containerRef = useRef()
  const resizeRef = useRef()
  const [handle, setHandle] = useState(null)
  useEffect(() => {
    const elem = resizeRef.current
    const container = containerRef.current
    container.style.width = `${storage.get('code-editor-width', 500)}px`
    let active
    function onPointerDown(e) {
      active = true
      elem.addEventListener('pointermove', onPointerMove)
      elem.addEventListener('pointerup', onPointerUp)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    function onPointerMove(e) {
      let newWidth = container.offsetWidth + e.movementX
      if (newWidth < 250) newWidth = 250
      container.style.width = `${newWidth}px`
      storage.set('code-editor-width', newWidth)
    }
    function onPointerUp(e) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      elem.removeEventListener('pointermove', onPointerMove)
      elem.removeEventListener('pointerup', onPointerUp)
    }
    elem.addEventListener('pointerdown', onPointerDown)
    return () => {
      elem.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])
  return (
    <div
      ref={containerRef}
      className={cls('script', { hidden })}
      css={css`
        pointer-events: auto;
        align-self: stretch;
        background: rgba(11, 10, 21, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 1.375rem;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-height: 23.7rem;
        position: relative;
        .script-head {
          height: 3.125rem;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .script-title {
          flex: 1;
          font-weight: 500;
          font-size: 1rem;
          line-height: 1;
        }
        .script-btn {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          &:hover {
            cursor: pointer;
            color: white;
          }
        }
        .script-resizer {
          position: absolute;
          top: 0;
          bottom: 0;
          right: -5px;
          width: 10px;
          cursor: ew-resize;
        }
        &.hidden {
          opacity: 0;
          pointer-events: none;
        }
      `}
    >
      <div className='script-head'>
        <div className='script-title'>Script: {app.blueprint?.name}</div>
        <div className='script-btn' onClick={() => handle?.save()}>
          <SaveIcon size='1.125rem' />
        </div>
      </div>
      <ScriptEditor key={app.data.id} app={app} onHandle={setHandle} />
      <div className='script-resizer' ref={resizeRef} />
    </div>
  )
}

function Nodes({ world, hidden }) {
  const app = world.ui.state.app
  return (
    <Pane hidden={hidden}>
      <div
        className='nodes'
        css={css`
          flex: 1;
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          min-height: 23.7rem;
          display: flex;
          flex-direction: column;
          .nodes-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .nodes-title {
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
          }
        `}
      >
        <div className='nodes-head'>
          <div className='nodes-title'>Nodes</div>
        </div>
        <NodeHierarchy app={app} />
      </div>
    </Pane>
  )
}

function Meta({ world, hidden }) {
  const app = world.ui.state.app
  const [blueprint, setBlueprint] = useState(app.blueprint)
  useEffect(() => {
    window.app = app
    const onModify = bp => {
      if (bp.id === blueprint.id) setBlueprint(bp)
    }
    world.blueprints.on('modify', onModify)
    return () => {
      world.blueprints.off('modify', onModify)
    }
  }, [])
  const set = async (key, value) => {
    const version = blueprint.version + 1
    world.blueprints.modify({ id: blueprint.id, version, [key]: value })
    world.network.send('blueprintModified', { id: blueprint.id, version, [key]: value })
  }
  return (
    <Pane hidden={hidden}>
      <div
        className='meta'
        css={css`
          flex: 1;
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          display: flex;
          flex-direction: column;
          min-height: 1rem;
          .meta-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .meta-title {
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
          }
          .meta-content {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem 0;
          }
        `}
      >
        <div className='meta-head'>
          <div className='meta-title'>Metadata</div>
        </div>
        <div className='meta-content noscrollbar'>
          <FieldText
            label='Name'
            hint='The name of this app'
            value={blueprint.name}
            onChange={value => set('name', value)}
          />
          <FieldFile
            label='Image'
            hint='An image/icon for this app'
            kind='texture'
            value={blueprint.image}
            onChange={value => set('image', value)}
            world={world}
          />
          <FieldText
            label='Author'
            hint='The name of the author that made this app'
            value={blueprint.author}
            onChange={value => set('author', value)}
          />
          <FieldText
            label='URL'
            hint='A url for this app'
            value={blueprint.url}
            onChange={value => set('url', value)}
          />
          <FieldTextarea
            label='Description'
            hint='A description for this app'
            value={blueprint.desc}
            onChange={value => set('desc', value)}
          />
        </div>
      </div>
    </Pane>
  )
}

function getPlayers(world) {
  let players = []
  world.entities.players.forEach(player => {
    players.push(player)
  })
  players = sortBy(players, player => player.enteredAt)
  return players
}
function Players({ world, hidden }) {
  const { setHint } = useContext(HintContext)
  const localPlayer = world.entities.player
  const isAdmin = localPlayer.isAdmin()
  const [players, setPlayers] = useState(() => getPlayers(world))
  useEffect(() => {
    const onChange = () => {
      setPlayers(getPlayers(world))
    }
    world.entities.on('added', onChange)
    world.entities.on('removed', onChange)
    world.livekit.on('speaking', onChange)
    world.livekit.on('muted', onChange)
    world.on('rank', onChange)
    world.on('name', onChange)
    return () => {
      world.entities.off('added', onChange)
      world.entities.off('removed', onChange)
      world.livekit.off('speaking', onChange)
      world.livekit.off('muted', onChange)
      world.off('rank', onChange)
      world.off('name', onChange)
    }
  }, [])
  const toggleBuilder = player => {
    if (player.data.rank === Ranks.BUILDER) {
      world.network.send('modifyRank', { playerId: player.data.id, rank: Ranks.VISITOR })
    } else {
      world.network.send('modifyRank', { playerId: player.data.id, rank: Ranks.BUILDER })
    }
  }
  const toggleMute = player => {
    world.network.send('mute', { playerId: player.data.id, muted: !player.isMuted() })
  }
  const kick = player => {
    world.network.send('kick', player.data.id)
  }
  const teleportTo = player => {
    // behind player 0.6m (capsule size)
    const position = new THREE.Vector3(0, 0, 1)
    position.applyQuaternion(player.base.quaternion)
    position.multiplyScalar(0.6).add(player.base.position)
    localPlayer.teleport({
      position,
      rotationY: player.base.rotation.y,
    })
  }
  return (
    <Pane hidden={hidden}>
      <div
        className='players'
        css={css`
          background: rgba(11, 10, 21, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.375rem;
          display: flex;
          flex-direction: column;
          min-height: 1rem;
          .players-head {
            height: 3.125rem;
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
          }
          .players-title {
            flex: 1;
            font-weight: 500;
            font-size: 1rem;
            line-height: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .players-content {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem 0;
          }
          .players-item {
            display: flex;
            align-items: center;
            padding: 0.1rem 0.5rem 0.1rem 1rem;
            height: 36px;
          }
          .players-name {
            flex: 1;
            display: flex;
            align-items: center;
            span {
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              margin-right: 0.5rem;
            }
            svg {
              color: rgba(255, 255, 255, 0.6);
            }
          }
          .players-btn {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.8);
            &:hover:not(.readonly) {
              cursor: pointer;
              color: white;
            }
            &.dim {
              color: #556181;
            }
          }
        `}
      >
        <div className='players-head'>
          <div className='players-title'>Players</div>
        </div>
        <div className='players-content noscrollbar'>
          {players.map(player => (
            <div className='players-item' key={player.data.id}>
              <div className='players-name'>
                <span>{player.data.name}</span>
                {player.speaking && <Volume2Icon size='1rem' />}
                {player.isMuted() && <MicOffIcon size='1rem' />}
              </div>
              {isAdmin && player.isRemote && !player.isAdmin() && world.settings.rank < Ranks.BUILDER && (
                <div
                  className={cls('players-btn', { dim: !player.isBuilder() })}
                  onPointerEnter={() =>
                    setHint(
                      player.isBuilder()
                        ? 'Player is not a builder. Click to allow building.'
                        : 'Player is a builder. Click to revoke.'
                    )
                  }
                  onPointerLeave={() => setHint(null)}
                  onClick={() => toggleBuilder(player)}
                >
                  <HammerIcon size='1.125rem' />
                </div>
              )}
              {player.isRemote && localPlayer.outranks(player) && (
                <div
                  className='players-btn'
                  onPointerEnter={() => setHint('Teleport to player.')}
                  onPointerLeave={() => setHint(null)}
                  onClick={() => teleportTo(player)}
                >
                  <CircleArrowRightIcon size='1.125rem' />
                </div>
              )}
              {player.isRemote && localPlayer.outranks(player) && (
                <div
                  className='players-btn'
                  onPointerEnter={() =>
                    setHint(
                      player.isMuted() ? 'Player is muted. Click to unmute.' : 'Player is not muted. Click to mute.'
                    )
                  }
                  onPointerLeave={() => setHint(null)}
                  onClick={() => toggleMute(player)}
                >
                  {player.isMuted() ? <MicOffIcon size='1.125rem' /> : <MicIcon size='1.125rem' />}
                </div>
              )}
              {player.isRemote && localPlayer.outranks(player) && (
                <div
                  className='players-btn'
                  onPointerEnter={() => setHint('Kick this player.')}
                  onPointerLeave={() => setHint(null)}
                  onClick={() => kick(player)}
                >
                  <UserXIcon size='1.125rem' />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Pane>
  )
}
