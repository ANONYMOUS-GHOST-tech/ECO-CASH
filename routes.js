const express = require('express');
const router = express.Router();
const auth = require('./middleware');
const store = require('./dataStore');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await store.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single transaction
router.get('/:id', async (req, res) => {
  try {
    const tx = await store.getTransactionById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create transaction
router.post('/', auth, async (req, res) => {
  try {
    const { userId, userName, amount, description } = req.body;
    if (!userId || !userName || amount === undefined) {
      return res.status(400).json({ error: 'Missing userId, userName, or amount' });
    }
    const newTx = await store.createTransaction({ userId, userName, amount, description });
    req.io.emit('newTransaction', newTx);
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update status (for bot)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['valid', 'invalid'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "valid" or "invalid"' });
    }
    const updatedTx = await store.updateTransactionStatus(req.params.id, status);
    if (!updatedTx) return res.status(404).json({ error: 'Transaction not found' });

    req.io.emit('statusUpdated', {
      transactionId: updatedTx.id,
      status: updatedTx.status,
      updatedAt: updatedTx.updatedAt
    });

    res.json({ message: `Marked as ${status}`, transaction: updatedTx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
