require('dotenv').config()
const express = require('express')
const db = require('./config/db')
const bodyParser = require('body-parser')
const boolParser = require('express-query-boolean');
const cors = require('cors')
// route
const userRoute = require('./modules/user/user.route')
const motelRouter = require('./modules/motel/motel.route')

const auth = require('./middleware/auth')
const swagger = require('./utils/swagger')

require('dotenv').config()

const app = express()

app.use(cors({
    origin: '*',
}))

app.use(
    bodyParser.json({limit: '50mb'})
)
app.use(boolParser())

// parse user to header
auth(app)

app.use('/public', express.static(__dirname + '/../public'));

// swager 
swagger(app)

db.connect()


app.get('/', (req, res) => {
    res.send({name: "chinh"})
})




app.use('/api/user', userRoute)
app.use('/api/motel', motelRouter)
app.use((req, res, next) => {
    const error = new Error("404 not found");
    error.status = 404;
    next(error);
});

// error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        message: error.message || 'Internal Server Error',
    });
});
app.listen(process.env.PORT)