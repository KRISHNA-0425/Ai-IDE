import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import authRouter from './routes/auth.route.js';
dotenv.config();

const port = process.env.PORT

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter)

app.get('/', (_, res) => {
    res.send('hello from auth');
})


const startServer = () => {
    connectDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`auth started at port: ${port}`);
            });
        })
        .catch((e) => console.error(e));
}

startServer();