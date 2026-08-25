import { useCallback, useEffect, useRef, useState } from 'react'

const gameNames = {
  zombie: 'Circle Survivor',
  memory: 'Memory Match',
  reaction: 'Reaction Check',
}

const MEMORY_SYMBOLS = ['◆', '●', '▲', '✦', '■', '✚']

const createMemoryDeck = () => MEMORY_SYMBOLS
  .flatMap((symbol, pair) => [0, 1].map((copy) => ({ id: `${pair}-${copy}`, pair, symbol })))
  .sort(() => Math.random() - 0.5)

function ZombieGame() {
  const arenaRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerRef = useRef({ x: 50, y: 78 })
  const zombiesRef = useRef([])
  const bulletsRef = useRef([])
  const magazineRef = useRef(30)
  const reserveAmmoRef = useRef(270)
  const reloadingRef = useRef(false)
  const reloadTimerRef = useRef(null)
  const settingsRef = useRef({ speed: 1, size: 34, spawnDelay: 850 })
  const [zombies, setZombies] = useState([])
  const [bullets, setBullets] = useState([])
  const [player, setPlayer] = useState({ x: 50, y: 78 })
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [magazine, setMagazine] = useState(30)
  const [reserveAmmo, setReserveAmmo] = useState(270)
  const [reloading, setReloading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({ speed: 1, size: 34, spawnDelay: 850 })
  const [running, setRunning] = useState(true)
  const [rifleAngle, setRifleAngle] = useState(-90)
  const [shooting, setShooting] = useState(false)

  useEffect(() => {
    if (!running) return undefined

    const spawnZombie = () => {
      const edge = Math.floor(Math.random() * 4)
      const position = 5 + Math.random() * 90
      const zombie = {
        id: `${Date.now()}-${Math.random()}`,
        x: edge === 1 ? 3 : edge === 2 ? 97 : position,
        y: edge === 0 ? 3 : edge === 3 ? 97 : position,
        speed: 9 + Math.random() * 4,
      }
      zombiesRef.current = [...zombiesRef.current.slice(-15), zombie]
      setZombies(zombiesRef.current)
    }

    spawnZombie()
    const interval = window.setInterval(spawnZombie, settings.spawnDelay)
    return () => window.clearInterval(interval)
  }, [running, settings.spawnDelay])

  const updateSetting = (name, value) => {
    const nextSettings = { ...settingsRef.current, [name]: Number(value) }
    settingsRef.current = nextSettings
    setSettings(nextSettings)
  }

  const reload = useCallback(() => {
    if (!running || reloadingRef.current || magazineRef.current >= 30 || reserveAmmoRef.current <= 0) return
    reloadingRef.current = true
    setReloading(true)
    reloadTimerRef.current = window.setTimeout(() => {
      const roundsToLoad = Math.min(30 - magazineRef.current, reserveAmmoRef.current)
      magazineRef.current += roundsToLoad
      reserveAmmoRef.current -= roundsToLoad
      setMagazine(magazineRef.current)
      setReserveAmmo(reserveAmmoRef.current)
      reloadingRef.current = false
      setReloading(false)
    }, 1200)
  }, [running])

  useEffect(() => {
    const movementKeys = new Set(['w', 'a', 's', 'd'])
    const keyDown = (event) => {
      const key = event.key.toLowerCase()
      if (movementKeys.has(key)) {
        event.preventDefault()
        keysRef.current.add(key)
      }
      if (key === 'r') {
        event.preventDefault()
        reload()
      }
    }
    const keyUp = (event) => keysRef.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.clearTimeout(reloadTimerRef.current)
    }
  }, [reload])

  const aim = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const playerX = rect.width * playerRef.current.x / 100
    const playerY = rect.height * playerRef.current.y / 100
    setRifleAngle(Math.atan2(event.clientY - rect.top - playerY, event.clientX - rect.left - playerX) * 180 / Math.PI)
  }

  const shoot = (event) => {
    if (!running || event.button !== 0) return
    if (reloadingRef.current) return
    if (magazineRef.current <= 0) {
      reload()
      return
    }
    const rect = arenaRef.current.getBoundingClientRect()
    const startX = rect.width * playerRef.current.x / 100
    const startY = rect.height * playerRef.current.y / 100
    const dx = event.clientX - rect.left - startX
    const dy = event.clientY - rect.top - startY
    const distance = Math.hypot(dx, dy) || 1
    const directionX = dx / distance
    const directionY = dy / distance
    const muzzleDistance = 66
    const bullet = {
      id: `${Date.now()}-${Math.random()}`,
      x: playerRef.current.x + directionX * muzzleDistance * 100 / rect.width,
      y: playerRef.current.y + directionY * muzzleDistance * 100 / rect.height,
      vx: directionX * 1000 * 100 / rect.width,
      vy: directionY * 1000 * 100 / rect.height,
    }
    bulletsRef.current = [...bulletsRef.current, bullet]
    setBullets(bulletsRef.current)
    magazineRef.current -= 1
    setMagazine(magazineRef.current)
    if (magazineRef.current === 0 && reserveAmmoRef.current > 0) reload()
    setShooting(true)
    window.setTimeout(() => setShooting(false), 90)
  }

  useEffect(() => {
    if (!running) return undefined
    let previousTime = performance.now()
    let animationFrame

    const updateGame = (time) => {
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return
      const delta = Math.min((time - previousTime) / 1000, 0.04)
      previousTime = time

      let moveX = Number(keysRef.current.has('d')) - Number(keysRef.current.has('a'))
      let moveY = Number(keysRef.current.has('s')) - Number(keysRef.current.has('w'))
      const moveLength = Math.hypot(moveX, moveY) || 1
      moveX /= moveLength
      moveY /= moveLength
      const nextPlayer = {
        x: Math.max(4, Math.min(96, playerRef.current.x + moveX * 34 * delta)),
        y: Math.max(6, Math.min(94, playerRef.current.y + moveY * 34 * delta)),
      }
      playerRef.current = nextPlayer

      let nextBullets = bulletsRef.current
        .map((bullet) => ({ ...bullet, x: bullet.x + bullet.vx * delta, y: bullet.y + bullet.vy * delta }))
        .filter((bullet) => bullet.x > -3 && bullet.x < 103 && bullet.y > -3 && bullet.y < 103)

      const nextZombies = zombiesRef.current.map((zombie) => {
        const dx = (nextPlayer.x - zombie.x) * rect.width / 100
        const dy = (nextPlayer.y - zombie.y) * rect.height / 100
        const distance = Math.hypot(dx, dy) || 1
        return {
          ...zombie,
          x: zombie.x + (dx / distance) * zombie.speed * settingsRef.current.speed * delta,
          y: zombie.y + (dy / distance) * zombie.speed * settingsRef.current.speed * delta * rect.width / rect.height,
        }
      })

      const hitZombieIds = new Set()
      const hitBulletIds = new Set()
      nextBullets.forEach((bullet) => {
        nextZombies.forEach((zombie) => {
          const distance = Math.hypot(
            (bullet.x - zombie.x) * rect.width / 100,
            (bullet.y - zombie.y) * rect.height / 100,
          )
          if (distance < settingsRef.current.size / 2 + 4) {
            hitZombieIds.add(zombie.id)
            hitBulletIds.add(bullet.id)
          }
        })
      })

      const touchingPlayerIds = new Set()
      nextZombies.forEach((zombie) => {
        const distance = Math.hypot(
          (nextPlayer.x - zombie.x) * rect.width / 100,
          (nextPlayer.y - zombie.y) * rect.height / 100,
        )
        if (distance < settingsRef.current.size / 2 + 21) touchingPlayerIds.add(zombie.id)
      })

      if (hitZombieIds.size) setScore((current) => current + hitZombieIds.size)
      if (touchingPlayerIds.size) {
        setLives((current) => {
          const next = Math.max(0, current - touchingPlayerIds.size)
          if (next === 0) setRunning(false)
          return next
        })
      }

      nextBullets = nextBullets.filter((bullet) => !hitBulletIds.has(bullet.id))
      zombiesRef.current = nextZombies.filter((zombie) => !hitZombieIds.has(zombie.id) && !touchingPlayerIds.has(zombie.id))
      bulletsRef.current = nextBullets
      setPlayer(nextPlayer)
      setZombies(zombiesRef.current)
      setBullets(nextBullets)
      animationFrame = requestAnimationFrame(updateGame)
    }

    animationFrame = requestAnimationFrame(updateGame)
    return () => cancelAnimationFrame(animationFrame)
  }, [running])

  const restart = () => {
    const startingPlayer = { x: 50, y: 78 }
    playerRef.current = startingPlayer
    zombiesRef.current = []
    bulletsRef.current = []
    magazineRef.current = 30
    reserveAmmoRef.current = 270
    reloadingRef.current = false
    window.clearTimeout(reloadTimerRef.current)
    setZombies([])
    setBullets([])
    setPlayer(startingPlayer)
    setScore(0)
    setLives(3)
    setMagazine(30)
    setReserveAmmo(270)
    setReloading(false)
    setRunning(true)
  }

  return (
    <div className="shooter-wrap">
      <div className="shooter-hud">
        <span>Score <strong>{score}</strong></span>
        <span className={reloading ? 'ammo reloading' : 'ammo'}>{reloading ? 'Reloading…' : 'Ammo'} <strong>{magazine} / {reserveAmmo}</strong></span>
        <span>Lives <strong>{'●'.repeat(lives) || '—'}</strong></span>
      </div>
      <div ref={arenaRef} className={`shooter-arena ${shooting ? 'is-shooting' : ''}`} onPointerMove={aim} onPointerDown={shoot}>
        <div className="arena-grid" />
        {zombies.map((zombie) => (
          <div
            className="zombie"
            key={zombie.id}
            style={{ left: `${zombie.x}%`, top: `${zombie.y}%`, width: `${settings.size}px`, height: `${settings.size}px` }}
          >
            <span className="zombie-eye left" />
            <span className="zombie-eye right" />
          </div>
        ))}
        {bullets.map((bullet) => (
          <span className="bullet" key={bullet.id} style={{ left: `${bullet.x}%`, top: `${bullet.y}%` }} />
        ))}
        <div className="circle-player" style={{ left: `${player.x}%`, top: `${player.y}%` }}>
          <span className="player-eye left" />
          <span className="player-eye right" />
          <span className="rifle" style={{ transform: `rotate(${rifleAngle}deg)` }}><i /></span>
        </div>
        <div className={`shooter-settings ${settingsOpen ? 'open' : ''}`} onPointerDown={(event) => event.stopPropagation()}>
          {settingsOpen && (
            <div className="settings-panel">
              <div className="settings-title"><strong>Game settings</strong><span>Live difficulty</span></div>
              <label>
                <span>Zombie speed <strong>{settings.speed.toFixed(1)}×</strong></span>
                <input type="range" min="0.5" max="2.5" step="0.1" value={settings.speed} onChange={(event) => updateSetting('speed', event.target.value)} />
              </label>
              <label>
                <span>Zombie size <strong>{settings.size}px</strong></span>
                <input type="range" min="22" max="64" step="2" value={settings.size} onChange={(event) => updateSetting('size', event.target.value)} />
              </label>
              <label>
                <span>Spawn delay <strong>{settings.spawnDelay}ms</strong></span>
                <input type="range" min="250" max="2000" step="50" value={settings.spawnDelay} onChange={(event) => updateSetting('spawnDelay', event.target.value)} />
              </label>
              <button type="button" className="settings-reset" onClick={() => {
                const defaults = { speed: 1, size: 34, spawnDelay: 850 }
                settingsRef.current = defaults
                setSettings(defaults)
              }}>Reset defaults</button>
            </div>
          )}
          <button className="settings-toggle" type="button" aria-label="Toggle game settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((open) => !open)}>{settingsOpen ? '×' : '⚙'}</button>
        </div>
        {!running && (
          <div className="game-over">
            <p>GAME OVER</p>
            <strong>{score} zombies stopped</strong>
            <button type="button" onClick={restart}>Play again</button>
          </div>
        )}
      </div>
      <p className="game-instruction"><strong>W A S D</strong> to move · <strong>R</strong> to reload · Aim and click to fire.</p>
    </div>
  )
}

