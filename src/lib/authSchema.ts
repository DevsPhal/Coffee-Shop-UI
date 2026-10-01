import { z } from "zod";
import { PHONE_PATTERN } from "@/lib/phoneUtils";

export const cambodianPhone = z
  .string()
  .trim()
  .min(1, { message: "Please enter your phone number." })
  .regex(PHONE_PATTERN, {
    message: "Enter a valid phone number, e.g. 012 345 6789.",
  });

export const strongPassword = z
  .string()
  .min(1, { message: "Please enter a password." })
  .min(8, { message: "Password must be at least 8 characters." })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message:
      "Include an uppercase letter, a lowercase letter, a digit and a symbol — e.g. Qwert!12@",
  });

export const userLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Enter the email address you used to register." })
    .toLowerCase(),
  password: z.string().refine((value) => value.trim().length > 0, {
    message: "Please enter your password.",
  }),
});

export type UserLoginFormValues = z.infer<typeof userLoginSchema>;

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
  password: strongPassword,
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your full name." })
    .min(3, { message: "Full name must be at least 3 characters." }),
  gender: z
    .string()
    .trim()
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  phone: cambodianPhone,
  password: strongPassword,
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const telegramSignUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  gender: z
    .string()
    .trim()
    .optional(),
  phone: cambodianPhone,
  password: strongPassword,
});

export type TelegramSignUpFormValues = z.infer<typeof telegramSignUpSchema>;

export const adminSignUpSchema = z.object({
  role: z
    .string()
    .trim()
    .optional(),
  username: z
    .string()
    .trim()
    .min(1, { message: "Please enter your username." })
    .min(3, { message: "Username must be at least 3 characters." }),
  gender: z
    .string()
    .trim()
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  phone: cambodianPhone,
  password: strongPassword,
});

export type AdminSignUpFormValues = z.infer<typeof adminSignUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

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
  phone: cambodianPhone,
  capital: z.string().trim().min(1, { message: "Please select your Capital." }),
  address: z
    .string()
    .trim()
    .min(1, { message: "Please enter your Address." })
    .min(3, { message: "Address must be at least 3 characters." }),
});

export type ShippingInformationValues = z.infer<typeof shippingInformationSchema>;
