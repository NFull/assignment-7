const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();

const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'database/music_library.db',
    logging: console.log
})


async function setupDatabase() {
    try {
        await db.authenticate();
        console.log('Connection to music_library database established successfully.');

        await db.sync({ force: true })
        console.log("Music_library Database and tables created successfully")

        await db.close();

    } catch(error) {
        console.error('Unable to connect to the music_library database', error);
    }
}

const Track = db.define('Track', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    songTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artistName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    albumName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER
    },
    releaseYear: {
        type: DataTypes.INTEGER
    }
});

module.exports = { db, Track };

if (require.main === module) {
    setupDatabase();
}