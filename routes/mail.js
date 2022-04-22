const express = require("express");
const nodemailer = require('nodemailer');
const router = express.Router();
const {getSecret} = require('../secrets')


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
    console.log("entered")
    const mailData = {
        from: 'maileranvtangertevekutyun@gmail.com',
        to: 'anvtang.ertevekutyun@mail.ru',
        subject: 'Թեստի արդյունքներ - ' + req.body.name,
        html: '<h4>Թեստի արդյունքներ </h4><br>Անուն: ' + req.body.name + '<br/>Ճիշտ պատասխանների քանակ: ' + req.body.correctAnswers +
            '<br>Ամսաթիվ: ' + req.body.date,
    };

    console.log(mailData.json())

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(info)
        res.status(200).send({ message: "Mail send", message_id: info.messageId });
    });
});

module.exports = router;

