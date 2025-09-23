const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// MongoDB imports
const { connectDB, handleDisconnection } = require('./config/database');
const Contact = require('./models/Contact');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Add request logging for debugging in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Middleware
app.use(helmet());
// Dynamic CORS configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// MongoDB connection will be handled in startServer function

// Validation function
function validateContactData(data) {
  const { name, email, subject, message } = data;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { valid: false, error: 'Valid email is required' };
  }
  
  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return { valid: false, error: 'Subject is required' };
  }
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }
  
  // Optional phone validation
  if (data.phone && typeof data.phone === 'string' && data.phone.trim().length > 0) {
    const phoneRegex = /^[+]?[(]?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
      return { valid: false, error: 'Invalid phone number format' };
    }
  }
  
  return { valid: true };
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Contact Form Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      'POST /api/contact': 'Submit a contact form',
      'GET /api/contacts': 'Get all contact submissions',
      'GET /health': 'Health check'
    }
  });
});

// API base route
app.get('/api', (req, res) => {
  res.json({
    message: 'Contact Form API',
    version: '1.0.0',
    endpoints: {
      'POST /api/contact': 'Submit a contact form',
      'GET /api/contacts': 'Get all contact submissions'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'connected'
  });
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    // Validate input data
    const validation = validateContactData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Create new contact entry using MongoDB model
    const newContact = new Contact({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone ? req.body.phone.trim() : '',
      subject: req.body.subject.trim(),
      message: req.body.message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    });

    // Save to MongoDB
    const savedContact = await newContact.save();
    
    console.log(`📝 New contact saved to MongoDB: ${savedContact.name} (${savedContact.email})`);
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: savedContact._id,
        submittedAt: savedContact.submittedAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get all contacts (for admin use)
app.get('/api/contacts', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Contact.countDocuments();
    
    // Fetch contacts with pagination, sorted by most recent first
    const contacts = await Contact
      .find({})
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version field
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get contact by ID
app.get('/api/contact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-__v');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete contact by ID (optional admin feature)
app.delete('/api/contact/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    console.log(`🗑️ Contact deleted from MongoDB: ${deletedContact.name} (ID: ${deletedContact._id})`);
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Setup graceful shutdown handling
    handleDisconnection();
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📊 MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/contactform'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

startServer().catch(console.error);