import './style.css'
import { LAND } from './land-data.js'

const W = 1000, H = 500

function project(lon, lat) {
  return [(lon + 180) / 360 * W, (90 - lat) / 180 * H]
}
// LAND pieces are already projected (x,y in the 1000x500 viewBox) at build time from
// real-world coastline data. Pieces that were cut at the antimeridian (c:false) are left
// open so no stray edge is drawn connecting the far east and west sides of the map.
function landPath(piece) {
  const [first, ...rest] = piece.p
  let d = 'M' + first[0] + ',' + first[1]
  for (const [x, y] of rest) d += 'L' + x + ',' + y
  if (piece.c) d += 'Z'
  return d
}

const COMPANIES = {
  spacex: { label: 'SpaceX', color: 'var(--spacex)' },
  tesla: { label: 'Tesla', color: 'var(--tesla)' },
  boring: { label: 'The Boring Company', color: 'var(--boring)' },
  neuralink: { label: 'Neuralink', color: 'var(--neuralink)' },
  xai: { label: 'xAI', color: 'var(--xai)' },
}

// status: owned | leased | rights | paused
const SITES = [
  { id: 'starbase', name: 'Starbase (Boca Chica)', company: 'spacex', lon: -97.16, lat: 25.997, status: 'owned', loc: 'Cameron County, Texas, USA', acres: 1700, size: '~1,700+ acres', note: 'Starship factory and orbital launch site; assembled from ranchland since 2014. Incorporated as its own city in 2024, with Musk-aligned officials elected to run it.' },
  { id: 'mcgregor', name: 'McGregor Test Facility', company: 'spacex', lon: -97.406, lat: 31.486, status: 'owned', loc: 'McGregor, Texas, USA', acres: 4700, size: '~4,700 acres', note: "Rocket engine test stands for Merlin, Raptor, and Falcon/Starship qualification firings. SpaceX's largest single land parcel by area." },
  { id: 'hawthorne', name: 'SpaceX HQ &amp; Starlink Plant', company: 'spacex', lon: -118.3278, lat: 33.9207, status: 'leased', loc: 'Hawthorne, California, USA', acres: null, size: 'leased campus', note: 'Corporate headquarters and Falcon/Dragon/Starlink production, in a former Northrop plant SpaceX leases rather than owns.' },
  { id: 'cape', name: 'Cape Canaveral / Kennedy Space Center', company: 'spacex', lon: -80.59, lat: 28.585, status: 'leased', loc: 'Merritt Island / Cape Canaveral, Florida, USA', acres: null, size: 'leased pads (LC-39A &amp; SLC-40)', note: 'Launch pads leased from NASA and the U.S. Space Force for Falcon 9, Falcon Heavy, and future Starship flights. The land remains federal property.' },
  { id: 'vandenberg', name: 'Vandenberg Space Force Base', company: 'spacex', lon: -120.5724, lat: 34.742, status: 'leased', loc: 'Santa Barbara County, California, USA', acres: null, size: 'leased pad (SLC-4E)', note: 'West Coast polar-orbit launch site, leased from the U.S. Space Force.' },
  { id: 'gigatexas', name: 'Gigafactory Texas', company: 'tesla', lon: -97.6193, lat: 30.2226, status: 'owned', loc: 'Travis County, Austin, Texas, USA', acres: 2000, size: '~2,000 acres', note: 'Cybertruck and Model Y plant on the Colorado River; Tesla moved its corporate HQ here in 2021, branding it &ldquo;Cyber HQ.&rdquo;' },
  { id: 'giganevada', name: 'Gigafactory Nevada', company: 'tesla', lon: -119.4432, lat: 39.538, status: 'owned', loc: 'Storey County, Nevada, USA', acres: 1000, size: '~1,000 acres', note: "Battery and Semi-truck plant inside the Tahoe-Reno Industrial Center; Tesla owns its parcel outright within the larger park." },
  { id: 'fremont', name: 'Fremont Factory', company: 'tesla', lon: -121.946, lat: 37.4924, status: 'owned', loc: 'Fremont, California, USA', acres: 370, size: '~370 acres', note: "Tesla's original U.S. assembly plant, bought from the NUMMI Toyota-GM joint venture in 2010." },
  { id: 'gigaberlin', name: 'Gigafactory Berlin-Brandenburg', company: 'tesla', lon: 13.7969, lat: 52.3888, status: 'owned', loc: 'Gr&uuml;nheide, Brandenburg, Germany', acres: 740, size: '~300 hectares (~740 acres)', note: "Tesla's first European plant, cleared from forest land it purchased outright &mdash; a process that drew years of local environmental litigation." },
  { id: 'gigashanghai', name: 'Gigafactory Shanghai', company: 'tesla', lon: 121.5426, lat: 30.8983, status: 'rights', loc: 'Pudong, Shanghai, China', acres: 520, size: '~210 hectares (~520 acres)', note: 'Held under a 50-year land-use grant from the Chinese state, the standard structure for foreign manufacturing investment &mdash; not fee-simple ownership.' },
  { id: 'gigany', name: 'Gigafactory New York', company: 'tesla', lon: -78.8265, lat: 42.9587, status: 'leased', loc: 'Buffalo, New York, USA', acres: 88, size: '~88 acres, leased at $1/yr', note: 'Solar and Dojo/Supercharger production in a plant built by New York State and leased to Tesla for $1 a year under the Buffalo Billion program.' },
  { id: 'gigamexico', name: 'Gigafactory Mexico', company: 'tesla', lon: -100.46, lat: 25.6866, status: 'paused', loc: 'Santa Catarina, Nuevo Le&oacute;n, Mexico', acres: 2500, size: '~2,500 acres (land banked)', note: 'Land acquired in 2023 for a planned plant; construction has been indefinitely paused since 2024 amid tariff and demand uncertainty.' },
  { id: 'bastrop', name: 'Bastrop County Complex', company: 'boring', lon: -97.287, lat: 30.11, status: 'owned', loc: 'Bastrop County, Texas, USA', acres: null, size: 'multiple parcels, undisclosed total', note: 'The Boring Company\'s tunnel-segment plant, assembled from ranchland since 2021. Also anchors an informal employee community nearby, reported in local press as &ldquo;Snailbrook.&rdquo;' },
  { id: 'neuralink', name: 'Neuralink HQ (Building 9)', company: 'neuralink', lon: -97.6511, lat: 30.1988, status: 'owned', loc: 'Del Valle, Texas, USA', acres: null, size: 'lab &amp; surgical-robot facility', note: 'Neuralink relocated its headquarters from Fremont, California to this Austin-area site in 2024.' },
  { id: 'xaimemphis', name: 'xAI &ldquo;Colossus&rdquo; Data Center', company: 'xai', lon: -90.049, lat: 35.0458, status: 'owned', loc: 'Memphis, Tennessee, USA', acres: null, size: 'former Electrolux factory, ~735,000 sq ft', note: 'A shuttered appliance factory bought and rebuilt as a supercomputing cluster in 2024; xAI has since acquired an adjacent former battery plant to expand it.' },
]

