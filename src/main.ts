import './styles.css';

type Stage = 1 | 2 | 3 | 4 | 5;

const stageMeta: Record<Stage, { kicker: string; title: string; body: string }> = {
  1: { kicker: 'LEVEL 01 · FIND YOUR ORBIT', title: 'A little universe, made for Hina.', body: 'Five small rituals. One very loved birthday. Take the scenic route.' },
  2: { kicker: 'LEVEL 02 · CONSTELLATION', title: 'Tap the stars I kept for you.', body: 'Three tiny truths are hiding in the night. Collect them all.' },
  3: { kicker: 'LEVEL 03 · THE WISH RIBBON', title: 'Pull a little closer to your wish.', body: 'Drag the glowing thread across the stage and unwrap what is waiting.' },
  4: { kicker: 'LEVEL 04 · CAKE ATELIER', title: 'One clean slice for the birthday girl.', body: 'Trace the cake, then watch the sweetest little celebration begin.' },
  5: { kicker: 'LEVEL 05 · CANDLELIGHT', title: 'Make a wish. Then come a little closer.', body: 'The last surprise is waiting in the glow.' },
};

const state = {
  started: false,
  stage: 1 as Stage,
  notesFound: 0,
  ribbonProgress: 0,
  cakeCut: false,
  candlesOut: false,
  ringPlaced: false,
  motionArmed: false,
  sensorMessage: 'Motion mode is ready when you are.',
};

let app: HTMLElement;
let motionBaseline: { beta: number; gamma: number } | null = null;
let sensorCleanup: (() => void) | null = null;

const starNotes = [
  { label: 'THE FIRST THING', text: 'You make ordinary days feel like they have secret lighting.' },
  { label: 'A VERY TRUE FACT', text: 'Your laugh has the rare talent of making a room feel safe.' },
  { label: 'KEEP THIS ONE', text: 'There is so much more magic ahead of you than behind you.' },
];

function sparkleField(count = 34): string {
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 37 + 11) % 97;
    const top = (i * 61 + 7) % 94;
    const delay = (i % 8) * 0.55;
    const size = 2 + (i % 3);
    return `<span class="spark" style="--left:${left}%;--top:${top}%;--delay:${delay}s;--size:${size}px"></span>`;
  }).join('');
}

function render(): void {
  app.innerHTML = `
    <main class="app-shell ${state.stage === 5 && state.candlesOut ? 'is-finale' : ''}">
      <div class="ambient ambient-one"></div>
      <div class="ambient ambient-two"></div>
      <div class="grain"></div>
      <div class="spark-field" aria-hidden="true">${sparkleField()}</div>
      <header class="topbar">
        <button class="brand" data-action="home" aria-label="Return to the beginning">
          <span class="brand-mark"><span></span><i></i></span>
          <span class="brand-lockup"><strong>HINA GLOW</strong><small>a private birthday orbit</small></span>
        </button>
        <div class="progress-wrap" aria-label="Birthday journey progress">
          <span class="progress-label">${state.started ? `0${state.stage} / 05` : 'A LITTLE JOURNEY'}</span>
          <div class="progress-line"><span style="width:${state.started ? ((state.stage - 1) / 4) * 100 : 0}%"></span></div>
          <span class="progress-note">made with extra love</span>
        </div>
        <button class="sound-button" data-action="sound" aria-label="Toggle ambience"><span class="sound-bars"><i></i><i></i><i></i></span><span>soft mode</span></button>
      </header>
      ${!state.started ? renderWelcome() : renderStage()}
      <footer class="footer-note"><span>for Hina, always</span><span>five tiny moments · one bright birthday</span></footer>
    </main>
  `;
  bindEvents();
}

