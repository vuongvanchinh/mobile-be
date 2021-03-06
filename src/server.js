require('dotenv').config()
const express = require('express')
const db = require('./config/db')
const bodyParser = require('body-parser')
const boolParser = require('express-query-boolean');
const cors = require('cors')
// route
const userRoute = require('./modules/user/user.route')
const motelRouter = require('./modules/motel/motel.route')
const notiRoute = require('./modules/noti/noti.route')
const auth = require('./middleware/auth')
const swagger = require('./utils/swagger')
const motelSocket = require("./modules/motel/motel.socket")
const morgan = require('morgan')

morgan(':method :url :status :res[content-length] - :response-time ms')
const app = express()
const http = require('http')
// app.use(morgan());
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,  {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });
io.on('connection', (socket) => {
    console.log('a user connected');
    motelSocket(socket)
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});



require('dotenv').config()




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



app.use('/api', notiRoute)
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
server.listen(process.env.PORT)