const STATUS_LABEL = { owned: 'Owned', leased: 'Leased', rights: 'Land-use rights', paused: 'Owned &middot; paused' }

const state = { companies: {}, statusFilter: 'all', activeId: null }
Object.keys(COMPANIES).forEach((c) => { state.companies[c] = true })

// ---------- stats ----------
const totalAcres = SITES.reduce((s, d) => s + (d.acres || 0), 0)
const countries = {}
SITES.forEach((d) => { countries[d.loc.split(', ').pop()] = 1 })
const statsEl = document.getElementById('stats')
;[
  { n: SITES.length, l: 'Sites mapped' },
  { n: '~' + totalAcres.toLocaleString(), l: 'Acres, known sites' },
  { n: Object.keys(COMPANIES).length, l: 'Companies' },
  { n: Object.keys(countries).length, l: 'Countries' },
].forEach((s) => {
  const d = document.createElement('div')
  d.className = 'stat'
  d.innerHTML = `<div class="n">${s.n}</div><div class="l">${s.l}</div>`
  statsEl.appendChild(d)
})

// ---------- controls ----------
const controls = document.getElementById('controls')
Object.keys(COMPANIES).forEach((key) => {
  const co = COMPANIES[key]
  const chip = document.createElement('div')
  chip.className = 'chip'
  chip.dataset.company = key
  chip.innerHTML = `<span class="dot" style="background:${co.color}"></span>${co.label} <span style="color:var(--muted-2)">${SITES.filter((s) => s.company === key).length}</span>`
  chip.addEventListener('click', () => {
    state.companies[key] = !state.companies[key]
    chip.classList.toggle('off', !state.companies[key])
    render()
  })
  controls.appendChild(chip)
})
const resetChip = document.createElement('div')
resetChip.className = 'chip reset'
resetChip.textContent = 'Reset filters'
resetChip.addEventListener('click', () => {
  Object.keys(state.companies).forEach((k) => { state.companies[k] = true })
  state.statusFilter = 'all'
  document.querySelectorAll('.chip[data-company]').forEach((c) => c.classList.remove('off'))
  document.querySelectorAll('.status-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.status === 'all'))
  render()
})
controls.appendChild(resetChip)

const spacer = document.createElement('div')
spacer.className = 'spacer'
controls.appendChild(spacer)

const statusWrap = document.createElement('div')
statusWrap.className = 'status-toggle'
;[['all', 'All'], ['owned', 'Owned only']].forEach((pair) => {
  const btn = document.createElement('button')
  btn.textContent = pair[1]
  btn.dataset.status = pair[0]
  if (pair[0] === 'all') btn.classList.add('active')
  btn.addEventListener('click', () => {
    state.statusFilter = pair[0]
    statusWrap.querySelectorAll('button').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    render()
  })
  statusWrap.appendChild(btn)
})
controls.appendChild(statusWrap)

// ---------- map: continents + graticule ----------
const svg = document.getElementById('map')
const svgns = 'http://www.w3.org/2000/svg'

const gGrid = document.createElementNS(svgns, 'g')
for (let lon = -180; lon <= 180; lon += 30) {
  const a = project(lon, 90), b = project(lon, -90)
  const line = document.createElementNS(svgns, 'line')
  line.setAttribute('x1', a[0]); line.setAttribute('y1', a[1])
  line.setAttribute('x2', b[0]); line.setAttribute('y2', b[1])
  line.setAttribute('stroke', 'var(--ocean-grid)')
  line.setAttribute('stroke-width', lon === 0 ? '1' : '0.5')
  gGrid.appendChild(line)
}
for (let lat = -60; lat <= 60; lat += 30) {
  const c = project(-180, lat), d2 = project(180, lat)
  const line2 = document.createElementNS(svgns, 'line')
  line2.setAttribute('x1', c[0]); line2.setAttribute('y1', c[1])
  line2.setAttribute('x2', d2[0]); line2.setAttribute('y2', d2[1])
  line2.setAttribute('stroke', 'var(--ocean-grid)')
  line2.setAttribute('stroke-width', lat === 0 ? '1' : '0.5')
  gGrid.appendChild(line2)
}
svg.appendChild(gGrid)

const gLand = document.createElementNS(svgns, 'g')
LAND.forEach((piece) => {
  const p = document.createElementNS(svgns, 'path')
  p.setAttribute('d', landPath(piece))
  p.setAttribute('fill', 'var(--land-fill)')
  p.setAttribute('stroke', 'var(--line-strong)')
  p.setAttribute('stroke-width', '0.6')
  p.setAttribute('stroke-linejoin', 'round')
  p.setAttribute('stroke-linecap', 'round')
  gLand.appendChild(p)
})
svg.appendChild(gLand)

const frame = document.createElementNS(svgns, 'rect')
frame.setAttribute('x', 0.5); frame.setAttribute('y', 0.5)
frame.setAttribute('width', W - 1); frame.setAttribute('height', H - 1)
frame.setAttribute('fill', 'none')
frame.setAttribute('stroke', 'var(--line)')
svg.appendChild(frame)

const gPins = document.createElementNS(svgns, 'g')
svg.appendChild(gPins)

const tooltip = document.getElementById('tooltip')
const sitePopup = document.getElementById('sitePopup')
const mapWrap = document.querySelector('.map-wrap')
const POPUP_W = 280

function pinVisible(d) {
  if (!state.companies[d.company]) return false
  if (state.statusFilter === 'owned' && !(d.status === 'owned' || d.status === 'paused')) return false
  return true
}

const pinEls = {}
SITES.forEach((d) => {
  const xy = project(d.lon, d.lat)
  const g = document.createElementNS(svgns, 'g')
  g.setAttribute('class', 'pin')
  g.dataset.id = d.id
  g.setAttribute('transform', `translate(${xy[0].toFixed(1)},${xy[1].toFixed(1)})`)

  const halo = document.createElementNS(svgns, 'circle')
  halo.setAttribute('class', 'halo')
  halo.setAttribute('r', 11)
  halo.setAttribute('fill', COMPANIES[d.company].color)
  g.appendChild(halo)

  const core = document.createElementNS(svgns, 'circle')
  core.setAttribute('class', 'pin-core')
  core.setAttribute('r', 5)
  core.setAttribute('style', 'transform-origin: 0px 0px;')
  if (d.status === 'owned') {
    core.setAttribute('fill', COMPANIES[d.company].color)
    core.setAttribute('stroke', 'var(--bg)')
    core.setAttribute('stroke-width', '1.2')
  } else if (d.status === 'leased') {
    core.setAttribute('fill', 'var(--bg)')
    core.setAttribute('stroke', COMPANIES[d.company].color)
    core.setAttribute('stroke-width', '2')
  } else {
    core.setAttribute('fill', COMPANIES[d.company].color)
    core.setAttribute('fill-opacity', '0.35')
    core.setAttribute('stroke', COMPANIES[d.company].color)
    core.setAttribute('stroke-width', '1.5')
    core.setAttribute('stroke-dasharray', '3 2.4')
  }
  g.appendChild(core)

  g.addEventListener('mouseenter', () => showTooltip(d, g))
  g.addEventListener('mouseleave', () => tooltip.classList.remove('show'))

  gPins.appendChild(g)
  pinEls[d.id] = g
})

function showTooltip(d, g) {
  const rect = g.getBoundingClientRect()
  const wrapRect = mapWrap.getBoundingClientRect()
  tooltip.innerHTML = `${d.name}<span class="co">${COMPANIES[d.company].label}</span>`
  tooltip.style.left = (rect.left - wrapRect.left + rect.width / 2) + 'px'
  tooltip.style.top = (rect.top - wrapRect.top) + 'px'
  tooltip.classList.add('show')
}

// Click-to-open info card, anchored to the pin. Separate from the hover tooltip
// (which only ever shows the name) so the full status/location/footprint/note is
// reachable without scrolling to the sidebar -- important on mobile, where the
// manifest sits below the map instead of beside it.
function showSitePopup(d) {
  const g = pinEls[d.id]
  const pinRect = g.getBoundingClientRect()
  const wrapRect = mapWrap.getBoundingClientRect()
  const co = COMPANIES[d.company]

  sitePopup.innerHTML =
    `<div class="popup-head"><div class="popup-title">${d.name}</div>` +
      `<button type="button" class="popup-close" aria-label="Close">&times;</button></div>` +
    `<div class="popup-co"><span class="dot" style="background:${co.color}"></span>${co.label}<span class="popup-badge">${STATUS_LABEL[d.status]}</span></div>` +
    `<div class="popup-loc">${d.loc}</div>` +
    `<div class="popup-row"><span class="k">Footprint</span><span class="v">${d.size}</span></div>` +
    `<div class="popup-note">${d.note}</div>`

  const centerX = pinRect.left - wrapRect.left + pinRect.width / 2
  const pinTop = pinRect.top - wrapRect.top
  const left = Math.min(Math.max(centerX - POPUP_W / 2, 8), wrapRect.width - POPUP_W - 8)
  sitePopup.style.left = left + 'px'

  const popupH = sitePopup.offsetHeight || 160
  sitePopup.style.top = pinTop > popupH + 24
    ? (pinTop - popupH - 14) + 'px'
    : (pinTop + 18) + 'px'

  sitePopup.classList.add('show')
}

function hideSitePopup() {
  sitePopup.classList.remove('show')
}

sitePopup.addEventListener('click', (e) => {
  if (e.target.closest('.popup-close') && state.activeId) selectSite(state.activeId)
})

// ---------- zoom & pan ----------
// The whole map lives in one 1000x500 coordinate space, so "zooming" just means
// shrinking the SVG viewBox (and re-centering it) rather than transforming a nested group.
const view = { x: 0, y: 0, w: W, h: H }
const VIEW_MIN_W = 55 // ~18x magnification, enough to isolate the Texas cluster
const VIEW_MAX_W = W  // fully zoomed out (the default)

const zoomInBtn = document.getElementById('zoomIn')
const zoomOutBtn = document.getElementById('zoomOut')
const zoomResetBtn = document.getElementById('zoomReset')
const capZoom = document.getElementById('capZoom')

function clampPan() {
  view.x = Math.min(Math.max(view.x, 0), W - view.w)
  view.y = Math.min(Math.max(view.y, 0), H - view.h)
}

function applyView() {
  svg.setAttribute('viewBox', `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`)
  tooltip.classList.remove('show')
  sitePopup.classList.remove('show')
  const zoomLevel = W / view.w
  capZoom.textContent = zoomLevel.toFixed(1) + '×'
  zoomOutBtn.disabled = view.w >= VIEW_MAX_W
  zoomInBtn.disabled = view.w <= VIEW_MIN_W
}

function clientToSvg(clientX, clientY) {
  const rect = svg.getBoundingClientRect()
  const relX = (clientX - rect.left) / rect.width
  const relY = (clientY - rect.top) / rect.height
  return [view.x + relX * view.w, view.y + relY * view.h]
}

// Discrete zoom actions (wheel, buttons, double-click) glide to their target instead of
// snapping, so repeated scrolling reads as one continuous motion rather than a jolt per tick.
// Drag and pinch stay direct (no easing) since they're already 1:1 with the pointer.
const ANIM_MS = 240
let rafId = null
let animFrom = null
let animTo = null
let animStart = 0
const easeOutCubic = (t) => 1 - (1 - t) ** 3

function liveView() {
  if (!animTo) return { x: view.x, y: view.y, w: view.w, h: view.h }
  const t = Math.min(1, (performance.now() - animStart) / ANIM_MS)
  const e = easeOutCubic(t)
  return {
    x: animFrom.x + (animTo.x - animFrom.x) * e,
    y: animFrom.y + (animTo.y - animFrom.y) * e,
    w: animFrom.w + (animTo.w - animFrom.w) * e,
    h: animFrom.h + (animTo.h - animFrom.h) * e,
  }
}

function stopAnim() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  animTo = null
}

