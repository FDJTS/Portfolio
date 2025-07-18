require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: { status: 'خطأ', message: 'يرجى الانتظار قليلاً قبل إعادة الإرسال.' }
});
app.use('/send-email', limiter);

function isValidEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

app.post('/send-email', async (req, res) => {
  const { name = '', email = '', subject = '', message = '' } = req.body;

  if (!name || name.length < 2 || name.length > 40) {
    return res.status(400).json({ status: 'خطأ', message: 'يرجى إدخال اسم صحيح.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ status: 'خطأ', message: 'يرجى إدخال بريد إلكتروني صحيح.' });
  }
  if (!subject || subject.length < 2 || subject.length > 100) {
    return res.status(400).json({ status: 'خطأ', message: 'يرجى إدخال موضوع مناسب.' });
  }
  if (!message || message.length < 10 || message.length > 2000) {
    return res.status(400).json({ status: 'خطأ', message: 'يرجى كتابة رسالة مناسبة.' });
  }

  fs.appendFileSync('messages.log',
    `${new Date().toISOString()} | ${name} | ${email} | ${subject} | ${message}\n`, 'utf8');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fdjts1@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });

  const mailToAdmin = {
    from: 'fdjts1@gmail.com',
    to: 'fdjts1@gmail.com',
    replyTo: email,
    subject: `رسالة جديدة من موقعك - ${name}`,
    text: `الاسم: ${name}\nالبريد الإلكتروني: ${email}\nالموضوع: ${subject}\n\nنص الرسالة:\n${message}\n-------------------------------\nيرجى الرد على المستخدم إذا لزم الأمر.`
  };

  const mailToUser = {
    from: 'fdjts1@gmail.com',
    to: email,
    subject: 'تم استلام رسالتك في موقع FDJTS',
    text: `مرحباً ${name},\n\nتم استلام رسالتك بنجاح على موقع FDJTS.\nسيتم الرد عليك قريباً على بريدك الشخصي.\n\nنص رسالتك:\n-----------------\n${message}\n-----------------\n\nشكراً لتواصلك معنا!`
  };

  try {
    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);
    res.json({ status: 'نجاح', message: 'تم إرسال رسالتك بنجاح! سيتم الرد عليك قريباً على بريدك الشخصي.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ status: 'خطأ', message: 'حدث خطأ أثناء إرسال الرسالة.' });
  }
});

app.listen(PORT, () => {
  console.log(`FDJTS Node backend running on port ${PORT}`);
});
نص الرسالة:
${message}
-------------------------------

يرجى الرد على المستخدم إذا لزم الأمر.
       `
   };

   // إرسال الرسالة
   transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
           console.error('فشل في الإرسال:', error);
           return res.status(500).json({ status: 'خطأ', message: 'حدث خطأ أثناء إرسال الرسالة.' });
       } else {
           console.log('تم إرسال الرسالة:', info.response);
           return res.status(200).json({
               status: 'نجاح',
               message: 'تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريبًا.'
           });
       }
   });
});

// بدء السيرفر
app.listen(PORT, () => {
   console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