function MemoryGame() {
  const [deck, setDeck] = useState(createMemoryDeck)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const flipTimerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(flipTimerRef.current), [])

  const chooseCard = (index) => {
    if (locked || flipped.includes(index) || matched.includes(deck[index].pair)) return
    const nextFlipped = [...flipped, index]
    setFlipped(nextFlipped)
    if (nextFlipped.length < 2) return

    setMoves((current) => current + 1)
    const [first, second] = nextFlipped
    if (deck[first].pair === deck[second].pair) {
      setMatched((current) => [...current, deck[first].pair])
      setFlipped([])
      return
    }

    setLocked(true)
    flipTimerRef.current = window.setTimeout(() => {
      setFlipped([])
      setLocked(false)
    }, 700)
  }

  const restart = () => {
    window.clearTimeout(flipTimerRef.current)
    setDeck(createMemoryDeck())
    setFlipped([])
    setMatched([])
    setMoves(0)
    setLocked(false)
  }

  const complete = matched.length === MEMORY_SYMBOLS.length

  return (
    <div className="memory-game">
      <div className="memory-hud">
        <span>Moves <strong>{moves}</strong></span>
        <span>Pairs <strong>{matched.length} / {MEMORY_SYMBOLS.length}</strong></span>
      </div>
      <div className="memory-board" aria-label="Memory matching card game">
        {deck.map((card, index) => {
          const revealed = flipped.includes(index) || matched.includes(card.pair)
          return (
            <button
              type="button"
              className={`memory-card ${revealed ? 'revealed' : ''} ${matched.includes(card.pair) ? 'matched' : ''}`}
              key={card.id}
              onClick={() => chooseCard(index)}
              aria-label={revealed ? card.symbol : 'Hidden card'}
            >
              <span>{card.symbol}</span>
            </button>
          )
        })}
        {complete && (
          <div className="memory-complete">
            <small>ALL PAIRS FOUND</small>
            <strong>Completed in {moves} moves</strong>
            <button type="button" onClick={restart}>Play again</button>
          </div>
        )}
      </div>
      <p className="game-instruction">Turn over two cards and find all six matching pairs.</p>
    </div>
  )
}