function animStep(now) {
  const t = Math.min(1, (now - animStart) / ANIM_MS)
  const e = easeOutCubic(t)
  view.x = animFrom.x + (animTo.x - animFrom.x) * e
  view.y = animFrom.y + (animTo.y - animFrom.y) * e
  view.w = animFrom.w + (animTo.w - animFrom.w) * e
  view.h = animFrom.h + (animTo.h - animFrom.h) * e
  applyView()
  if (t < 1) {
    rafId = requestAnimationFrame(animStep)
  } else {
    rafId = null
    animTo = null
  }
}

function animateTo(target) {
  animFrom = liveView()
  animTo = target
  animStart = performance.now()
  if (!rafId) rafId = requestAnimationFrame(animStep)
}

function zoomTarget(base, px, py, factor) {
  const newW = Math.min(VIEW_MAX_W, Math.max(VIEW_MIN_W, base.w * factor))
  const actualFactor = newW / base.w
  const w = newW, h = newW / 2
  const x = Math.min(Math.max(px - (px - base.x) * actualFactor, 0), W - w)
  const y = Math.min(Math.max(py - (py - base.y) * actualFactor, 0), H - h)
  return { x, y, w, h }
}

// Eased zoom: for one-shot actions (buttons, double-click, reset) where there's no
// follow-up event to chase, so a short glide reads as intentional rather than instant.
function zoomAt(px, py, factor) {
  animateTo(zoomTarget(liveView(), px, py, factor))
}

