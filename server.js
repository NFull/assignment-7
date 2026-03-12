const express = require('express');
const { db, Track } = require('./database/setup');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

const coursesValidation = [
  body('songTitle')
    .isString()
    .notEmpty()
    .withMessage('Song Title must be a string'),

  body('artistName')
    .isString()
    .notEmpty()
    .withMessage('Artist Name must be a string'),

  body('albumName')
    .isString()
    .notEmpty()
    .withMessage('Album Name must be a string'),

  body('genre')
    .isString()
    .notEmpty()
    .withMessage('Genre must be a string'),

  body('duration')
    .isInt({ gt:0 })
    .withMessage('Duration must be a positive integer (seconds)'),

  body('releaseYear')
  .isInt({ gt:0 })
  .withMessage('Release Year must be a positive integer')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      error: 'Validation failed',
      messages: errorMessages
    });
  }

  if(req.body.completed === undefined) {
    req.body.completed = false;
  }

  next();
};

const requestLogger = (req, res, next) => {
  const timeStamp = new Date().toISOString();
  console.log(`[${timeStamp}] ${req.method} ${req.originalUrl}`)

  if(req.method === 'POST' || req.method === 'PUT') {
    console.log("Request Body", JSON.stringify(req.body, null, 2))
  }

  next();
};

app.use(requestLogger);

// GET all tracks
app.get('/tracks', async (req, res) => {
    try {
        const tracks = await Track.findAll();
        res.json(tracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

// GET track by ID
app.get('/tracks/:id', async (req, res) => {
    try {
        const track = await Track.findByPk(req.params.id);
        
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }
        
        res.json(track);
    } catch (error) {
        console.error('Error fetching track:', error);
        res.status(500).json({ error: 'Failed to fetch track' });
    }
});

// POST new track
app.post('/tracks', coursesValidation, handleValidationErrors, async (req, res) => {
    try {
        const { songTitle, artistName, albumName, genre, duration, releaseYear } = req.body;
        
        const newTrack = await Track.create({
            songTitle,
            artistName,
            albumName,
            genre,
            duration,
            releaseYear
        });
        
        res.status(201).json(newTrack);
    } catch (error) {
        console.error('Error creating track:', error);
        res.status(500).json({ error: 'Failed to create track' });
    }
});

// PUT update track
app.put('/tracks/:id', coursesValidation, handleValidationErrors, async (req, res) => {
    try {
        const { songTitle, artistName, albumName, genre, duration, releaseYear } = req.body;
        
        const [updatedRowsCount] = await Track.update(
            { songTitle, artistName, albumName, genre, duration, releaseYear },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }
        
        const updatedTrack = await Track.findByPk(req.params.id);
        res.json(updatedTrack);
    } catch (error) {
        console.error('Error updating track:', error);
        res.status(500).json({ error: 'Failed to update track' });
    }
});

// DELETE track
app.delete('/tracks/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Track.destroy({
        where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }
        
        res.json({ message: 'Track deleted successfully' });
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});