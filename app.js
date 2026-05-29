/* ── Constants ── */
const FILE_VERSION = '1.0';
const MAX_BED_DIM = 20;
const MIN_BED_DIM = 1;
const COMMON_SIZES = [
  { label: '4×4', w: 4, h: 4 },
  { label: '4×8', w: 4, h: 8 },
  { label: '4×12', w: 4, h: 12 },
  { label: '3×6', w: 3, h: 6 },
  { label: '2×4', w: 2, h: 4 },
];

/* ── State ── */
let state = {
  beds: [],
  targets: {},       // { plantId: number }
  selectedPlant: null, // plantId or '__erase__'
};

let dragSourcePlant = null; // set during drag from sidebar

/* ── Helpers ── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function plantById(id) { return PLANT_MAP[id] || null; }

/* ── Bed operations ── */
function createBed(name, width = 4, height = 4) {
  return { id: uid(), name, width, height, grid: {} };
}

function resizeBed(bed, newWidth, newHeight) {
  const cleaned = {};
  for (const [key, val] of Object.entries(bed.grid)) {
    const [r, c] = key.split(',').map(Number);
    if (r < newHeight && c < newWidth) cleaned[key] = val;
  }
  bed.width = newWidth;
  bed.height = newHeight;
  bed.grid = cleaned;
}

/* ── Plant totals ── */
function computeTotals() {
  // squares = grid cells used; plants = squares × perSqFt
  const totals = {};   // { plantId: { squares: n, plants: n, beds: { bedId: squareCount } } }
  for (const bed of state.beds) {
    for (const plantId of Object.values(bed.grid)) {
      if (!plantId) continue;
      if (!totals[plantId]) totals[plantId] = { squares: 0, plants: 0, beds: {} };
      const plant = plantById(plantId);
      totals[plantId].squares += 1;
      totals[plantId].plants += plant ? plant.perSqFt : 1;
      totals[plantId].beds[bed.id] = (totals[plantId].beds[bed.id] || 0) + 1;
    }
  }
  return totals;
}

/* ── Render ── */
function render() {
  renderBeds();
  renderSummary();
}

/* ── Sidebar plant list ── */
function renderSidebar() {
  const search = (document.getElementById('plant-search').value || '').toLowerCase();
  const listEl = document.getElementById('plant-list');
  listEl.innerHTML = '';

  const filtered = PLANTS.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  const grouped = {};
  for (const p of filtered) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  for (const [cat, plants] of Object.entries(grouped)) {
    const grp = document.createElement('div');
    grp.className = 'category-group';
    grp.innerHTML = `<div class="category-label">${cat}</div>`;
    for (const plant of plants) {
      grp.appendChild(makePlantItem(plant));
    }
    listEl.appendChild(grp);
  }
}

function makePlantItem(plant) {
  const div = document.createElement('div');
  div.className = 'plant-item' + (state.selectedPlant === plant.id ? ' selected' : '');
  div.dataset.plantId = plant.id;
  div.draggable = true;
  div.innerHTML = `
    <div class="plant-swatch" style="background:${plant.color}20; border:2px solid ${plant.color}60">
      <span style="font-size:1rem">${plant.emoji}</span>
    </div>
    <div class="plant-info">
      <div class="plant-name">${plant.name}</div>
      <div class="plant-density">${plant.perSqFt}/sq ft</div>
    </div>`;

  div.addEventListener('click', () => selectPlant(plant.id));
  div.addEventListener('dragstart', e => {
    dragSourcePlant = plant.id;
    div.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plant-id', plant.id);
  });
  div.addEventListener('dragend', () => div.classList.remove('dragging'));
  return div;
}

function selectPlant(plantId) {
  if (state.selectedPlant === plantId) {
    state.selectedPlant = null;
  } else {
    state.selectedPlant = plantId;
  }
  // update eraser btn
  document.getElementById('eraser-btn').classList.toggle('selected', state.selectedPlant === '__erase__');
  // re-render sidebar selection state
  document.querySelectorAll('.plant-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.plantId === state.selectedPlant);
  });
}

function selectEraser() {
  state.selectedPlant = state.selectedPlant === '__erase__' ? null : '__erase__';
  document.getElementById('eraser-btn').classList.toggle('selected', state.selectedPlant === '__erase__');
  document.querySelectorAll('.plant-item').forEach(el => el.classList.remove('selected'));
}