// Direct zoom: for wheel/trackpad input, which arrives as a rapid stream of events during
// a scroll or pinch gesture. Easing each one would make the view perpetually chase a moving
// target and never catch up to your fingers -- so this applies instantly, same as drag/pinch.
function zoomAtDirect(px, py, factor) {
  stopAnim()
  const target = zoomTarget(view, px, py, factor)
  view.x = target.x; view.y = target.y; view.w = target.w; view.h = target.h
  applyView()
}

svg.addEventListener('wheel', (e) => {
  e.preventDefault()
  const [px, py] = clientToSvg(e.clientX, e.clientY)
  // Trackpad pinch reports as a wheel event with ctrlKey set (the browser's standard signal
  // for that gesture) and much finer-grained deltas than a mouse wheel notch or a two-finger
  // scroll, so it needs its own, stronger multiplier to feel equally responsive.
  const sensitivity = e.ctrlKey ? 0.02 : 0.0055
  const factor = Math.exp(e.deltaY * sensitivity)
  zoomAtDirect(px, py, factor)
}, { passive: false })

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.activeId) selectSite(state.activeId)
})

svg.addEventListener('dblclick', (e) => {
  // e.target can't be trusted here: svg.setPointerCapture() (below) retargets the
  // synthesized click/dblclick events to the svg itself for the whole gesture, so we
  // do a real hit-test at the cursor position instead.
  const real = document.elementFromPoint(e.clientX, e.clientY)
  if (real && real.closest && real.closest('.pin')) return
  e.preventDefault()
  const [px, py] = clientToSvg(e.clientX, e.clientY)
  zoomAt(px, py, 1 / 2.2)
})

