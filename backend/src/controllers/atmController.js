const mongoose = require('mongoose');
const { ATM, Transaction } = require('../models');
const { findDispensation } = require('../utils/algorithm');

async function getATM() {
  let atm = await ATM.findOne({ key: 'main' });
  if (!atm) {
    atm = await ATM.create({
      key: 'main',
      denominations: [
        { denomination: 2000, quantity: 4 },
        { denomination: 500, quantity: 40 },
        { denomination: 200, quantity: 20 },
        { denomination: 100, quantity: 30 },
        { denomination: 50, quantity: 10 },
      ],
    });
  }
  return atm;
}

function formatInventory(atm) {
  return {
    id: atm._id,
    denominations: atm.denominations.map((x) => ({
      denomination: x.denomination,
      quantity: x.quantity,
      value: x.denomination * x.quantity,
    })),
    balance: atm.denominations.reduce((s, x) => s + x.denomination * x.quantity, 0),
    totalNotes: atm.denominations.reduce((s, x) => s + x.quantity, 0),
    updatedAt: atm.updatedAt,
  };
}

async function performWithdrawal(userId, amount, syncId) {
  const executeLogic = async (session = null) => {
    const opts = session ? { session } : {};
    if (syncId) {
      const existing = await Transaction.findOne({ syncId }, null, opts);
      if (existing) return { transaction: existing, replayed: true };
    }
    const atm = await ATM.findOne({ key: 'main' }, null, opts);
    if (!atm) throw Object.assign(new Error('ATM not initialized'), { status: 500 });

    const notes = findDispensation(
      amount,
      atm.denominations.map((x) => ({ denomination: x.denomination, quantity: x.quantity }))
    );
    if (!notes) {
      throw Object.assign(new Error('Exact amount cannot be dispensed from current notes'), {
        status: 409,
        code: 'CANNOT_DISPENSE',
      });
    }

    const before = atm.denominations.reduce((s, x) => s + x.denomination * x.quantity, 0);
    const updated = atm.denominations.map((x) => {
      const used = notes.find((n) => n.denomination === x.denomination);
      return {
        denomination: x.denomination,
        quantity: x.quantity - (used?.quantity || 0),
      };
    });

    atm.denominations = updated;
    atm.updatedAt = new Date();
    await atm.save(opts);

    const after = before - amount;
    const tx = await Transaction.create(
      [
        {
          userId,
          amount,
          dispensedNotes: notes,
          balanceBefore: before,
          balanceAfter: after,
          status: 'SUCCESS',
          syncId,
        },
      ],
      opts
    );

    return { transaction: tx[0], replayed: false };
  };

  const db = mongoose.connection;
  let sessionDb;
  try {
    sessionDb = await db.startSession();
    let result;
    await sessionDb.withTransaction(async () => {
      result = await executeLogic(sessionDb);
    });
    return result;
  } catch (err) {
    if (
      err?.code === 20 ||
      err?.codeName === 'IllegalOperation' ||
      (err?.message && err.message.includes('replica set'))
    ) {
      return await executeLogic();
    }
    throw err;
  } finally {
    if (sessionDb) await sessionDb.endSession();
  }
}

async function getInventory(req, res, next) {
  try {
    const atm = await getATM();
    res.json(formatInventory(atm));
  } catch (error) {
    next(error);
  }
}

async function withdraw(req, res, next) {
  try {
    const amount = Number(req.body.amount);
    const syncId = req.body.syncId ? String(req.body.syncId) : undefined;

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive whole number' });
    }
    if (amount % 50 !== 0) {
      return res.status(400).json({ message: 'Amount must be a multiple of ₹50' });
    }

    const result = await performWithdrawal(req.session.userId, amount, syncId);
    res.status(result.replayed ? 200 : 201).json(result);
  } catch (error) {
    next(error);
  }
}

async function sync(req, res, next) {
  try {
    const items = Array.isArray(req.body.transactions) ? req.body.transactions : [];
    if (items.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 queued transactions per sync' });
    }

    const results = [];
    for (const item of items) {
      try {
        const amount = Number(item.amount);
        const syncId = String(item.syncId || '');
        if (!syncId || !Number.isInteger(amount) || amount <= 0) {
          throw Object.assign(new Error('Invalid offline transaction'), { status: 400 });
        }
        const r = await performWithdrawal(req.session.userId, amount, syncId);
        results.push({ syncId, status: 'SYNCED', transaction: r.transaction });
      } catch (e) {
        results.push({
          syncId: String(item.syncId || ''),
          status: e.code === 'CANNOT_DISPENSE' ? 'CONFLICT' : 'FAILED',
          message: e.message,
        });
      }
    }

    const atm = await getATM();
    res.json({ results, inventory: formatInventory(atm) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventory,
  withdraw,
  sync,
  getATM,
  formatInventory,
  performWithdrawal,
};