/* ── Bed rendering ── */
function renderBeds() {
  const container = document.getElementById('beds-container');
  container.innerHTML = '';

  if (state.beds.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">🌱</div><p>No garden beds yet. Add your first bed!</p></div>`;
    return;
  }

  for (const bed of state.beds) {
    container.appendChild(makeBedCard(bed));
  }
}

function makeBedCard(bed) {
  const card = document.createElement('div');
  card.className = 'bed-card';
  card.dataset.bedId = bed.id;

  card.innerHTML = `
    <div class="bed-card-header">
      <div class="bed-name-wrap">
        <input class="bed-name-input" type="text" value="${escHtml(bed.name)}" placeholder="Bed name" data-bed-id="${bed.id}">
        <svg class="bed-name-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>
      <div class="bed-size-controls">
        <input class="size-input" type="number" min="${MIN_BED_DIM}" max="${MAX_BED_DIM}" value="${bed.width}" data-dim="width" data-bed-id="${bed.id}" title="Width (ft)">
        <span>×</span>
        <input class="size-input" type="number" min="${MIN_BED_DIM}" max="${MAX_BED_DIM}" value="${bed.height}" data-dim="height" data-bed-id="${bed.id}" title="Height (ft)">
        <span style="color:var(--text-muted);font-size:0.75rem">ft</span>
      </div>
      <button class="btn btn-ghost btn-sm btn-icon" title="Clear bed" data-action="clear-bed" data-bed-id="${bed.id}">🗑</button>
      <button class="btn btn-danger btn-sm btn-icon" title="Delete bed" data-action="delete-bed" data-bed-id="${bed.id}">✕</button>
    </div>
    <div class="bed-card-body">
      ${makeBedGrid(bed)}
    </div>`;

  // Name change
  card.querySelector('.bed-name-input').addEventListener('change', e => {
    const b = state.beds.find(x => x.id === e.target.dataset.bedId);
    if (b) { b.name = e.target.value; renderSummary(); }
  });

  // Size inputs
  card.querySelectorAll('.size-input').forEach(input => {
    input.addEventListener('change', e => {
      const b = state.beds.find(x => x.id === e.target.dataset.bedId);
      if (!b) return;
      const val = clamp(parseInt(e.target.value) || 1, MIN_BED_DIM, MAX_BED_DIM);
      e.target.value = val;
      const dim = e.target.dataset.dim;
      if (dim === 'width') resizeBed(b, val, b.height);
      else resizeBed(b, b.width, val);
      render();
    });
  });

  // Action buttons
  card.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const bedId = btn.dataset.bedId;
    if (action === 'clear-bed') {
      const b = state.beds.find(x => x.id === bedId);
      if (b && confirm(`Clear all plants from "${b.name}"?`)) { b.grid = {}; render(); }
    } else if (action === 'delete-bed') {
      const b = state.beds.find(x => x.id === bedId);
      if (b && confirm(`Delete bed "${b.name}"?`)) {
        state.beds = state.beds.filter(x => x.id !== bedId);
        render();
      }
    }
  });

  return card;
}

function makeBedGrid(bed) {
  let html = `<div class="garden-grid" style="grid-template-columns:repeat(${bed.width},var(--cell-size))" data-bed-id="${bed.id}">`;
  for (let r = 0; r < bed.height; r++) {
    for (let c = 0; c < bed.width; c++) {
      const key = `${r},${c}`;
      const plantId = bed.grid[key];
      const plant = plantId ? plantById(plantId) : null;
      const occupied = !!plant;
      html += `<div class="grid-cell${occupied ? ' occupied' : ''}"
        data-bed-id="${bed.id}" data-row="${r}" data-col="${c}"
        draggable="false"
        title="${plant ? `${plant.name} (${plant.perSqFt}/sq ft) — click to change, right-click to clear` : 'Click to plant'}">`;
      if (plant) {
        html += `<span class="cell-emoji">${plant.emoji}</span>
                 <span class="cell-count">${plant.perSqFt}×</span>
                 <span class="cell-name">${plant.name}</span>`;
      }
      html += `</div>`;
    }
  }
  html += `</div>`;
  return html;
}

