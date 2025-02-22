const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Initialize express app
const app = express();
dotenv.config();

// Config
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'enobridge';
const collectionName = 'receipts';

let db = null;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.post('/api/receipts', async (req, res) => {
  try {
    const result = await db.collection(collectionName).insertOne(req.body);
    res.status(201).json({ ...req.body, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/receipts/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const receipts = await db.collection(collectionName)
      .find({
        $or: [{ from: address }, { to: address }]
      })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/receipts/:id', async (req, res) => {
  try {
    const receipt = await db.collection(collectionName)
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB Connection
async function connectDB() {
  try {
    const client = await MongoClient.connect(mongoUri);
    db = client.db(dbName);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Start server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});