// Captura da URL da API
const apiUrl = document.body.dataset.apiUrl;

// Elementos do DOM
const newTransactionBtn = document.getElementById('new-transaction-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const submitBtn = document.getElementById('submit-transaction');
const typeEntrada = document.getElementById('type-entrada');
const typeSaida = document.getElementById('type-saida');
const tbody = document.getElementById('transactions-body');

let transactions = [];

// Abrir/fechar modal
newTransactionBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

// Seleção de tipo
[typeEntrada, typeSaida].forEach(btn => {
  btn.addEventListener('click', () => {
    typeEntrada.classList.toggle('active');
    typeSaida.classList.toggle('active');
  });
});

// Fetch de transações
async function fetchTransactions() {
  const res = await fetch(apiUrl);
  return await res.json();
}

async function createTransactionAPI(transaction) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return await res.json();
}

async function deleteTransactionAPI(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
}

// Carga inicial
window.addEventListener('DOMContentLoaded', async () => {
  transactions = await fetchTransactions();
  updateUI();
});

// Cadastro de nova transação
submitBtn.addEventListener('click', async () => {
  const title = document.getElementById('input-title').value;
  let amount = parseFloat(document.getElementById('input-amount').value);
  const category = document.getElementById('input-category').value;
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (!title || isNaN(amount) || !category) return;
  if (typeSaida.classList.contains('active')) amount = -amount;

  const newTx = { title, amount, category, date };
  await createTransactionAPI(newTx);
  transactions = await fetchTransactions();
  updateUI();
  modal.classList.add('hidden');
  clearForm();
});

// Delegação de eventos para ações na tabela
tbody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    await deleteTransactionAPI(id);
    transactions = await fetchTransactions();
    updateUI();
  }
  // Aqui você pode implementar edição:
  // if (e.target.classList.contains('edit-btn')) { ... }
});

function clearForm() {
  document.getElementById('input-title').value = '';
  document.getElementById('input-amount').value = '';
  document.getElementById('input-category').value = '';
  typeEntrada.classList.add('active');
  typeSaida.classList.remove('active');
}

function updateUI() {
  // Atualiza cards
  const entradaTotal = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const saidaTotal = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const total = entradaTotal + saidaTotal;

  document.getElementById('card-entrada').textContent = formatBRL(entradaTotal);
  document.getElementById('card-saida').textContent = formatBRL(Math.abs(saidaTotal));
  document.getElementById('card-total').textContent = formatBRL(total);

  document.getElementById('desc-entrada').textContent =
    transactions.filter(t => t.amount > 0).length > 0
      ? `Última entrada dia ${lastDate(transactions, true)}`
      : 'Nenhuma entrada';
  document.getElementById('desc-saida').textContent =
    transactions.filter(t => t.amount < 0).length > 0
      ? `Última saída dia ${lastDate(transactions, false)}`
      : 'Nenhuma saída';
  document.getElementById('desc-total').textContent =
    transactions.length > 0 ? `Saldo atualizado` : 'Sem transações';

  // Preenche tabela
  tbody.innerHTML = '';
  transactions.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.title}</td>
      <td class="${t.amount < 0 ? 'saida' : ''}">${formatBRL(t.amount)}</td>
      <td>${t.category}</td>
      <td>${t.date}</td>
      <td>
        <button class="btn delete-btn" data-id="${t.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function lastDate(arr, isPositive) {
  const filtered = arr.filter(t => isPositive ? t.amount > 0 : t.amount < 0);
  if (filtered.length === 0) return '';
  return filtered[filtered.length - 1].date;
}