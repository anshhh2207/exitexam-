var express=require('express');
var cors=require('cors');
var dotenv=require('dotenv');
dotenv.config();
 var path = require('path')

 const port=process.env.port
const connectDB = require('./connection')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// simple request logger to help debug frontend requests
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.originalUrl)
    if (req.method !== 'GET') console.log('Body:', req.body)
    next()
})

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true
    })
)

const sessionSecret = process.env.SESSION_SECRET || 'keyboard cat'

const userRoute = require('./route/userroutes')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
const HOST = process.env.HOST || '0.0.0.0'

connectDB()
    .then((mongoose) => {
        // create session store using the active MongoDB client so connect-mongo won't try to reconnect
        const client = mongoose.connection.getClient()
        app.use(
            session({
                secret: sessionSecret,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({ client }),
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production'
                }
            })
        )

        app.use('/api', userRoute)

        // simple health/debug endpoint
        app.get('/api/ping', (req, res) => res.json({ ok: true }))

        app.listen(port, HOST, () => {
            console.log(`Server is up and running on ${HOST}:${port}`)
        })
    })
    .catch((err) => {
        console.error('Failed to start server due to DB connection error')
        process.exit(1)
    })