const express = require('express');
const { db, Book } = require('./database/setup');

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
