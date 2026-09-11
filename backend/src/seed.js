const connectDB = require('./config/db');
const { ATM } = require('./models');

(async () => {
  try {
    await connectDB();
    await ATM.findOneAndUpdate(
      { key: 'main' },
      {
        $set: {
          denominations: [
            { denomination: 2000, quantity: 4 },
            { denomination: 500, quantity: 40 },
            { denomination: 200, quantity: 20 },
            { denomination: 100, quantity: 30 },
            { denomination: 50, quantity: 10 },
          ],
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    console.log('ATM seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
})();
