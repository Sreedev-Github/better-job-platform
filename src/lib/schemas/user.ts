// Write a schema for a user object using in typescript using zod
import { z } from "zod";
import bcrypt from "bcrypt";

// Enhanced User schema - single table with role-specific fields
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(), // DB: UNIQUE INDEX ON email
  password: z.string(), // This will be hashed
  role: z.enum(["job_seeker", "employer", "admin"]), // DB: INDEX ON role
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  
  // Employer/HR specific fields (only required when role is "employer")
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name cannot exceed 200 characters")
    .trim()
    .optional(),
  companyWebsite: z.string().url("Invalid website URL").optional(),
  verified: z.boolean().default(false),
  
  // Job seeker/Candidate specific fields (only required when role is "job_seeker")
  resumeUrl: z.string().url("Invalid resume URL").optional(),
  skills: z.array(z.string()).default([]),
  experience: z
    .string()
    .max(2000, "Experience cannot exceed 2000 characters")
    .optional(),
  education: z
    .string()
    .max(1000, "Education cannot exceed 1000 characters")
    .optional(),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Role-specific validation schemas
export const EmployerUserSchema = UserSchema.refine(
  (data) => {
    if (data.role === "employer") {
      return data.companyName && data.companyName.length > 0;
    }
    return true;
  },
  {
    message: "Company name is required for employers",
    path: ["companyName"],
  }
);

export const JobSeekerUserSchema = UserSchema.refine(
  (data) => {
    // Job seekers don't have required fields beyond base user fields
    // but we can add validation here if needed
    return true;
  },
  {
    message: "Invalid job seeker data",
  }
);

// Specialized schemas for different contexts
export const EmployerProfileSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  companyName: true,
  companyWebsite: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
});

export const JobSeekerProfileSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  resumeUrl: true,
  skills: true,
  experience: true,
  education: true,
  createdAt: true,
  updatedAt: true,
});

// User registration schema
export const UserRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
    role: z.enum(["job_seeker", "employer"]),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User login schema
export const UserLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// Profile update schemas
export const EmployerProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name cannot exceed 200 characters")
    .trim()
    .optional(),
  companyWebsite: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
});

export const JobSeekerProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
  experience: z
    .string()
    .max(2000, "Experience cannot exceed 2000 characters")
    .optional(),
  education: z
    .string()
    .max(1000, "Education cannot exceed 1000 characters")
    .optional(),
});

// Public user schema (safe for responses)
export const PublicUserSchema = UserSchema.omit({ password: true });

// Role-specific registration schemas
export const EmployerRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
    role: z.literal("employer"),
    companyName: z
      .string()
      .min(1, "Company name is required")
      .max(200, "Company name cannot exceed 200 characters")
      .trim(),
    companyWebsite: z.string().url("Invalid website URL").optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const JobSeekerRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
    role: z.literal("job_seeker"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Database schema hints for ORM/migration tools
export const DATABASE_CONSTRAINTS = {
  email: {
    unique: true,
    index: true,
    type: 'VARCHAR(255)',
  },
  role: {
    index: true,
    type: 'ENUM',
    values: ['job_seeker', 'employer', 'admin'],
  },
  id: {
    primaryKey: true,
    type: 'UUID',
  },
} as const;

/**
 * Helper function to generate database migration hints
 * Use this when setting up your database schema
 */
export const getDatabaseConstraints = () => {
  return {
    tableName: 'users',
    constraints: DATABASE_CONSTRAINTS,
    indexes: [
      { name: 'idx_users_email', columns: ['email'], unique: true },
      { name: 'idx_users_role', columns: ['role'], unique: false },
      { name: 'idx_users_email_role', columns: ['email', 'role'], unique: false },
    ],
  };
};

// Type exports
export type User = z.infer<typeof UserSchema>;
export type EmployerUser = z.infer<typeof EmployerUserSchema>;
export type JobSeekerUser = z.infer<typeof JobSeekerUserSchema>;
export type EmployerProfile = z.infer<typeof EmployerProfileSchema>;
export type JobSeekerProfile = z.infer<typeof JobSeekerProfileSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type EmployerRegistration = z.infer<typeof EmployerRegistrationSchema>;
export type JobSeekerRegistration = z.infer<typeof JobSeekerRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type EmployerProfileUpdate = z.infer<typeof EmployerProfileUpdateSchema>;
export type JobSeekerProfileUpdate = z.infer<typeof JobSeekerProfileUpdateSchema>;

// Utility functions for role-based data filtering
export const getEmployerFields = (user: User) => {
  if (user.role !== "employer") return null;
  return {
    companyName: user.companyName,
    companyWebsite: user.companyWebsite,
    verified: user.verified,
  };
};

export const getJobSeekerFields = (user: User) => {
  if (user.role !== "job_seeker") return null;
  return {
    resumeUrl: user.resumeUrl,
    skills: user.skills,
    experience: user.experience,
    education: user.education,
  };
};

// Enhanced helper functions
export const isCompleteEmployerProfile = (user: User): boolean => {
  return user.role === "employer" && !!user.companyName;
};

export const isCompleteJobSeekerProfile = (user: User): boolean => {
  return user.role === "job_seeker" && (user.skills.length > 0 || !!user.resumeUrl);
};

// Helper functions
export const isEmployer = (user: User | PublicUser): boolean => {
  return user.role === "employer";
};

export const isJobSeeker = (user: User | PublicUser): boolean => {
  return user.role === "job_seeker";
};

export const isAdmin = (user: User | PublicUser): boolean => {
  return user.role === "admin";
};

// Password hashing functions using bcrypt
const SALT_ROUNDS = 12; // Higher number = more secure but slower

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error("Failed to hash password");
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to check
 * @param hashedPassword - Hashed password from database
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Failed to compare passwords");
  }
};

/**
 * Validate password strength before hashing
 * @param password - Plain text password to validate
 * @returns boolean - True if password meets requirements
 */
export const validatePasswordStrength = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Utility function to check if a password is already hashed
 * @param password - Password string to check
 * @returns boolean - True if password appears to be hashed
 */
export const isPasswordHashed = (password: string): boolean => {
  // bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$
  return /^\$2[abxy]\$\d+\$/.test(password);
};