function renderWelcome(): string {
  return `
    <section class="welcome-stage">
      <div class="welcome-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span> OCTOBER 06 · A SPECIAL DELIVERY</p>
        <h1>A few beautiful<br /><em>things</em> I wanted<br />you to <em>feel.</em></h1>
        <p class="welcome-body">Hi Hina. I folded your birthday into five little moments — one for every time you make the world feel softer.</p>
        <button class="primary-cta" data-action="start"><span>Begin the birthday orbit</span><b>↗</b></button>
        <div class="micro-proof"><span class="mini-orbit"></span><span>no rush · just tap your way through</span></div>
      </div>
      <div class="hero-art" aria-label="An illustrated birthday planet with a pink ribbon">
        <div class="hero-orbit orbit-a"></div><div class="hero-orbit orbit-b"></div>
        <div class="planet"><div class="planet-shine"></div><span class="planet-ring"></span><span class="planet-spark">✦</span></div>
        <div class="hero-ribbon ribbon-left"></div><div class="hero-ribbon ribbon-right"></div>
        <div class="hero-card"><span>ps. there is<br /><em>confetti ahead</em></span><span class="card-arrow">↗</span></div>
        <div class="hero-sticker">for<br /><strong>HINA</strong></div>
      </div>
      <div class="welcome-scroll"><span>01</span><i></i><span>tap to open</span><b>⌄</b></div>
    </section>
  `;
}

function renderStage(): string {
  if (state.stage === 5 && state.candlesOut) return renderFinale();
  const meta = stageMeta[state.stage];
  return `
    <section class="journey-stage stage-${state.stage}">
      <aside class="journey-rail">
        <span class="rail-title">THE JOURNEY</span>
        ${([1, 2, 3, 4, 5] as Stage[]).map((level) => `<button class="rail-dot ${level === state.stage ? 'active' : ''} ${level < state.stage ? 'done' : ''}" data-action="jump" data-stage="${level}" aria-label="Go to level ${level}" ${level > state.stage ? 'disabled' : ''}><i>${level < state.stage ? '✓' : `0${level}`}</i><span>${['Your orbit', 'Constellation', 'Wish ribbon', 'Cake atelier', 'Candlelight'][level - 1]}</span></button>`).join('')}
      </aside>
      <div class="chapter-content">
        <div class="chapter-heading">
          <p class="eyebrow"><span class="eyebrow-line"></span>${meta.kicker}</p>
          <h2>${meta.title}</h2>
          <p>${meta.body}</p>
        </div>
        ${renderInteractiveStage()}
      </div>
    </section>
  `;
}

