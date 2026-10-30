import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import managmentRouter from './routes/managment.route.js';
dotenv.config();

const port = process.env.PORT || 8003;

const app = express();

app.use(express.json());

// Management routes
app.use('/api/management', managmentRouter);

app.get('/', (_, res) => {
    res.send('hello from management');
});

const startServer = () => {
    connectDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`management service started at port: ${port}`);
            });
        })
        .catch((e) => console.error(e));
};

startServer();
