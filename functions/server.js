const express = require('express');
const nodemailer = require('nodemailer');
const { validate } = require('deep-email-validator');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const cors = require('cors');
const { z } = require('zod');
const hpp = require('hpp');
const morgan = require('morgan');
const serverless = require('serverless-http');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Netlify/express-rate-limit
app.set('trust proxy', 1);

// Diagnostic log for Netlify environment
console.log('Runtime Check - MY_EMAIL exists:', !!process.env.MY_EMAIL);
console.log('Runtime Check - MY_PASSWORD exists:', !!process.env.MY_PASSWORD);

// Security Middlewares

// 1. Helmet: Strict Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline for existing scripts (scripts.js)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:"], // Allow images from self, data URIs, and HTTPS sources
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Enable CORS for Netlify and Localhost
app.use(cors({
  origin: ['https://fdjts.netlify.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['POST', 'GET'],
  credentials: true
}));

// 2. Morgan: Forensic Logging
app.use(morgan('combined')); // Logs IP, User-Agent, Time, Method, URL, Status

app.use(express.static(path.join(__dirname, '..')));
app.use(express.json()); // Body parser must be before HPP

// 3. HPP: HTTP Parameter Pollution Protection
app.use(hpp());

// Rate Limiting: Limit specific IPs to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Specific Rate Limit for Email Sending (Prevent Spam)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 emails per hour
  message: 'Too many emails sent from this IP, please try again after an hour',
});

// Zod Schema for Input Validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(100, 'Subject cannot exceed 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message cannot exceed 2000 characters'),
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.post('/send', emailLimiter, async (req, res) => {
  // 1. Zod Validation
  const validation = contactSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ message: errorMessages });
  }

  const { name, email, subject, message } = validation.data;

  // 2. XSS Sanitization
  const cleanName = xss(name);
  const cleanSubject = xss(subject);
  const cleanMessage = xss(message);

  // Ensure environment variables are present
  if (!process.env.MY_EMAIL || !process.env.MY_PASSWORD) {
    console.error('ERROR: Missing MY_EMAIL or MY_PASSWORD in environment variables.');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  // Updated Transport for Tuta (or any SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.tutanota.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD
    }
  });

  const htmlBody = `
    <h3>📩 رسالة جديدة من ${cleanName}</h3>
    <p><strong>الإيميل:</strong> ${email}</p>
    <p><strong>الموضوع:</strong> ${cleanSubject}</p>
    <p><strong>الرسالة:</strong><br>${cleanMessage}</p>
  `;

  try {
    // إرسال للمطور (Updated Recipient)
    await transporter.sendMail({
      from: `"Portfolio Website" <${process.env.MY_EMAIL}>`,
      to: 'fut0r@tuta.io', // Recipient
      subject: `New Contact Message from ${cleanName}`,
      html: htmlBody
    });

    // إرسال نسخة للمرسل (Optional: might be blocked by some providers if not authenticated properly)
    await transporter.sendMail({
      from: `"FDJTS Portfolio" <${process.env.MY_EMAIL}>`,
      to: email,
      subject: 'Thanks for contacting us! شكراً لتواصلك معنا',
      html: `
        <h3>Hello ${cleanName},</h3>
        <p>Thanks for your message! We'll get back to you as soon as possible.</p>
        <hr>
        <p><strong>Your message:</strong></p>
        <p>${cleanMessage}</p>
        <br>
        <p>شكراً لتواصلك معنا، سيتم الرد عليك قريباً إن شاء الله.</p>
      `
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('--- SendMail Detailed Error ---');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.response) console.error('SMTP Response:', err.response);
    console.error('--------------------------------');
    res.status(500).json({ message: 'Failed to send email. Check logs for details.' });
  }
});

// Export for Netlify Functions
module.exports.handler = serverless(app);

// Local Development Fallback
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
