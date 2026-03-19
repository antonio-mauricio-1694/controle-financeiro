// ─── STORAGE ─────────────────────────────────────────────
const STORAGE_KEY = 'finance-dashboard-v3';

// ─── SALVAR ──────────────────────────────────────────────
function saveData() {
  const data = {};

  document.querySelectorAll('input[type="number"]').forEach(input => {
    data[input.id] = input.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── CARREGAR ────────────────────────────────────────────
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    Object.keys(data).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = data[id];
    });

  } catch (e) {
    console.error('Erro ao carregar', e);
  }
}

// ─── RESETAR ─────────────────────────────────────────────
function clearData() {
  if (confirm('Apagar todos os dados?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ─── AUTO SAVE + LOAD ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // carrega primeiro
  loadData();

  // recalcula depois (usa sua função original)
  if (typeof recalc === 'function') {
    recalc();
  }

  // salva sempre que mudar input
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
      saveData();
    });
  });

});


let dynamicId = 1000;

function addCampo(tipo) {
  const nome = prompt("Nome do campo:");
  if (!nome) return;

  const container = document.getElementById('campos-dinamicos-nao');

  const id = tipo + dynamicId++;

  const div = document.createElement('div');
  div.className = 'input-row';
  div.id = 'row-' + id;

  div.innerHTML = `
    <span class="desc" contenteditable="true">${nome}</span>
    <input type="number" class="${tipo}" id="${id}" value="0" min="0" step="0.01" oninput="recalc()">
    <button onclick="removeCampo('${id}')" style="background:red;color:white;border:none;border-radius:6px;padding:2px 6px;cursor:pointer;">X</button>
  `;

  container.appendChild(div);

  // adiciona no array pra entrar no cálculo
  NAO_IDS.push(id);
  NAO_DESC.push(nome);

  recalc();
  saveData();
}

function removeCampo(id) {
  const row = document.getElementById('row-' + id);
  if (row) row.remove();

  const index = NAO_IDS.indexOf(id);
  if (index > -1) {
    NAO_IDS.splice(index, 1);
    NAO_DESC.splice(index, 1);
  }

  recalc();
  saveData();
}