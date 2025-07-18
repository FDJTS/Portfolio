require('dotenv').config();
const express = require('express');
const { MailtrapClient } = require('mailtrap');
const { validate } = require('deep-email-validator');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.static('public'));
app.use(express.json());


const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: { status: 'error', message: 'يرجى الانتظار قليلاً قبل إعادة الإرسال.' }
});
app.use('/send-email', limiter);


app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});


// Function to verify reCAPTCHA
async function verifyRecaptcha(token) {
   const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
   const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${token}`;


   const response = await fetch(recaptchaUrl, { method: 'POST' });
   const result = await response.json();


   return result.success;
}


// Endpoint to handle form submission and send email
app.post('/send-email', async (req, res) => {
   const { name = '', email = '', subject = '', message = '', 'g-recaptcha-response': recaptchaToken } = req.body;


   // تحقق من صحة الحقول
   if (!name || !email || !subject || !message || !recaptchaToken) {
       return res.status(400).json({ status: 'error', message: 'Missing required fields!' });
   }
   if (name.length < 2 || name.length > 40) {
       return res.status(400).json({ status: 'error', message: 'يرجى إدخال اسم صحيح.' });
   }
   if (subject.length < 2 || subject.length > 100) {
       return res.status(400).json({ status: 'error', message: 'يرجى إدخال موضوع مناسب.' });
   }
   if (message.length < 10 || message.length > 2000) {
       return res.status(400).json({ status: 'error', message: 'يرجى كتابة رسالة مناسبة.' });
   }


   // Verify the reCAPTCHA token
   const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
   if (!isRecaptchaValid) {
       return res.status(400).json({
           status: 'error',
           message: 'reCAPTCHA verification failed. Please try again.'
       });
   }


   // Validate the email
   const validationResult = await validate(email);


   if (!validationResult.valid) {
       return res.status(400).json({
           status: 'error',
           message: 'Email is not valid. Please try again!',
           reason: validationResult.reason
       });
   }


   // سجل الرسالة في ملف
   fs.appendFileSync('messages.log',
     `${new Date().toISOString()} | ${name} | ${email} | ${subject} | ${message}\n`, 'utf8');


   // Configure mailtrap client and define sender
   const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });
   const sender = { name: "FDJTS", email: "fdjts1@gmail.com" };


   // Send email
   try {
       const response = await client.send({
           from: sender,
           to: [{ email: "fdjts1@gmail.com" }],
           subject: subject,
           text: `From: ${name}\nEmail: ${email}\n\n${message}`,
       });


       res.status(200).json({
           status: 'success',
           message: 'Email successfully sent'
       });
   } catch (error) {
       res.status(500).json({ status: 'error', message: 'Failed to send email due to server error.' });
   }


});


app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});