/* ── Grid cell interactions ── */
document.addEventListener('click', e => {
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;
  const bedId = cell.dataset.bedId;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  handleCellClick(bedId, row, col);
});

document.addEventListener('contextmenu', e => {
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;
  e.preventDefault();
  const bedId = cell.dataset.bedId;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const bed = state.beds.find(b => b.id === bedId);
  if (bed) { delete bed.grid[`${row},${col}`]; render(); }
});

function handleCellClick(bedId, row, col) {
  const bed = state.beds.find(b => b.id === bedId);
  if (!bed) return;
  const key = `${row},${col}`;

  if (state.selectedPlant === '__erase__') {
    delete bed.grid[key];
    render();
    return;
  }

  if (state.selectedPlant) {
    bed.grid[key] = state.selectedPlant;
    render();
    return;
  }

  // No selection — open picker modal
  openPlantModal(bedId, row, col);
}

/* ── Drag and drop (plant → grid) ── */
document.addEventListener('dragover', e => {
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  cell.classList.add('drag-over');
});

document.addEventListener('dragleave', e => {
  const cell = e.target.closest('.grid-cell');
  if (cell) cell.classList.remove('drag-over');
});

document.addEventListener('drop', e => {
  const cell = e.target.closest('.grid-cell');
  if (!cell) return;
  e.preventDefault();
  cell.classList.remove('drag-over');
  const plantId = e.dataTransfer.getData('text/plant-id') || dragSourcePlant;
  if (!plantId) return;
  const bedId = cell.dataset.bedId;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const bed = state.beds.find(b => b.id === bedId);
  if (bed) {
    bed.grid[`${row},${col}`] = plantId;
    render();
  }
  dragSourcePlant = null;
});