zoomInBtn.addEventListener('click', () => zoomAt(view.x + view.w / 2, view.y + view.h / 2, 1 / 1.8))
zoomOutBtn.addEventListener('click', () => zoomAt(view.x + view.w / 2, view.y + view.h / 2, 1.8))
zoomResetBtn.addEventListener('click', () => animateTo({ x: 0, y: 0, w: W, h: H }))

// Pointer Events unify mouse, touch and pen: one active pointer pans, two pinch-zoom.
const activePointers = new Map()
let dragStart = null
let dragOrigin = null
let dragMoved = false
let pinch = null
// svg.setPointerCapture() below (needed so drag/pinch keep tracking outside the
// element's bounds) also retargets the eventual pointerup/click to the svg itself,
// so real hit-testing for "which pin, if any, did this gesture start on" has to
// happen here at pointerdown, before capture takes effect -- see endPointer().
let pointerDownPinId = null

svg.addEventListener('pointerdown', (e) => {
  stopAnim()
  svg.setPointerCapture(e.pointerId)
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (activePointers.size === 1) {
    dragStart = [e.clientX, e.clientY]
    dragOrigin = [view.x, view.y]
    dragMoved = false
    const pinG = e.target.closest && e.target.closest('.pin')
    pointerDownPinId = pinG ? pinG.dataset.id : null
  } else if (activePointers.size === 2) {
    const pts = [...activePointers.values()]
    pinch = {
      dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
      view: { ...view },
      center: clientToSvg((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2),
    }
  }
})

svg.addEventListener('pointermove', (e) => {
  if (!activePointers.has(e.pointerId)) return
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.size === 2 && pinch) {
    const pts = [...activePointers.values()]
    const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    if (newDist < 1) return
    const factor = pinch.dist / newDist
    const newW = Math.min(VIEW_MAX_W, Math.max(VIEW_MIN_W, pinch.view.w * factor))
    const scaleRatio = newW / pinch.view.w
    view.w = newW
    view.h = newW / 2
    view.x = pinch.center[0] - (pinch.center[0] - pinch.view.x) * scaleRatio
    view.y = pinch.center[1] - (pinch.center[1] - pinch.view.y) * scaleRatio
    clampPan()
    applyView()
  } else if (activePointers.size === 1 && dragStart) {
    const dx = e.clientX - dragStart[0]
    const dy = e.clientY - dragStart[1]
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true
    if (!dragMoved) return
    const rect = svg.getBoundingClientRect()
    view.x = dragOrigin[0] - dx * (view.w / rect.width)
    view.y = dragOrigin[1] - dy * (view.h / rect.height)
    clampPan()
    applyView()
    svg.classList.add('panning')
  }
})

