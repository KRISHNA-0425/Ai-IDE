import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import projectRouter from './routes/project.route.js';

dotenv.config();

const port = process.env.PORT

const app = express();

app.use(express.json());
app.use("/api/project", projectRouter)

app.get('/', (_, res) => {
    res.send('hello from project');
})


const startServer = () => {
    connectDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`project started at port: ${port}`);
            });
        })
        .catch((e) => console.error(e));
}

startServer();