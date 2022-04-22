const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors')

const { getSecret } = require('./secrets');
const usersRoute = require('./routes/users');
// const mailRoute = require('./routes/mail')

mongoose.Promise = global.Promise;
mongoose.connect(getSecret('dbUri')).then(
  () => {
    console.log('Connected to mongoDB');
  },
  (err) => console.log('Error connecting to mongoDB', err)
);

const app = express();
app.use(cors())
const port = process.env.PORT || 8000;

let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  next();
}

app.use(allowCrossDomain);

app.use(bodyParser.json());

app.use(cookieParser());
app.use('/', usersRoute)
// app.use('/api/users', usersRoute);
// app.use('/api/mail', mailRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app };
