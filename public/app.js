const phaseCards = Array.from(document.querySelectorAll('.phase-card'));
const phaseWheel = document.querySelector('#phase-wheel');
const phaseReadout = document.querySelector('#phase-readout');
const form = document.querySelector('#conductor-form');
const statusLine = document.querySelector('#status-line');
const audioEl = document.querySelector('#generated-audio');
const lyricsEl = document.querySelector('#lyrics');
const phaseChip = document.querySelector('#phase-chip');
const historyList = document.querySelector('#session-history');
const historyExportBtn = document.querySelector('#history-export');
const historyShareBtn = document.querySelector('#history-share');
const waveformEl = document.querySelector('#waveform-visualizer');

const HISTORY_KEY = 'jukebox-session-history-v1';
const MAX_HISTORY_ITEMS = 5;
const WAVE_BAR_COUNT = 28;
const phaseMeta = {
  'PEAK-BASS': { key: 'peak-bass', label: 'Peak-Bass', bpm: 136, angle: -135 },
  'MAIN-FLOOR': { key: 'main-floor', label: 'Main-Floor', bpm: 128, angle: -45 },
  SUNRISE: { key: 'sunrise', label: 'Sunrise', bpm: 118, angle: 45 },
  'ZONED-OUT': { key: 'zoned-out', label: 'Zoned-Out', bpm: 92, angle: 135 },
};
const phaseOrder = ['PEAK-BASS', 'MAIN-FLOOR', 'SUNRISE', 'ZONED-OUT'];

let selectedPhase = 'PEAK-BASS';
let isGenerating = false;
let waveInterval = null;
let isDraggingWheel = false;
let isWaveAnimating = false;

const safeVibrate = (pattern) => {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
};

const getHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setHistory = (entries) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)));
};

const renderHistory = () => {
  if (!historyList) return;

  const history = getHistory();
  historyList.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'history-empty';
    empty.textContent = 'No sets generated yet.';
    historyList.appendChild(empty);
    return;
  }

  history.forEach((entry) => {
    const li = document.createElement('li');
    const when = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    li.textContent = `${entry.phase} | ${entry.atmosphere} | seed: ${entry.artistSeed} | ${when}`;
    historyList.appendChild(li);
  });
};

const syncWaveAnimationState = () => {
  const shouldAnimate = isGenerating || Boolean(audioEl?.src && !audioEl?.paused);
  if (shouldAnimate === isWaveAnimating) return;
  isWaveAnimating = shouldAnimate;

  if (isWaveAnimating && !waveInterval) {
    waveInterval = setInterval(updateWaveform, 150);
  }

  if (!isWaveAnimating && waveInterval) {
    clearInterval(waveInterval);
    waveInterval = null;
  }
};

const updateWaveform = () => {
  if (!waveformEl) return;
  const bars = Array.from(waveformEl.children);
  const active = isWaveAnimating;
  waveformEl.classList.toggle('is-active', active);

  bars.forEach((bar) => {
    const min = active ? 24 : 12;
    const max = active ? 98 : 20;
    bar.style.height = `${Math.floor(min + Math.random() * (max - min))}%`;
  });
};

const ensureWaveformBars = () => {
  if (!waveformEl) return;
  waveformEl.replaceChildren();
  for (let i = 0; i < WAVE_BAR_COUNT; i += 1) {
    const bar = document.createElement('span');
    bar.className = 'wave-bar';
    waveformEl.appendChild(bar);
  }
  updateWaveform();
};

const circularDistance = (a, b) => {
  const delta = Math.abs(a - b);
  return Math.min(delta, 360 - delta);
};

const closestPhaseFromAngle = (angle) => {
  let winner = phaseOrder[0];
  let smallest = Number.POSITIVE_INFINITY;

  phaseOrder.forEach((phase) => {
    const distance = circularDistance(angle, phaseMeta[phase].angle);
    if (distance < smallest) {
      smallest = distance;
      winner = phase;
    }
  });

  return winner;
};

