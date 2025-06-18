/**
 * Theme Model
 * Defines the schema for CV themes
 */
const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Theme name must contain only lowercase letters, numbers, and hyphens']
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  colors: {
    primary: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color']
    },
    secondary: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color']
    },
    text: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color']
    },
    background: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color']
    },
    accent: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color']
    }
  },
  
  typography: {
    main: {
      type: String,
      required: true
    },
    headings: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    }
  },
  
  spacing: {
    section: {
      type: String,
      required: true
    },
    element: {
      type: String,
      required: true
    },
    micro: {
      type: String,
      required: true
    }
  },
  
  fontSizes: {
    name: {
      type: String,
      required: true
    },
    sectionHeader: {
      type: String,
      required: true
    },
    jobTitle: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    supporting: {
      type: String,
      required: true
    }
  },
  
  useCase: {
    type: String
  },
  
  borderStyle: {
    type: String,
    enum: ['solid', 'accent', 'subtle'],
    default: 'solid'
  },
  
  // Meta data
  isDefault: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default theme
themeSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { isDefault: false }
    );
  }
  next();
});

// Methods
themeSchema.methods.toJSON = function() {
  const theme = this.toObject();
  return theme;
};

// Create the model
const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;