const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {getSecret} = require('../secrets')


const User = require('../models/user');
const Session = require('../models/session');
const { authenticate } = require('../middleware/authenticate');
const { csrfCheck } = require('../middleware/csrfCheck');
const { initSession, isEmail } = require('../utils/utils');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      throw new Error('Email must be a valid email address.');
    }
    if (typeof password !== 'string') {
      throw new Error('Password must be a string.');
    }
    const user = new User({ email, password });
    const persistedUser = await user.save();
    const userId = persistedUser._id;

    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(201)
      .json({
        title: 'User Registration Successful',
        detail: 'Successfully registered new user',
        csrfToken: session.csrfToken,
      });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Registration Error',
          detail: 'Something went wrong during registration process.',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Email must be a valid email address',
          },
        ],
      });
    }
    if (typeof password !== 'string') {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Password must be a string',
          },
        ],
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    const userId = user._id;

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        title: 'Login Successful',
        detail: 'Successfully validated user credentials',
        csrfToken: session.csrfToken,
        token: session.token,
        status: 'success',
        redirectUrl: 'https://www.testanvtang.am/test'
      });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
          status: 'error'
        },
      ],
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById({ _id: userId }, { email: 1, _id: 0 });

    res.json({
      title: 'Authentication successful',
      detail: 'Successfully authenticated user',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.delete('/me', authenticate, csrfCheck, async (req, res) => {
  try {
    const { userId } = req.session;
    const { password } = req.body;
    if (typeof password !== 'string') {
      throw new Error();
    }
    const user = await User.findById({ _id: userId });

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    await Session.expireAllTokensForUser(userId);
    res.clearCookie('token');
    await User.findByIdAndDelete({ _id: userId });
    res.json({
      title: 'Account Deleted',
      detail: 'Account with credentials provided has been successfuly deleted',
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.put('/logout', authenticate, async (req, res) => {
  try {
    const { session } = req;
    await session.expireToken(session.token);
    res.clearCookie('token');

    res.json({
      title: 'Logout Successful',
      detail: 'Successfuly expired login session',
    });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Logout Failed',
          detail: 'Something went wrong during the logout process.',
          errorMessage: err.message,
        },
      ],
    });
  }
});


const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: getSecret('mail'),
    pass: getSecret('mailPass'),
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

router.post('/send', (req, res) => {
  const mailData = {
    //'anvtang.ertevekutyun@mail.ru'
    from: 'anvtangertevekutyunmailer@gmail.com',
    to: 'anvtang.ertevekutyun@mail.ru',
    subject: '?????????? ?????????????????????? - ' + req?.body?.name,
    html: '<h4>?????????? ?????????????????????? </h4><br>??????????: ' + req?.body?.name + '<br>???????? ???????????????????????? ??????????: ' + req?.body?.correctAnswers +
      '<br>??????????????: ' + req?.body?.date + '<br>??????????????????????: ' + req?.body.duration,
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: `Mail sent to ${mailData.to}`, message_id: info.messageId });
  });
});




module.exports = router;