function renderInteractiveStage(): string {
  if (state.stage === 1) {
    return `
      <div class="orbit-panel interactive-panel">
        <div class="orbit-copy"><span class="panel-index">01</span><h3>Start with<br /><em>something good.</em></h3><p>There is nothing to solve here. Just press the little pulse and let the first light in.</p><button class="ghost-cta" data-action="next">Open the first glow <span>↗</span></button></div>
        <div class="orbit-visual"><div class="big-orbit orbit-one"></div><div class="big-orbit orbit-two"></div><div class="big-orbit orbit-three"></div><div class="orbit-heart">✦</div><span class="orbit-caption">HINA'S<br />BRIGHT SIDE</span></div>
      </div>`;
  }
  if (state.stage === 2) {
    return `
      <div class="constellation-panel interactive-panel">
        <div class="night-sky"><span class="constellation-line line-one"></span><span class="constellation-line line-two"></span><button class="constellation-star star-one ${state.notesFound > 0 ? 'found' : ''}" data-action="note" data-note="0" aria-label="Find first star"><i>✦</i></button><button class="constellation-star star-two ${state.notesFound > 1 ? 'found' : ''}" data-action="note" data-note="1" aria-label="Find second star"><i>✦</i></button><button class="constellation-star star-three ${state.notesFound > 2 ? 'found' : ''}" data-action="note" data-note="2" aria-label="Find third star"><i>✦</i></button><span class="sky-label">tap the lights<br />that feel like you</span></div>
        <div class="notes-drawer"><span class="panel-index">02 / 05</span><h3>Three things<br /><em>worth keeping.</em></h3><div class="note-stack">${starNotes.map((note, i) => `<article class="note-card ${state.notesFound > i ? 'revealed' : ''}"><span>0${i + 1}</span><div><small>${note.label}</small><p>${state.notesFound > i ? note.text : 'a secret is waiting in the constellation'}</p></div></article>`).join('')}</div><button class="ghost-cta ${state.notesFound === 3 ? '' : 'is-muted'}" data-action="next" ${state.notesFound < 3 ? 'disabled' : ''}>Carry the light forward <span>↗</span></button></div>
      </div>`;
  }
  if (state.stage === 3) {
    return `
      <div class="ribbon-panel interactive-panel">
        <div class="ribbon-stage"><div class="ribbon-message ${state.ribbonProgress >= 100 ? 'revealed' : ''}"><span class="panel-index">A NOTE FROM THE OTHER SIDE</span><h3>${state.ribbonProgress >= 100 ? 'You are allowed to want a lot of beautiful things.' : 'A wish is just a future<br />asking to be held.'}</h3><p>${state.ribbonProgress >= 100 ? 'And Hina, you deserve the whole, glittering version.' : 'Pull the ribbon across. There is a little more under the fold.'}</p></div><div class="ribbon-path"><span class="ribbon-track"></span><button class="ribbon-handle" data-action="ribbon" style="left:${Math.min(state.ribbonProgress, 100)}%" aria-label="Drag the wish ribbon"><span>✦</span></button></div><span class="ribbon-hint">${state.ribbonProgress >= 100 ? 'unwrapped with love' : 'drag me →'}</span></div>
        <div class="ribbon-side"><span class="panel-index">03 / 05</span><h3>Keep a little<br /><em>room for wonder.</em></h3><p>Some gifts are not wrapped in paper. Some arrive as a reminder of who you already are.</p><button class="ghost-cta ${state.ribbonProgress < 100 ? 'is-muted' : ''}" data-action="next" ${state.ribbonProgress < 100 ? 'disabled' : ''}>One more little thing <span>↗</span></button></div>
      </div>`;
  }
  if (state.stage === 4) {
    return `
      <div class="cake-panel interactive-panel ${state.cakeCut ? 'cake-is-cut' : ''}">
        <div class="cake-copy"><span class="panel-index">04 / 05</span><h3>A slice of<br /><em>the good stuff.</em></h3><p>Drag your finger across the frosting, or click the cake. Make it a good one.</p><button class="ghost-cta" data-action="${state.cakeCut ? 'next' : 'cut'}">${state.cakeCut ? 'Bring on the candlelight' : 'Cut the cake'} <span>↗</span></button><span class="interaction-hint">${state.cakeCut ? 'crumbs, sparkle, applause' : 'touch / click anywhere on the cake'}</span></div>
        <div class="cake-stage" data-action="cut" role="button" tabindex="0" aria-label="Cut the birthday cake"><div class="cake-shadow"></div><div class="cake-plate"></div><div class="cake"><div class="cake-top"><span class="berry b1"></span><span class="berry b2"></span><span class="berry b3"></span><span class="cake-text">H</span></div><div class="cake-middle"></div><div class="cake-bottom"></div><div class="cake-slice"></div><div class="knife">✦</div><div class="cake-sprinkle s1"></div><div class="cake-sprinkle s2"></div><div class="cake-sprinkle s3"></div></div><div class="cake-celebration"><span>✦</span><span>✧</span><span>✦</span><b>cut with love</b></div></div>
      </div>`;
  }
  return `
    <div class="candle-panel interactive-panel ${state.candlesOut ? 'candles-out' : ''}">
      <div class="candle-copy"><span class="panel-index">05 / 05</span><h3>Make your wish<br /><em>count the light.</em></h3><p>Tap the flame button or swipe upward over the candle. No microphone, no pressure — just a little magic.</p><button class="ghost-cta" data-action="blow">${state.candlesOut ? 'The wish is on its way' : 'Blow out the candles'} <span>↗</span></button><button class="sensor-cta" data-action="sensor">${state.motionArmed ? 'motion mode armed ✓' : 'try phone motion mode'}</button><span class="sensor-note">${state.sensorMessage}</span></div>
      <div class="candle-stage" data-action="blow" role="button" tabindex="0" aria-label="Blow out the candles"><div class="moon-disc"></div><div class="wish-orbit orbit-one"></div><div class="wish-orbit orbit-two"></div><div class="candle-cake"><div class="candle c1"><span class="flame"></span></div><div class="candle c2"><span class="flame"></span></div><div class="candle c3"><span class="flame"></span></div><div class="candle-frosting"></div></div><span class="blow-label">${state.candlesOut ? 'wish released' : 'tap or swipe up'}</span><div class="smoke"><i></i><i></i><i></i></div></div>
    </div>`;
}

