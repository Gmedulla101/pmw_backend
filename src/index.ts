import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

//BOILERPLATE MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const startServer = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

startServer();
