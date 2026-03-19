// ─── STORAGE ─────────────────────────────────────────────
const STORAGE_KEY = 'finance-dashboard-v4';

// ─── IDS DINÂMICOS ───────────────────────────────────────
let dynamicId = 1000;
let saveTimeout;

// ─── SALVAR ──────────────────────────────────────────────
function saveData() {
  const data = {
    inputs: {},
    campos: [],
    nomesFixos: {}
  };

  // salvar valores
  document.querySelectorAll('input[type="number"]').forEach(input => {
    data.inputs[input.id] = input.value;
  });

  // salvar nomes (fixos + dinâmicos)
  document.querySelectorAll('.input-row').forEach(row => {
    const desc = row.querySelector('.desc');
    const input = row.querySelector('input');

    if (!desc || !input) return;

    if (row.hasAttribute('data-dynamic')) {
      data.campos.push({
        id: input.id,
        tipo: input.classList[0],
        nome: desc.innerText
      });
    } else {
      data.nomesFixos[input.id] = desc.innerText;
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── CARREGAR ────────────────────────────────────────────
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    // recriar dinâmicos
    if (data.campos) {
      data.campos.forEach(c => {
        criarCampoDOM(c.tipo, c.nome, c.id, true);
      });
    }

    // restaurar valores
    Object.keys(data.inputs || {}).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = data.inputs[id];
    });

    // restaurar nomes FIXOS (faltava isso!)
    Object.keys(data.nomesFixos || {}).forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;

      const row = input.closest('.input-row');
      if (!row) return;

      const desc = row.querySelector('.desc');
      if (desc) {
        desc.innerText = data.nomesFixos[id];
        atualizarArrayNome(id, data.nomesFixos[id]);
      }
    });

  } catch (e) {
    console.error('Erro ao carregar', e);
  }
}

// ─── RESET ───────────────────────────────────────────────
function clearData() {
  if (confirm('Apagar todos os dados?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ─── ADD CAMPO ───────────────────────────────────────────
function addCampo(tipo) {
  const nome = prompt("Nome do campo:");
  if (!nome) return;

  const id = tipo + dynamicId++;

  criarCampoDOM(tipo, nome, id, false);

  recalc();
  saveData();
}

// ─── CRIAR DOM ───────────────────────────────────────────
function criarCampoDOM(tipo, nome, id, isLoad) {
  const container = document.getElementById(`campos-dinamicos-${tipo}`);
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'input-row';
  div.id = 'row-' + id;
  div.setAttribute('data-dynamic', 'true');

  div.innerHTML = `
    <span class="desc" contenteditable="true">${nome}</span>

    <input type="number"
      class="${tipo}"
      id="${id}"
      value="0"
      min="0"
      step="0.01">

    <button onclick="removeCampo('${id}')"
      style="background:#FF1744;color:white;border:none;border-radius:6px;padding:2px 6px;cursor:pointer;">
      X
    </button>
  `;

  container.appendChild(div);

  // arrays
  if (tipo === 'entrada') {
    ENT_IDS.push(id);
    ENT_DESC.push(nome);
  } else if (tipo === 'ess') {
    ESS_IDS.push(id);
    ESS_DESC.push(nome);
  } else {
    NAO_IDS.push(id);
    NAO_DESC.push(nome);
  }

  if (!isLoad) saveData();
}

// ─── ATUALIZAR ARRAY ─────────────────────────────────────
function atualizarArrayNome(id, nome) {
  let index;

  index = ENT_IDS.indexOf(id);
  if (index > -1) ENT_DESC[index] = nome;

  index = ESS_IDS.indexOf(id);
  if (index > -1) ESS_DESC[index] = nome;

  index = NAO_IDS.indexOf(id);
  if (index > -1) NAO_DESC[index] = nome;
}

// ─── REMOVER CAMPO ───────────────────────────────────────
function removeCampo(id) {
  if (!confirm('Excluir este campo?')) return;

  const row = document.getElementById('row-' + id);
  if (row) row.remove();

  removerDoArray(id);

  recalc();
  saveData();
}

// ─── REMOVER ARRAY ───────────────────────────────────────
function removerDoArray(id) {
  let index;

  index = ENT_IDS.indexOf(id);
  if (index > -1) {
    ENT_IDS.splice(index, 1);
    ENT_DESC.splice(index, 1);
    return;
  }

  index = ESS_IDS.indexOf(id);
  if (index > -1) {
    ESS_IDS.splice(index, 1);
    ESS_DESC.splice(index, 1);
    return;
  }

  index = NAO_IDS.indexOf(id);
  if (index > -1) {
    NAO_IDS.splice(index, 1);
    NAO_DESC.splice(index, 1);
  }
}

// ─── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  loadData();
  recalc();

  // salvar inputs
  document.addEventListener('input', (e) => {

    // INPUT NUMÉRICO
    if (e.target.matches('input[type="number"]')) {
      recalc();
      saveData();
    }

    // TEXTO EDITÁVEL (DESC)
    if (e.target.classList.contains('desc')) {
      clearTimeout(saveTimeout);

      saveTimeout = setTimeout(() => {
        const row = e.target.closest('.input-row');
        if (!row) return;

        const input = row.querySelector('input');
        if (!input) return;

        atualizarArrayNome(input.id, e.target.innerText);

        saveData();
        recalc();
      }, 300);
    }

  });

});