const angleFromPointer = (event) => {
  if (!phaseWheel) return phaseMeta[selectedPhase].angle;
  const rect = phaseWheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const syncPhaseCards = (phase) => {
  phaseCards.forEach((card) => {
    card.classList.toggle('is-current', card.dataset.phase === phase);
  });
};

const applyPhaseTheme = (phase) => {
  const meta = phaseMeta[phase];
  if (!meta) return;

  selectedPhase = phase;
  document.body.dataset.phase = meta.key;
  syncPhaseCards(phase);

  if (phaseChip) {
    phaseChip.textContent = `${meta.label} · ${meta.bpm} BPM`;
  }
  if (phaseReadout) {
    phaseReadout.textContent = meta.label;
  }
  if (phaseWheel) {
    phaseWheel.style.setProperty('--wheel-angle', `${meta.angle}deg`);
    phaseWheel.setAttribute('aria-valuenow', `${phaseOrder.indexOf(phase) + 1}`);
    phaseWheel.setAttribute('aria-valuetext', meta.label);
  }
  if (!isGenerating) {
    statusLine.textContent = `${meta.label} phase armed.`;
  }
};

const movePhaseByStep = (delta) => {
  const current = phaseOrder.indexOf(selectedPhase);
  const next = (current + delta + phaseOrder.length) % phaseOrder.length;
  applyPhaseTheme(phaseOrder[next]);
};

phaseCards.forEach((card) => {
  card.addEventListener('click', () => {
    const nextPhase = card.dataset.phase || selectedPhase;
    applyPhaseTheme(nextPhase);
    safeVibrate([12, 30, 12]);
  });
});

if (phaseWheel) {
  const handlePointerMove = (event) => {
    if (!isDraggingWheel) return;
    const angle = angleFromPointer(event);
    applyPhaseTheme(closestPhaseFromAngle(angle));
  };

  phaseWheel.addEventListener('pointerdown', (event) => {
    phaseWheel.setPointerCapture(event.pointerId);
    isDraggingWheel = true;
    handlePointerMove(event);
    safeVibrate(12);
  });

  phaseWheel.addEventListener('pointermove', handlePointerMove);
  phaseWheel.addEventListener('pointerup', () => {
    isDraggingWheel = false;
  });
  phaseWheel.addEventListener('pointercancel', () => {
    isDraggingWheel = false;
  });

  phaseWheel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      movePhaseByStep(-1);
      safeVibrate(10);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      movePhaseByStep(1);
      safeVibrate(10);
    }
  });
}

ensureWaveformBars();
renderHistory();
applyPhaseTheme(selectedPhase);

if (historyExportBtn) {
  historyExportBtn.addEventListener('click', () => {
    const history = getHistory();
    if (history.length === 0) {
      statusLine.textContent = 'No session history to export yet.';
      return;
    }

    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jukebox-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    statusLine.textContent = 'Session history exported.';
  });
}

if (historyShareBtn) {
  historyShareBtn.addEventListener('click', async () => {
    const history = getHistory();
    if (history.length === 0) {
      statusLine.textContent = 'No session history to share yet.';
      return;
    }

    const summary = history
      .map((entry, index) => `${index + 1}. ${entry.phase} | ${entry.atmosphere} | ${entry.artistSeed}`)
      .join('\n');
    const shareText = `JukeBox London Session\n${summary}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'JukeBox London Session',
          text: shareText,
        });
        statusLine.textContent = 'Session summary shared.';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        statusLine.textContent = 'Session summary copied to clipboard.';
      } else {
        statusLine.textContent = 'Share not supported in this browser.';
      }
    } catch {
      statusLine.textContent = 'Share canceled.';
    }
  });
}

if (audioEl) {
  audioEl.addEventListener('play', () => {
    syncWaveAnimationState();
    updateWaveform();
  });
  audioEl.addEventListener('pause', () => {
    syncWaveAnimationState();
    updateWaveform();
  });
  audioEl.addEventListener('ended', () => {
    syncWaveAnimationState();
    updateWaveform();
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const atmosphere = document.querySelector('#atmosphere')?.value?.trim();
    const artistSeed = document.querySelector('#artistSeed')?.value?.trim();

    if (!atmosphere || !artistSeed) {
      statusLine.textContent = 'Add both atmosphere and artist seed.';
      return;
    }

    statusLine.textContent = 'Generating AI stream...';
    isGenerating = true;
    syncWaveAnimationState();
    updateWaveform();

    try {
      const response = await fetch('/api/conduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: selectedPhase,
          atmosphere,
          artistSeed,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'Generation failed');
      }

      const inlineData = payload?.audioData;
      const data = inlineData?.data || '';
      const mimeType = inlineData?.mimeType || 'audio/wav';

      if (data) {
        audioEl.src = `data:${mimeType};base64,${data}`;
        await audioEl.play().catch(() => null);
      }

      if (payload?.lyrics) {
        lyricsEl.textContent = payload.lyrics;
      }

      const nextHistory = [
        {
          phase: phaseMeta[selectedPhase]?.label || selectedPhase,
          atmosphere,
          artistSeed,
          timestamp: Date.now(),
        },
        ...getHistory(),
      ];
      setHistory(nextHistory);
      renderHistory();

      safeVibrate([20, 36, 20]);
      statusLine.textContent = 'Stream generated. Playback started.';
    } catch (error) {
      statusLine.textContent = error.message || 'Generation failed.';
    } finally {
      isGenerating = false;
      syncWaveAnimationState();
      updateWaveform();
    }
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isWaveAnimating = false;
    if (waveInterval) {
      clearInterval(waveInterval);
      waveInterval = null;
    }
    updateWaveform();
    return;
  }
  syncWaveAnimationState();
  updateWaveform();
});
