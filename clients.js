// clients.js
const API_URL = 'http://localhost:3000/api/clients';

// DOM references
const listEl = document.getElementById('clients-list');
const btnNew = document.getElementById('new-client-btn');
const formEl = document.getElementById('client-form');
const btnCancel = document.getElementById('cancel-btn');
const inputs = {
  lastname: document.getElementById('client-lastname'),
  firstname: document.getElementById('client-firstname'),
  phone: document.getElementById('client-phone'),
  email: document.getElementById('client-email'),
  address: document.getElementById('client-address')
};
let editIndex = null;
let clients = [];

// Fetch and load clients
async function loadClients() {
  try {
    const res = await fetch(API_URL);
    clients = await res.json();
    renderClients();
  } catch (err) {
    console.error('Erreur chargement clients:', err);
  }
}

// Render clients list
function renderClients() {
  listEl.innerHTML = '';
  clients.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'client-card';
    card.innerHTML = `
      <div>
        <strong>${c.lastname} ${c.firstname}</strong><br/>
        📞 ${c.phone} | ✉️ ${c.email}<br/>
        🏠 ${c.address}
      </div>
      <div>
        <button data-id="${c.id}" class="edit-btn">✎</button>
        <button data-id="${c.id}" class="delete-btn">🗑</button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

// Open form
btnNew.addEventListener('click', () => {
  editIndex = null;
  formEl.reset();
  formEl.classList.remove('hidden');
});
btnCancel.addEventListener('click', () => {
  formEl.classList.add('hidden');
});

// Submit form (add or update)
formEl.addEventListener('submit', async e => {
  e.preventDefault();
  const clientData = {
    lastname: inputs.lastname.value.trim(),
    firstname: inputs.firstname.value.trim(),
    phone: inputs.phone.value.trim(),
    email: inputs.email.value.trim(),
    address: inputs.address.value.trim()
  };
  try {
    if (editIndex === null) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(clientData)
      });
      const newClient = await res.json();
      clients.unshift(newClient);
    } else {
      const id = clients[editIndex].id;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(clientData)
      });
      const updated = await res.json();
      clients[editIndex] = updated;
    }
    formEl.classList.add('hidden');
    renderClients();
  } catch(err) {
    console.error('Erreur sauvegarde client:', err);
  }
});

// Edit/delete delegation
listEl.addEventListener('click', async e => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('delete-btn')) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      clients = clients.filter(c => c.id != id);
      renderClients();
    } catch(err) {
      console.error('Erreur suppression client:', err);
    }
  } else if (e.target.classList.contains('edit-btn')) {
    const idx = clients.findIndex(c => c.id == id);
    const c = clients[idx];
    inputs.lastname.value = c.lastname;
    inputs.firstname.value = c.firstname;
    inputs.phone.value = c.phone;
    inputs.email.value = c.email;
    inputs.address.value = c.address;
    editIndex = idx;
    formEl.classList.remove('hidden');
  }
});

// Initial load
loadClients();
