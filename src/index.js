const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { authRouter } = require('./routers/authRouter');
const { userRouter } = require('./routers/userRouter');
const { driverRouter } = require('./routers/driverRouter');
const { loadRouter } = require('./routers/loadRouter');

const app = express();

const PORT = process.env.PORT || 8080;
const DB_CON = process.env.DBCON || 'mongodb+srv://d-symonik:root@cluster0.tejdm15.mongodb.net/UBER_Service?retryWrites=true&w=majority';

mongoose.connect(DB_CON);

app.use(express.json());
app.use(morgan('tiny'));

app.use('/api/auth', authRouter);
app.use('/api/users/me', userRouter);
app.use('/api/trucks', driverRouter);
app.use('/api/loads', loadRouter);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is working on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
