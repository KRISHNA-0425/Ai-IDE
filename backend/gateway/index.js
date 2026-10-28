import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import proxy from 'express-http-proxy'
import { isAuth } from './middleware/isAuth.js'
import { currentUser } from './controllers/user.controller.js'
dotenv.config();


// Constant variables
const port = process.env.PORT || 3000;
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const authService = process.env.AUTH_SERVICE || 'http://localhost:8001';

const app = express();

// middlewares
app.use(cors({
    origin: frontendURL,
    credentials: true,
}));

app.use(cookieParser());
app.use(morgan('dev')); // creates logs of the requests

// Proxy auth requests with preserved path
app.use('/api/auth', proxy(authService, {
    proxyReqPathResolver: (req) => {
        return `/api/auth${req.url}`;
    }
}));

// isAuth middlware
app.get('/api/currentUser', isAuth, currentUser)

app.use(express.json());

// Routes
app.get('/', (_, res) => {
    res.send('hello from gateway');
});


app.listen(port, () => {
    console.log(`gateway started at port: ${port}`);
});
