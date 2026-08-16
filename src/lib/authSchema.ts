import { z } from "zod";

// Zod Schema for User Login Form Validation
export const userLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Please enter your password." })
    .min(3, { message: "Password must be at least 3 characters." }),
});

export type UserLoginFormValues = z.infer<typeof userLoginSchema>;

// Zod Schema for Admin Login Form Validation
export const adminLoginSchema = z.object({
  role: z
    .string()
    .trim()
    .min(1, { message: "Please select your position/role." }),
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Please enter your password." })
    .min(3, { message: "Password must be at least 3 characters." }),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

// Zod Schema for Sign Up / Account Creation Validation
export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Please enter your phone number." })
    .regex(/^[0-9+\s-]{8,15}$/, { message: "Phone number must be valid (8-15 digits)." }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Please enter a password." })
    .min(3, { message: "Password must be at least 3 characters." }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Zod Schema for Admin Sign Up Validation
export const adminSignUpSchema = z.object({
  role: z
    .string()
    .trim()
    .min(1, { message: "Please select your position/role." }),
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Please enter your phone number." })
    .regex(/^[0-9+\s-]{8,15}$/, { message: "Phone number must be valid (8-15 digits)." }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Please enter a password." })
    .min(3, { message: "Password must be at least 3 characters." }),
});

export type AdminSignUpFormValues = z.infer<typeof adminSignUpSchema>;

// Zod Schema for Forgot Password Form Validation
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Zod Schema for Shipping Information Form Validation in Checkout
export const shippingInformationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Please enter your Full Name." })
    .min(2, { message: "Full Name must be at least 2 characters." }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /\S+@\S+\.\S+/.test(val), { message: "Please enter a valid Email address." }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[0-9+\s-]{8,15}$/.test(val), { message: "Phone Number must be valid (8-15 digits)." }),
  capital: z.string().trim().min(1, { message: "Please select your Capital." }),
  district: z.string().trim().min(1, { message: "Please select your District." }),
  zipCode: z.string().trim().min(1, { message: "Please enter Zip Code." }),
  address: z
    .string()
    .trim()
    .min(1, { message: "Please enter your Address." })
    .min(3, { message: "Address must be at least 3 characters." }),
});

export type ShippingInformationValues = z.infer<typeof shippingInformationSchema>;
