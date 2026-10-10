import { z } from "zod";
import { PHONE_PATTERN } from "@/lib/phoneUtils";
import { TABLE_NUMBER_PATTERN } from "@/lib/dineIn";

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

export const otpCode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: "Enter the 6-digit code." });

export const otpSchema = z.object({ otp: otpCode });

export const resetPasswordSchema = z
  .object({
    otp: otpCode,
    password: strongPassword,
    confirm: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, { message: "Password is required." }),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, { message: "Enter your current password." }),
    newPass: strongPassword,
    confirmPass: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((v) => v.newPass === v.confirmPass, {
    message: "New password and confirm password do not match.",
    path: ["confirmPass"],
  })
  .refine((v) => v.newPass !== v.current, {
    message: "The new password must be different from the current one.",
    path: ["newPass"],
  });

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Your name must be between 2 and 100 characters." })
    .max(100, { message: "Your name must be between 2 and 100 characters." }),
  phone: z
    .string()
    .trim()
    .refine((value) => !value || PHONE_PATTERN.test(value), {
      message: "Enter a valid phone number, e.g. 012 345 6789.",
    }),
});

export const tableNumberSchema = z.object({
  tableNumber: z
    .string()
    .min(1, { message: "Enter your table number" })
    .regex(TABLE_NUMBER_PATTERN, { message: "Use the number shown on your table, e.g. 05" }),
});
