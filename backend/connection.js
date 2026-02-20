const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongoUrl = process.env.mongo_uri || process.env.mongodb_url || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskapp'

async function startInMemoryMongo() {
    const mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    console.log('Started in-memory MongoDB at', uri)
    return { mongod, uri }
}

async function connectDB() {
    try {
        await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 })
        console.log('DB connected to', mongoUrl)
        return mongoose
    } catch (err) {
        console.error('DB connection error', err.message || err)
        // Fallback to in-memory DB in non-production environments
        if (process.env.NODE_ENV === 'production') throw err
        try {
            const { mongod, uri } = await startInMemoryMongo()
            await mongoose.connect(uri)
            console.log('DB connected to in-memory MongoDB')
            mongoose._inMemoryServer = mongod
            return mongoose
        } catch (err2) {
            console.error('Failed to start in-memory MongoDB', err2)
            throw err2
        }
    }
}

module.exports = connectDB