/* ── Plant modal ── */
function openPlantModal(bedId, row, col) {
  const bed = state.beds.find(b => b.id === bedId);
  const key = `${row},${col}`;
  const currentPlantId = bed ? bed.grid[key] : null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Select a Plant</h3>
        <button class="btn btn-ghost btn-icon" id="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-grid" id="modal-grid"></div>
      </div>
      <div class="modal-footer">
        ${currentPlantId ? `<button class="btn btn-danger" id="modal-clear">Clear Square</button>` : ''}
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      </div>
    </div>`;

  const grid = overlay.querySelector('#modal-grid');
  for (const plant of PLANTS) {
    const btn = document.createElement('button');
    btn.className = 'modal-plant-btn';
    if (plant.id === currentPlantId) btn.style.borderColor = 'var(--green)';
    btn.innerHTML = `<span class="mp-emoji">${plant.emoji}</span>
                     <span>${plant.name}</span>
                     <span class="mp-density">${plant.perSqFt}/sq ft</span>`;
    btn.addEventListener('click', () => {
      if (bed) { bed.grid[key] = plant.id; render(); }
      document.body.removeChild(overlay);
    });
    grid.appendChild(btn);
  }

  overlay.querySelector('#modal-close').addEventListener('click', () => document.body.removeChild(overlay));
  overlay.querySelector('#modal-cancel').addEventListener('click', () => document.body.removeChild(overlay));
  const clearBtn = overlay.querySelector('#modal-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (bed) { delete bed.grid[key]; render(); }
      document.body.removeChild(overlay);
    });
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });

  document.body.appendChild(overlay);
}

/* ── Summary rendering ── */
function renderSummary() {
  const totals = computeTotals();
  const tbody = document.getElementById('summary-tbody');
  tbody.innerHTML = '';

  const plantIds = Object.keys(totals);
  if (plantIds.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">No plants placed yet</td></tr>`;
    return;
  }

  // Sort by name
  plantIds.sort((a, b) => (plantById(a)?.name || '').localeCompare(plantById(b)?.name || ''));

  for (const plantId of plantIds) {
    const plant = plantById(plantId);
    if (!plant) continue;
    const info = totals[plantId];
    // targets are stored as square counts
    const targetSq = state.targets[plantId];
    const hasTarget = targetSq !== undefined && targetSq !== null;

    const tr = document.createElement('tr');

    // Plant name col
    const tdName = document.createElement('td');
    tdName.innerHTML = `<div class="plant-label">
      <span style="font-size:1.2rem">${plant.emoji}</span>
      <span>${plant.name}</span>
    </div>`;

    // Total col — squares is the headline, plant count is secondary
    const tdTotal = document.createElement('td');
    tdTotal.innerHTML = `<strong>${info.squares} sq</strong> <span style="color:var(--text-muted);font-size:0.72rem">= ${info.plants} plants</span>`;

    // Per-bed breakdown (in squares)
    const tdBeds = document.createElement('td');
    const chips = state.beds
      .filter(b => info.beds[b.id])
      .map(b => `<span class="bed-chip"><span>${escHtml(b.name)}</span>: <span class="chip-count">${info.beds[b.id]} sq</span></span>`)
      .join('');
    tdBeds.innerHTML = `<div class="bed-breakdown">${chips}</div>`;

    // Target col — enter number of squares, plain integer
    const tdTarget = document.createElement('td');
    const currentVal = hasTarget ? targetSq : '';
    tdTarget.innerHTML = `<div class="target-input-wrap">
      <input class="target-input" type="number" min="0" step="1"
        value="${currentVal}" placeholder="—"
        data-plant-id="${plantId}" title="Target number of squares to fill with ${plant.name}">
      <span class="target-hint">sq</span>
    </div>`;
    tdTarget.querySelector('.target-input').addEventListener('change', e => {
      const raw = e.target.value.trim();
      if (raw === '') {
        delete state.targets[plantId];
      } else {
        const val = Math.max(0, parseInt(raw) || 0);
        state.targets[plantId] = val;
        e.target.value = val;
      }
      renderSummary();
    });

    // Progress col — squares filled vs target squares
    const tdProgress = document.createElement('td');
    if (hasTarget && targetSq > 0) {
      const pct = Math.round((info.squares / targetSq) * 100);
      const fillClass = pct > 100 ? 'over' : pct >= 100 ? 'complete' : '';
      const displayPct = Math.min(pct, 999);
      tdProgress.innerHTML = `<div class="progress-wrap">
        <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${Math.min(100, pct)}%"></div></div>
        <span class="progress-label" title="${info.squares} of ${targetSq} squares filled">${displayPct}%</span>
      </div>`;
    } else if (hasTarget && targetSq === 0) {
      tdProgress.innerHTML = `<span style="color:var(--text-muted);font-size:0.8rem">0 sq target</span>`;
    } else {
      tdProgress.innerHTML = `<span style="color:var(--text-muted);font-size:0.8rem">—</span>`;
    }

    tr.appendChild(tdName);
    tr.appendChild(tdTotal);
    tr.appendChild(tdBeds);
    tr.appendChild(tdTarget);
    tr.appendChild(tdProgress);
    tbody.appendChild(tr);
  }

  // Update summary column headers with bed names
  updateSummaryHeaders();
}

function updateSummaryHeaders() {
  // No-op for now; bed breakdown is inline
}

/* ── Add bed ── */
function addBed(width = 4, height = 4) {
  const num = state.beds.length + 1;
  state.beds.push(createBed(`Bed ${num}`, width, height));
  render();
}

/* ── Save / Load ── */
function buildSaveData() {
  return {
    version: FILE_VERSION,
    savedAt: new Date().toISOString(),
    beds: state.beds.map(b => ({
      id: b.id,
      name: b.name,
      width: b.width,
      height: b.height,
      grid: { ...b.grid },
    })),
    targets: { ...state.targets },
  };
}

// Remembers the last FileSystemFileHandle so Save can overwrite without re-prompting
let lastFileHandle = null;
let lastFileName = '';

function defaultFileName() {
  const ts = new Date().toISOString().slice(0, 10);
  return lastFileName || `garden-plan-${ts}.json`;
}

