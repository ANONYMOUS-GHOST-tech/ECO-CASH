const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data.json');

async function initData() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify({ transactions: [] }, null, 2));
  }
}

async function readData() {
  await initData();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

async function getAllTransactions() {
  const data = await readData();
  return data.transactions.sort((a, b) => b.createdAt - a.createdAt);
}

async function getTransactionById(id) {
  const data = await readData();
  return data.transactions.find(tx => tx.id === id);
}

async function createTransaction({ userId, userName, amount, description = '' }) {
  const data = await readData();
  const newTx = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    userId,
    userName,
    amount: Number(amount),
    description,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  data.transactions.push(newTx);
  await writeData(data);
  return newTx;
}

async function updateTransactionStatus(id, status) {
  const data = await readData();
  const tx = data.transactions.find(t => t.id === id);
  if (!tx) return null;
  tx.status = status;
  tx.updatedAt = Date.now();
  await writeData(data);
  return tx;
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus
};
