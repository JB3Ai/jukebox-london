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
const neuralHandshakeBtn = document.querySelector('#neural-handshake-btn');
const handshakeStatus = document.querySelector('#handshake-status');
const playbackPanel = document.querySelector('.playback');
const neuralMesh = document.querySelector('#neural-mesh');
const lyricsStream = document.querySelector('#lyrics-stream');

const HISTORY_KEY = 'jukebox-session-history-v1';
const MAX_HISTORY_ITEMS = 5;
const WAVE_BAR_COUNT = 28;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
let meshAnimationFrame = null;
let meshPulse = 0;

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

const saveSessionEntry = ({ phase, atmosphere, artistSeed }) => {
  const nextHistory = [
    {
      phase: phaseMeta[phase]?.label || phase,
      atmosphere,
      artistSeed,
      timestamp: Date.now(),
    },
    ...getHistory(),
  ];
  setHistory(nextHistory);
  renderHistory();
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

const drawNeuralMesh = () => {
  if (!neuralMesh) return;

  const context = neuralMesh.getContext('2d');
  if (!context) return;

  const rect = neuralMesh.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * ratio));
  const height = Math.max(1, Math.floor(rect.height * ratio));

  if (neuralMesh.width !== width || neuralMesh.height !== height) {
    neuralMesh.width = width;
    neuralMesh.height = height;
  }

  context.clearRect(0, 0, width, height);
  context.lineWidth = 1 * ratio;
  context.globalCompositeOperation = 'screen';

  const time = prefersReducedMotion ? 0 : performance.now() / 800;
  const columns = 7;
  const rows = 4;
  const points = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = (column / (columns - 1)) * width;
      const y = (row / (rows - 1)) * height;
      const drift = Math.sin(time + column * 0.8 + row * 1.4) * 8 * ratio * meshPulse;
      points.push({ x: x + drift, y: y - drift * 0.45 });
    }
  }

  points.forEach((point, index) => {
    const next = index % columns === columns - 1 ? null : points[index + 1];
    const below = points[index + columns];
    const alpha = 0.16 + meshPulse * 0.34;
    context.strokeStyle = `rgba(0, 230, 242, ${alpha})`;

    [next, below].forEach((target) => {
      if (!target) return;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(target.x, target.y);
      context.stroke();
    });

    context.fillStyle = `rgba(234, 0, 242, ${0.22 + meshPulse * 0.48})`;
    context.beginPath();
    context.arc(point.x, point.y, (1.2 + meshPulse * 1.8) * ratio, 0, Math.PI * 2);
    context.fill();
  });
};

const syncMeshAnimationState = () => {
  drawNeuralMesh();

  if (prefersReducedMotion || meshAnimationFrame || !isWaveAnimating) return;

  const tick = () => {
    meshPulse = isWaveAnimating ? Math.min(1, meshPulse + 0.06) : Math.max(0, meshPulse - 0.08);
    drawNeuralMesh();

    if (isWaveAnimating || meshPulse > 0) {
      meshAnimationFrame = requestAnimationFrame(tick);
      return;
    }

    meshAnimationFrame = null;
  };

  meshAnimationFrame = requestAnimationFrame(tick);
};

const syncWaveAnimationState = () => {
  const shouldAnimate = isGenerating || Boolean(audioEl?.src && !audioEl?.paused);
  if (shouldAnimate === isWaveAnimating) return;
  isWaveAnimating = shouldAnimate;
  syncMeshAnimationState();

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

const enterBooth = async () => {
  if (isGenerating) return;

  const atmosphere = '140BPM London warehouse neural buffer';
  const artistSeed = 'London club lineage';

  if (neuralHandshakeBtn) {
    neuralHandshakeBtn.textContent = 'SYNCING...';
    neuralHandshakeBtn.disabled = true;
  }
  if (handshakeStatus) {
    handshakeStatus.textContent = 'INITIALIZING NEURAL BUFFER...';
  }
  if (statusLine) {
    statusLine.textContent = 'Neural handshake in progress...';
  }

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
      throw new Error(payload?.message || payload?.error || 'Neural handshake failed.');
    }

    const inlineData = payload?.audioData;
    const data = inlineData?.data || '';
    const mimeType = inlineData?.mimeType || 'audio/wav';

    if (data && audioEl) {
      audioEl.src = `data:${mimeType};base64,${data}`;
      await audioEl.play().catch(() => null);
    }
    if (payload?.lyrics && lyricsEl) {
      lyricsEl.textContent = payload.lyrics;
    }
    if (lyricsStream) {
      lyricsStream.textContent = payload?.lyrics || 'Synthesizing next movement...';
    }
    if (playbackPanel) {
      playbackPanel.classList.add('is-synced');
      window.setTimeout(() => playbackPanel.classList.remove('is-synced'), 1400);
    }

    saveSessionEntry({ phase: selectedPhase, atmosphere, artistSeed });
    safeVibrate([18, 32, 18]);

    if (handshakeStatus) {
      handshakeStatus.innerHTML = '<strong>SYNCED:</strong> Ready to conduct.';
    }
    if (statusLine) {
      statusLine.textContent = data ? 'Neural sync complete. Playback armed.' : 'Neural sync complete.';
    }
    if (neuralHandshakeBtn) {
      neuralHandshakeBtn.textContent = 'Start Session';
    }
  } catch (error) {
    if (handshakeStatus) {
      handshakeStatus.textContent = 'CONNECTION ERROR: Check server logs.';
    }
    if (statusLine) {
      statusLine.textContent = error.message || 'Connection error.';
    }
    if (neuralHandshakeBtn) {
      neuralHandshakeBtn.textContent = 'Retry Sync';
    }
  } finally {
    isGenerating = false;
    if (neuralHandshakeBtn) {
      neuralHandshakeBtn.disabled = false;
    }
    syncWaveAnimationState();
    updateWaveform();
  }
};

window.enterBooth = enterBooth;

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
drawNeuralMesh();
renderHistory();
applyPhaseTheme(selectedPhase);

window.addEventListener('resize', drawNeuralMesh);

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
      if (lyricsStream) {
        lyricsStream.textContent = payload?.lyrics || 'Synthesizing next movement...';
      }
      if (playbackPanel) {
        playbackPanel.classList.add('is-synced');
        window.setTimeout(() => playbackPanel.classList.remove('is-synced'), 1400);
      }

      saveSessionEntry({ phase: selectedPhase, atmosphere, artistSeed });

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
    if (meshAnimationFrame) {
      cancelAnimationFrame(meshAnimationFrame);
      meshAnimationFrame = null;
    }
    meshPulse = 0;
    if (waveInterval) {
      clearInterval(waveInterval);
      waveInterval = null;
    }
    updateWaveform();
    drawNeuralMesh();
    return;
  }
  syncWaveAnimationState();
  updateWaveform();
});
