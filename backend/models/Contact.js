const mongoose = require('mongoose');

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Phone is optional, but if provided, must be valid
        if (!v || v.length === 0) return true;
        return /^[+]?[(]?[\d\s\-()]{10,}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Index for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ submittedAt: -1 });

// Create and export the model
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
