const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const dbUri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.apojw.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(dbUri)

const reactionSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});
const Reaction = mongoose.model('Reaction', reactionSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/apod', async (req, res) => {
  try {
    const nasaApiKey = process.env.NASA_API_KEY;
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`);
    const { date, explanation, hdurl, title } = response.data;
    res.json({ date, explanation, hdurl, title });
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/reaction', async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const newReaction = new Reaction({ rating, comment });
    await newReaction.save();
    return res.json({ success: true, message: 'Thank you for your reaction!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});