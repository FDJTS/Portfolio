require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { validate } = require('deep-email-validator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

app.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }

  const emailValidation = await validate(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD
    }
  });

  const htmlBody = `
    <h3>📩 رسالة جديدة من ${name}</h3>
    <p><strong>الإيميل:</strong> ${email}</p>
    <p><strong>الموضوع:</strong> ${subject}</p>
    <p><strong>الرسالة:</strong><br>${message}</p>
  `;

  try {
    // إرسال للمطور
    await transporter.sendMail({
      from: `"Portfolio Website" <${process.env.MY_EMAIL}>`,
      to: 'fdjts1@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: htmlBody
    });

    // إرسال نسخة للمرسل
    await transporter.sendMail({
      from: `"FDJTS Portfolio" <${process.env.MY_EMAIL}>`,
      to: email,
      subject: 'Thanks for contacting us! شكراً لتواصلك معنا',
      html: `
        <h3>Hello ${name},</h3>
        <p>Thanks for your message! We'll get back to you as soon as possible.</p>
        <hr>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <br>
        <p>شكراً لتواصلك معنا، سيتم الرد عليك قريباً إن شاء الله.</p>
      `
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('SendMail Error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
