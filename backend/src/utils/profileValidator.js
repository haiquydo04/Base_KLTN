/**
 * Validation Schemas using Joi
 * PB06 - Personal Profile Management
 */

import Joi from 'joi';

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate age is at least 18
 * @param {Date|string} dateOfBirth - Date of birth
 * @throws {Error} If age is less than 18
 */
export const validateMinimumAge = (dateOfBirth) => {
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    throw new Error('You must be at least 18 years old');
  }
  return age;
};

/**
 * Preferred Age Range Schema
 */
const preferredAgeRangeSchema = Joi.object({
  min: Joi.number()
    .min(18)
    .max(100)
    .required()
    .messages({
      'number.min': 'Minimum age must be at least 18',
      'number.max': 'Maximum age cannot exceed 100'
    }),
  max: Joi.number()
    .min(18)
    .max(100)
    .required()
    .messages({
      'number.min': 'Maximum age must be at least 18',
      'number.max': 'Maximum age cannot exceed 100'
    })
});

/**
 * Preferences Schema
 */
const preferencesSchema = Joi.object({
  maxDistance: Joi.number()
    .min(1)
    .max(500)
    .default(50)
    .messages({
      'number.min': 'Maximum distance must be at least 1 km',
      'number.max': 'Maximum distance cannot exceed 500 km'
    }),
  preferredAgeRange: preferredAgeRangeSchema.default({ min: 18, max: 50 }),
  preferredGender: Joi.string()
    .valid('male', 'female', 'other', 'all')
    .default('all')
    .messages({
      'any.only': 'Preferred gender must be one of: male, female, other, all'
    })
});

/**
 * Profile Update Schema
 * Used for PUT /api/profile
 */
export const profileUpdateSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Full name cannot be empty',
      'string.min': 'Full name cannot be empty',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required'
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other', '')
    .default('')
    .messages({
      'any.only': 'Gender must be one of: male, female, other'
    }),
  dateOfBirth: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Date of birth must be a valid ISO date (YYYY-MM-DD)',
      'any.required': 'Date of birth is required'
    }),
  bio: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .default('')
    .messages({
      'string.max': 'Bio cannot exceed 1000 characters'
    }),
  avatar: Joi.string()
    .uri()
    .allow('')
    .default('')
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    }),
  photos: Joi.array()
    .items(Joi.string().uri().messages({
      'string.uri': 'Each photo must be a valid URL'
    }))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Maximum 10 photos allowed'
    }),
  preferences: preferencesSchema
});

/**
 * Validate profile update data
 * @param {Object} data - Profile data to validate
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
export const validateProfileUpdate = async (data) => {
  try {
    const validated = await profileUpdateSchema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: true
    });

    // Additional validation: Age must be >= 18
    const age = validateMinimumAge(validated.dateOfBirth);
    
    // Additional validation: preferredAgeRange.min <= preferredAgeRange.max
    if (validated.preferences?.preferredAgeRange) {
      const { min, max } = validated.preferences.preferredAgeRange;
      if (min > max) {
        throw new Error('Minimum age cannot be greater than maximum age in preferred age range');
      }
    }

    return {
      ...validated,
      _validatedAge: age
    };
  } catch (error) {
    if (error.isJoi) {
      const messages = error.details.map(detail => detail.message).join('; ');
      throw new Error(messages);
    }
    throw error;
  }
};

/**
 * Custom validator for profile
 */
export class ProfileValidator {
  /**
   * Validate and transform profile update data
   * @param {Object} data - Raw profile data
   * @returns {Promise<Object>} Validated profile data
   */
  static async validateUpdate(data) {
    return validateProfileUpdate(data);
  }

  /**
   * Calculate age from date of birth
   * @param {Date|string} dateOfBirth 
   * @returns {number}
   */
  static calculateAge(dateOfBirth) {
    return calculateAge(dateOfBirth);
  }

  /**
   * Validate minimum age
   * @param {Date|string} dateOfBirth
   * @returns {number} Age
   * @throws {Error} If age < 18
   */
  static validateMinimumAge(dateOfBirth) {
    return validateMinimumAge(dateOfBirth);
  }
}

export default {
  calculateAge,
  validateMinimumAge,
  validateProfileUpdate,
  ProfileValidator,
  profileUpdateSchema
};