function endPointer(e) {
  activePointers.delete(e.pointerId)
  if (activePointers.size < 2) pinch = null
  if (activePointers.size === 0) {
    if (!dragMoved) {
      if (pointerDownPinId) selectSite(pointerDownPinId)
      else if (state.activeId) selectSite(state.activeId)
    }
    dragStart = null
    pointerDownPinId = null
    svg.classList.remove('panning')
  }
}
svg.addEventListener('pointerup', endPointer)
svg.addEventListener('pointercancel', endPointer)

applyView()

// ---------- manifest ----------
const manifestList = document.getElementById('manifestList')
const manifestCount = document.getElementById('manifestCount')
const capFiltered = document.getElementById('capFiltered')
let rowEls = {}

function buildManifest() {
  manifestList.innerHTML = ''
  rowEls = {}
  Object.keys(COMPANIES).forEach((key) => {
    const sites = SITES.filter((s) => s.company === key)
    if (!sites.length) return
    const group = document.createElement('div')
    group.className = 'co-group'
    group.dataset.company = key

    const head = document.createElement('div')
    head.className = 'co-group-head'
    head.innerHTML = `<span class="dot" style="background:${COMPANIES[key].color}"></span>${COMPANIES[key].label}<span class="count">${sites.length}</span>`
    group.appendChild(head)

    sites.forEach((d) => {
      const row = document.createElement('div')
      row.className = 'site-row'
      row.dataset.id = d.id
      row.innerHTML =
        `<div class="top"><span class="name">${d.name}</span><span class="badge">${STATUS_LABEL[d.status]}</span></div>` +
        `<div class="loc">${d.loc}</div>` +
        `<div class="site-detail">` +
          `<div class="row"><span class="k">Footprint</span><span class="v">${d.size}</span></div>` +
          `<div class="note">${d.note}</div>` +
        `</div>`
      row.addEventListener('click', () => selectSite(d.id, true))
      group.appendChild(row)
      rowEls[d.id] = row
    })
    manifestList.appendChild(group)
  })
}
buildManifest()

function selectSite(id, fromList) {
  state.activeId = state.activeId === id ? null : id
  Object.keys(pinEls).forEach((k) => pinEls[k].classList.toggle('selected', k === state.activeId))
  Object.keys(rowEls).forEach((k) => rowEls[k].classList.toggle('active', k === state.activeId))
  if (state.activeId) {
    showSitePopup(SITES.find((s) => s.id === state.activeId))
    if (rowEls[state.activeId] && !fromList) {
      rowEls[state.activeId].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  } else {
    hideSitePopup()
  }
}

function render() {
  let visibleCount = 0
  SITES.forEach((d) => {
    const v = pinVisible(d)
    pinEls[d.id].style.display = v ? '' : 'none'
    if (rowEls[d.id]) {
      rowEls[d.id].parentElement.style.display = state.companies[d.company] ? '' : 'none'
      rowEls[d.id].style.display = v ? '' : 'none'
    }
    if (v) visibleCount++
  })
  manifestCount.textContent = `${visibleCount} / ${SITES.length}`
  capFiltered.textContent = visibleCount
}
render()
