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

// Health check or simple status
app.get('/status', (req, res) => {
  res.json({ status: 'secure-backend-active', logging: 'enabled' });
});


// Export for Netlify Functions
module.exports.handler = serverless(app);

// Local Development Fallback
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