async function saveToFile() {
  const data = buildSaveData();
  const json = JSON.stringify(data, null, 2);

  // Chrome/Edge: native Save As dialog with overwrite support
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFileName(),
        types: [{ description: 'Garden Plan', accept: { 'application/json': ['.json'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      lastFileHandle = handle;
      lastFileName = handle.name;
      toast(`Saved as "${handle.name}"`);
    } catch (err) {
      if (err.name !== 'AbortError') toast(`Save failed: ${err.message}`, true);
    }
    return;
  }

  // Fallback: prompt for filename then trigger download
  openSaveModal(json);
}

function openSaveModal(json) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:360px" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Save Garden Plan</h3>
        <button class="btn btn-ghost btn-icon" id="save-modal-close">✕</button>
      </div>
      <div class="modal-body" style="padding:16px 18px">
        <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:6px">File name</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input id="save-filename-input" type="text" class="plant-search" style="flex:1;margin:0"
            value="${escHtml(defaultFileName().replace(/\.json$/, ''))}"
            placeholder="garden-plan">
          <span style="font-size:0.82rem;color:var(--text-muted)">.json</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="save-modal-cancel">Cancel</button>
        <button class="btn btn-accent" id="save-modal-confirm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
      </div>
    </div>`;

  const close = () => document.body.removeChild(overlay);

  const doSave = () => {
    let name = overlay.querySelector('#save-filename-input').value.trim() || 'garden-plan';
    if (!name.endsWith('.json')) name += '.json';
    lastFileName = name;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Saved as "${name}"`);
    close();
  };

  overlay.querySelector('#save-modal-close').addEventListener('click', close);
  overlay.querySelector('#save-modal-cancel').addEventListener('click', close);
  overlay.querySelector('#save-modal-confirm').addEventListener('click', doSave);
  overlay.querySelector('#save-filename-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSave();
    if (e.key === 'Escape') close();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.body.appendChild(overlay);
  // Select the filename text for easy replacement
  setTimeout(() => overlay.querySelector('#save-filename-input').select(), 50);
}

function loadFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      applyLoadedData(data);
      lastFileName = file.name;
      toast(`Loaded "${file.name}"`);
    } catch (err) {
      toast(`Error loading file: ${err.message}`, true);
    }
  });
  input.click();
}

function applyLoadedData(data) {
  if (!data.version) throw new Error('Invalid file format (missing version)');

  // Future: handle migrations based on data.version
  state.beds = (data.beds || []).map(b => ({
    id: b.id || uid(),
    name: b.name || 'Bed',
    width: clamp(b.width || 4, MIN_BED_DIM, MAX_BED_DIM),
    height: clamp(b.height || 4, MIN_BED_DIM, MAX_BED_DIM),
    grid: b.grid || {},
  }));
  state.targets = data.targets || {};
  render();
}

function newPlan() {
  if (state.beds.length === 0 || confirm('Start a new plan? This will clear your current layout.')) {
    state.beds = [];
    state.targets = {};
    state.selectedPlant = null;
    render();
    renderSidebar();
    document.getElementById('eraser-btn').classList.remove('selected');
  }
}

/* ── Toast ── */
function toast(msg, error = false) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast' + (error ? ' error' : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) container.removeChild(el); }, 3000);
}

/* ── Auto-save to localStorage ── */
function autoSave() {
  try {
    localStorage.setItem('sfg_plan', JSON.stringify(buildSaveData()));
  } catch {}
}

function autoLoad() {
  try {
    const raw = localStorage.getItem('sfg_plan');
    if (raw) applyLoadedData(JSON.parse(raw));
  } catch {}
}

/* ── Escape helper ── */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Init ── */
function init() {
  // Quick-size buttons
  const qs = document.getElementById('quick-sizes');
  for (const s of COMMON_SIZES) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm';
    btn.textContent = s.label;
    btn.title = `Add a ${s.w}×${s.h} bed`;
    btn.addEventListener('click', () => addBed(s.w, s.h));
    qs.appendChild(btn);
  }

  // Add bed (custom)
  document.getElementById('add-bed-btn').addEventListener('click', () => addBed(4, 4));

  // Save/load/new
  document.getElementById('save-btn').addEventListener('click', saveToFile);
  document.getElementById('load-btn').addEventListener('click', loadFromFile);
  document.getElementById('new-btn').addEventListener('click', newPlan);

  // Eraser
  document.getElementById('eraser-btn').addEventListener('click', selectEraser);

  // Plant search
  document.getElementById('plant-search').addEventListener('input', renderSidebar);

  // Sidebar
  renderSidebar();

  // Auto-load previous session
  autoLoad();
  if (state.beds.length === 0) {
    // Start with one default bed
    addBed(4, 8);
  } else {
    render();
  }

  // Auto-save on changes
  document.addEventListener('click', debounce(autoSave, 500));
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

document.addEventListener('DOMContentLoaded', init);
