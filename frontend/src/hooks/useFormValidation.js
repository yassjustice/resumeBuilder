import { useState, useCallback, useMemo } from 'react';

// Validation rules
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\s|-|\(|\)/g, '')) ? null : 'Please enter a valid phone number';
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : 'Please enter a valid date';
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date > now ? null : 'Date must be in the future';
  },

  pastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date < now ? null : 'Date must be in the past';
  }
};

// Custom hook for form validation
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((fieldName, value) => {
    const fieldRules = validationSchema[fieldName];
    if (!fieldRules) return null;

    const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    
    return null;
  }, [validationSchema]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationSchema]);

  // Handle field change
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Validate field if it has been touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [validateField, touched]);

  // Handle field blur
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateField, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Optionally set form-level errors here
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validateForm, validationSchema]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set form values programmatically
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    validateForm
  };
};

// CV-specific validation schemas
export const cvValidationSchema = {
  'personalInfo.firstName': [validationRules.required, validationRules.minLength(2)],
  'personalInfo.lastName': [validationRules.required, validationRules.minLength(2)],
  'personalInfo.email': [validationRules.required, validationRules.email],
  'personalInfo.phone': [validationRules.phone],
  'personalInfo.title': [validationRules.required, validationRules.minLength(2)],
  'summary': [validationRules.required, validationRules.minLength(50), validationRules.maxLength(500)]
};

export const experienceValidationSchema = {
  company: [validationRules.required, validationRules.minLength(2)],
  position: [validationRules.required, validationRules.minLength(2)],
  startDate: [validationRules.required, validationRules.date],
  endDate: [validationRules.date],
  description: [validationRules.minLength(10)]
};

export const educationValidationSchema = {
  institution: [validationRules.required, validationRules.minLength(2)],
  degree: [validationRules.required, validationRules.minLength(2)],
  field: [validationRules.required, validationRules.minLength(2)],
  startDate: [validationRules.date],
  endDate: [validationRules.date]
};

// Hook for dynamic form arrays (experience, education, etc.)
export const useFormArray = (initialItems = [], validationSchema = {}) => {
  const [items, setItems] = useState(initialItems);
  const [errors, setErrors] = useState({});

  const addItem = useCallback((newItem = {}) => {
    setItems(prev => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  }, []);

  const updateItem = useCallback((index, updates) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    
    // Validate updated item
    if (validationSchema) {
      const itemErrors = {};
      Object.keys(validationSchema).forEach(field => {
        const rules = Array.isArray(validationSchema[field]) ? validationSchema[field] : [validationSchema[field]];
        for (const rule of rules) {
          const error = rule(updates[field] || items[index]?.[field]);
          if (error) {
            itemErrors[field] = error;
            break;
          }
        }
      });
      
      setErrors(prev => ({ ...prev, [index]: itemErrors }));
    }
  }, [items, validationSchema]);

  const validateItems = useCallback(() => {
    const allErrors = {};
    let isValid = true;

    items.forEach((item, index) => {
      const itemErrors = {};
      Object.keys(validationSchema).forEach(field => {
        const rules = Array.isArray(validationSchema[field]) ? validationSchema[field] : [validationSchema[field]];
        for (const rule of rules) {
          const error = rule(item[field]);
          if (error) {
            itemErrors[field] = error;
            isValid = false;
            break;
          }
        }
      });
      
      if (Object.keys(itemErrors).length > 0) {
        allErrors[index] = itemErrors;
      }
    });

    setErrors(allErrors);
    return isValid;
  }, [items, validationSchema]);

  return {
    items,
    errors,
    addItem,
    removeItem,
    updateItem,
    validateItems,
    setItems
  };
};

export default {
  useFormValidation,
  useFormArray,
  validationRules,
  cvValidationSchema,
  experienceValidationSchema,
  educationValidationSchema
};
