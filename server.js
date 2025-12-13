const cookieParser = require('cookie-parser');
let cloudinary = require('cloudinary').v2;
const multer = require('multer');
let express = require('express');
let cors = require('cors')
let router = require('./routes/index.route.js')
const { default: mongoose } = require('mongoose');
require('dotenv').config();
let app = express();
let port = process.env.PORT;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });
app.use(cors({
    origin: [process.env.FRONTEND, 'http://localhost:3001', 'http://localhost:8080', 'https://luxurydreamhouse.netlify.app'],
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

mongoose.connect(process.env.MONGODB_URI).then(e => {
    console.log(`conntected to database`)
}).catch(e => {
    console.log(`database connection failed`)
})

app.use(router)

app.listen(port, () => {
    console.log(`App is Listening on port: ${port}`)
})