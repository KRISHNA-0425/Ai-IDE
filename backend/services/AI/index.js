import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import aiRouter from './routes/ai.routes.js';
dotenv.config();

const port = process.env.PORT || 8004;

const app = express();

app.use(express.json());

// Management routes
app.use('/api/ai', aiRouter);

app.get('/', (_, res) => {
    res.send('hello from ai');
});

const startServer = () => {
    connectDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`ai service started at port: ${port}`);
            });
        })
        .catch((e) => console.error(e));
};

startServer();
