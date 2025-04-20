// Données en mémoire
let clients = [];
let devisLists = { envoyes: [], signes: [], encours: [] };

// Initialiser Chart.js
const ctx = document.getElementById('ca-chart').getContext('2d');
const caChart = new Chart(ctx, {
  type: 'bar',
  data: { labels: [], datasets: [{ label: 'CA par client (€)', data: [], backgroundColor: 'rgba(75,192,192,0.6)' }] },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Helpers
function sumForClient(name) {
  return ['envoyes','signes','encours']
    .flatMap(s => devisLists[s])
    .filter(d => d.client === name)
    .reduce((acc,d) => acc + d.amount, 0);
}

function updateClientSelect() {
  const sel = document.getElementById('devis-client');
  sel.innerHTML = '<option value="" disabled selected>-- choisir --</option>';
  clients.forEach((c,i) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  // Option création
  const optNew = document.createElement('option');
  optNew.value = '__NEW__';
  optNew.textContent = '➕ Nouveau client';
  sel.appendChild(optNew);
}

// Render global
function render() {
  renderClients();
  renderChart();
  renderDevis();
  updateClientSelect();
}

// Rendu clients
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';
  clients.forEach((name,i) => {
    const total = sumForClient(name);
    const card = document.createElement('div');
    card.className = 'client-card';
    card.innerHTML = `
      <span>${name} - ${total}€</span>
      <button class="delete-btn" data-index="${i}">Supprimer</button>
    `;
    list.appendChild(card);
  });
}

// Rendu Chart CA
function renderChart() {
  caChart.data.labels = clients;
  caChart.data.datasets[0].data = clients.map(sumForClient);
  caChart.update();
}

// Rendu devis
function renderDevis() {
  ['envoyes','signes','encours'].forEach(status => {
    const col = document.getElementById(`${status}-column`);
    col.querySelectorAll('.card').forEach(n=>n.remove());
    devisLists[status].forEach((d,i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span>${d.name} (${d.amount}€) - ${d.client}</span>
        <button class="delete-btn" data-status="${status}" data-index="${i}">✕</button>
      `;
      col.appendChild(card);
    });
  });
}

// Gestion du formulaire devis
document.getElementById('devis-client').onchange = e => {
  document.getElementById('new-client-wrapper').style.display =
    e.target.value === '__NEW__' ? 'block' : 'none';
};

document.getElementById('add-devis-btn').onclick = () => {
  const sel = document.getElementById('devis-client');
  let client = sel.value;
  if (client === '__NEW__') {
    client = document.getElementById('new-client-name').value.trim();
    if (!client) { alert('Entrez un nom de nouveau client'); return; }
    clients.push(client);
  }
  const name = document.getElementById('devis-name').value.trim();
  const amount = parseFloat(document.getElementById('devis-amount').value);
  if (!name || isNaN(amount)) { alert('Nom et montant valides requis'); return; }
  const status = document.getElementById('devis-status').value;
  devisLists[status].push({ name, amount, client });
  // Reset form
  sel.value = '';
  document.getElementById('new-client-name').value = '';
  document.getElementById('new-client-wrapper').style.display = 'none';
  document.getElementById('devis-name').value = '';
  document.getElementById('devis-amount').value = '';
  render();
};

// Suppression devis/card via délégation
document.querySelector('.devis-section').onclick = e => {
  if (!e.target.classList.contains('delete-btn')) return;
  const status = e.target.dataset.status;
  const idx = parseInt(e.target.dataset.index, 10);
  if (status != null) {
    devisLists[status].splice(idx, 1);
    render();
  }
};

// Suppression client
document.getElementById('clients-list').onclick = e => {
  if (!e.target.classList.contains('delete-btn')) return;
  clients.splice(e.target.dataset.index, 1);
  // Supprimer aussi les devis orphelins
  ['envoyes','signes','encours'].forEach(status => {
    devisLists[status] = devisLists[status].filter(d => d.client !== clients[e.target.dataset.index]);
  });
  render();
};

// Initial render
render();