function ReactionGame() {
  const [status, setStatus] = useState('idle')
  const [startedAt, setStartedAt] = useState(0)
  const [result, setResult] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const start = () => {
    setResult(null)
    setStatus('waiting')
    timerRef.current = window.setTimeout(() => {
      setStartedAt(performance.now())
      setStatus('ready')
    }, 1200 + Math.random() * 2600)
  }

  const react = () => {
    if (status === 'waiting') {
      window.clearTimeout(timerRef.current)
      setStatus('early')
      return
    }
    if (status === 'ready') {
      setResult(Math.round(performance.now() - startedAt))
      setStatus('done')
    }
  }

  return (
    <div className={`reaction-game ${status}`}>
      <button type="button" onClick={status === 'idle' || status === 'done' || status === 'early' ? start : react}>
        {status === 'idle' && 'Start test'}
        {status === 'waiting' && 'Wait for red…'}
        {status === 'ready' && 'CLICK!'}
        {status === 'early' && 'Too early — try again'}
        {status === 'done' && `${result} ms — try again`}
      </button>
      <p>Press start, wait for the panel to turn red, then click as quickly as possible.</p>
    </div>
  )
}

export default function MiniGames({ activeGame, onClose }) {
  useEffect(() => {
    if (!activeGame) return undefined
    const closeWithEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeWithEscape)
    return () => window.removeEventListener('keydown', closeWithEscape)
  }, [activeGame, onClose])

  if (!activeGame) return null

  return (
    <div className="game-modal-backdrop" role="presentation" onPointerDown={onClose}>
      <section className="game-modal" role="dialog" aria-modal="true" aria-label={gameNames[activeGame]} onPointerDown={(event) => event.stopPropagation()}>
        <header>
          <div><small>MINI GAME</small><h3>{gameNames[activeGame]}</h3></div>
          <button type="button" onClick={onClose} aria-label="Close game">×</button>
        </header>
        <div className="game-modal-content">
          {activeGame === 'zombie' && <ZombieGame />}
          {activeGame === 'memory' && <MemoryGame />}
          {activeGame === 'reaction' && <ReactionGame />}
        </div>
      </section>
    </div>
  )
}
