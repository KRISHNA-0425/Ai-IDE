import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import proxy from 'express-http-proxy'
dotenv.config();


// Constant variables
const port = process.env.PORT
const frontendURL = process.env.frontendURL
const authService = process.env.AUTH_SERVICE

const app = express();

// middlewares
app.use(express.json());

app.use(cors({
    origin: frontendURL,
    credentials: true,
}))

app.use(cookieParser());
app.use(morgan('dev')); // creates logs of the requests

app.use('/api/auth', proxy(authService))
// Routes
app.get('/', (_, res) => {
    res.send('hello from gateway');
})


app.listen(port, () => {
    console.log(`gateway started at port: ${port}`);
});