function renderFinale(): string {
  return `
    <section class="finale-stage">
      <div class="finale-copy"><p class="eyebrow"><span class="eyebrow-line"></span> THE FINALE · JUST FOR HINA</p><h2>Come a little<br /><em>closer.</em></h2><p>The brightest things are often the ones you have to reach for.</p><div class="sensor-status ${state.motionArmed ? 'armed' : ''}"><span></span><div><strong>${state.motionArmed ? 'motion mode is listening' : 'one last little gesture'}</strong><small>${state.motionArmed ? state.sensorMessage : 'click, tap, or move your phone gently toward you'}</small>${!state.motionArmed ? '<button class="sensor-cta finale-sensor" data-action="sensor">enable phone motion</button>' : ''}</div></div></div>
      <div class="ring-stage ${state.ringPlaced ? 'ring-placed' : ''}" data-action="place-ring" role="button" tabindex="0" aria-label="Place the diamond ring"><div class="ring-backdrop"><div class="halo halo-one"></div><div class="halo halo-two"></div><div class="halo halo-three"></div><span class="ring-star rs1">✦</span><span class="ring-star rs2">✧</span><span class="ring-star rs3">✦</span></div><div class="hand-illustration"><div class="palm"></div><div class="finger finger-pinky"></div><div class="finger finger-ring"><span class="finger-highlight"></span></div><div class="finger finger-middle"></div><div class="finger finger-index"></div><div class="finger finger-thumb"></div><div class="ring-object"><span class="diamond"><i></i></span><span class="ring-band"></span></div></div><div class="ring-instruction">${state.ringPlaced ? 'a little forever, placed gently' : 'click / tap the ring finger'}</div><div class="ring-complete"><span>✦</span><strong>Hina, you are a rare one.</strong><small>happy birthday, with all the good things.</small></div></div>
      <div class="finale-actions"><button class="primary-cta" data-action="restart"><span>Start the orbit again</span><b>↗</b></button><span>made for a once-in-a-lifetime kind of friend</span></div>
    </section>`;
}

function goTo(stage: Stage): void {
  state.stage = stage;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function unlockNext(): void {
  if (state.stage < 5) goTo((state.stage + 1) as Stage);
}

function triggerCake(): void {
  if (state.cakeCut) return;
  state.cakeCut = true;
  burstConfetti('cake');
  render();
}

function triggerCandles(): void {
  if (state.candlesOut) return;
  state.candlesOut = true;
  burstConfetti('candle');
  render();
  window.setTimeout(() => { render(); }, 750);
}

function burstConfetti(kind: 'cake' | 'candle' | 'ring'): void {
  const host = document.querySelector('.app-shell');
  if (!host) return;
  const colors = kind === 'ring' ? ['#f5c8ff', '#d56cff', '#ffd7ec', '#fff5cc'] : ['#f48abb', '#d56cff', '#ffcfdf', '#fbdc90'];
  const layer = document.createElement('div');
  layer.className = `confetti-layer confetti-${kind}`;
  layer.innerHTML = Array.from({ length: kind === 'ring' ? 26 : 34 }, (_, i) => `<span style="--x:${(i * 47) % 100}%;--delay:${(i % 10) * .035}s;--color:${colors[i % colors.length]};--rotate:${(i * 37) % 360}deg"></span>`).join('');
  host.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1800);
}

function requestMotion(): void {
  if (state.motionArmed) return;
  const orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
  const motion = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> };
  const requests: Promise<string>[] = [];
  if (typeof orientation?.requestPermission === 'function') requests.push(orientation.requestPermission());
  if (typeof motion?.requestPermission === 'function') requests.push(motion.requestPermission());
  Promise.all(requests.length ? requests : [Promise.resolve('granted')]).then((results) => {
    if (results.some((result) => result === 'denied')) throw new Error('denied');
    armMotion();
  }).catch(() => {
    state.sensorMessage = 'Motion is private on this browser — use the ring tap instead.';
    render();
  });
}

