import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

//ERROR MIDDLERWARE
import notFound from './middleware/notfound-middleware';
import errorHandlerMiddleware from './middleware/err-handler';

//ROUTERS
import authRouter from './routes/auth-route';

dotenv.config();
const app = express();

//BOILERPLATE MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//ROUTES
app.use('/api/v1/auth', authRouter);

//ERROR MIDDLEWARE
app.use(notFound);
app.use(errorHandlerMiddleware);

//STARTING THE SERVER
const startServer = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

startServer();
