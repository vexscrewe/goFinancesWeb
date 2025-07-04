const newTransactionBtn = document.getElementById('new-transaction-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const submitBtn = document.getElementById('submit-transaction');
const typeEntrada = document.getElementById('type-entrada');
const typeSaida = document.getElementById('type-saida');

let transactions = [];

// Abrir/fechar modal
newTransactionBtn.onclick = () => modal.classList.remove('hidden');
closeModalBtn.onclick = () => modal.classList.add('hidden');

// Seleção de tipo
[typeEntrada, typeSaida].forEach(btn => {
  btn.onclick = () => {
    typeEntrada.classList.toggle('active');
    typeSaida.classList.toggle('active');
  };
});

// Formulário de transação
submitBtn.onclick = () => {
  const title = document.getElementById('input-title').value;
  let amount = parseFloat(document.getElementById('input-amount').value);
  const category = document.getElementById('input-category').value;
  const date = new Date().toLocaleDateString('pt-BR');

  if (!title || isNaN(amount) || !category) return;
  if (typeSaida.classList.contains('active')) amount = -amount;

  const transaction = { title, amount, category, date };
  transactions.push(transaction);
  updateUI();
  modal.classList.add('hidden');
  clearForm();
};

function clearForm() {
  document.getElementById('input-title').value = '';
  document.getElementById('input-amount').value = '';
  document.getElementById('input-category').value = '';
  typeEntrada.classList.add('active');
  typeSaida.classList.remove('active');
}

function updateUI() {
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
    transactions.length > 0 ? `Saldo calculado` : 'Sem transações';

  // Preencher tabela
  const tbody = document.getElementById('transactions-body');
  tbody.innerHTML = '';
  transactions.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.title}</td>
      <td class="${t.amount < 0 ? 'saida' : ''}">${formatBRL(t.amount)}</td>
      <td>${t.category}</td>
      <td>${t.date}</td>
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