function armMotion(): void {
  state.motionArmed = true;
  state.sensorMessage = 'Gently tilt or bring your hand close to the phone.';
  const onOrientation = (event: DeviceOrientationEvent) => {
    if (motionBaseline === null && typeof event.beta === 'number' && typeof event.gamma === 'number') {
      motionBaseline = { beta: event.beta, gamma: event.gamma };
      return;
    }
    if (!motionBaseline || typeof event.beta !== 'number' || typeof event.gamma !== 'number') return;
    const delta = Math.abs(event.beta - motionBaseline.beta) + Math.abs(event.gamma - motionBaseline.gamma);
    if (delta > 24) placeRing();
  };
  const onMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && (Math.abs(acceleration.x ?? 0) + Math.abs(acceleration.y ?? 0)) > 19) placeRing();
  };
  const onProximity = () => placeRing();
  window.addEventListener('deviceorientation', onOrientation);
  window.addEventListener('devicemotion', onMotion);
  const proximityWindow = window as Window & { addEventListener: (type: 'userproximity', listener: () => void) => void; removeEventListener: (type: 'userproximity', listener: () => void) => void };
  proximityWindow.addEventListener('userproximity', onProximity);
  sensorCleanup = () => { window.removeEventListener('deviceorientation', onOrientation); window.removeEventListener('devicemotion', onMotion); proximityWindow.removeEventListener('userproximity', onProximity); };
  render();
}

function placeRing(): void {
  if (state.ringPlaced) return;
  state.ringPlaced = true;
  if (sensorCleanup) sensorCleanup();
  burstConfetti('ring');
  render();
}

function bindEvents(): void {
  app.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => {
    const action = element.dataset.action;
    if (action === 'ribbon') {
      let dragging = false;
      const move = (event: PointerEvent) => {
        if (!dragging) return;
        const rect = element.parentElement?.getBoundingClientRect();
        if (!rect) return;
        state.ribbonProgress = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
        element.setAttribute('style', `left:${state.ribbonProgress}%`);
        if (state.ribbonProgress >= 99) { state.ribbonProgress = 100; render(); }
      };
      element.addEventListener('pointerdown', (event) => { dragging = true; element.setPointerCapture(event.pointerId); move(event); });
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerup', () => { dragging = false; });
      element.addEventListener('pointercancel', () => { dragging = false; });
      return;
    }
    if (action === 'note') {
      element.addEventListener('click', () => { const note = Number(element.dataset.note ?? 0); state.notesFound = Math.max(state.notesFound, note + 1); render(); });
      return;
    }
    if (action === 'jump') {
      element.addEventListener('click', () => goTo(Number(element.dataset.stage) as Stage));
      return;
    }
    element.addEventListener('click', () => {
      if (action === 'start') { state.started = true; render(); return; }
      if (action === 'home') { state.started = false; state.stage = 1; render(); return; }
      if (action === 'next') { if (state.stage === 1 || (state.stage === 2 && state.notesFound === 3) || (state.stage === 3 && state.ribbonProgress === 100) || (state.stage === 4 && state.cakeCut)) unlockNext(); return; }
      if (action === 'cut') { triggerCake(); return; }
      if (action === 'blow') { triggerCandles(); return; }
      if (action === 'sensor') { requestMotion(); return; }
      if (action === 'place-ring') { placeRing(); return; }
      if (action === 'restart') { state.started = true; state.stage = 1; state.notesFound = 0; state.ribbonProgress = 0; state.cakeCut = false; state.candlesOut = false; state.ringPlaced = false; render(); return; }
    });
    element.addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && ['cut', 'blow', 'place-ring'].includes(action ?? '')) { event.preventDefault(); element.click(); } });
  });
}

app = document.querySelector<HTMLElement>('#app')!;
render();
