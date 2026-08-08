"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Eye, EyeOff, UserPlus, Phone } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import "@/app/globals.scss";

const createSchema = z.object({
  username: z.string().trim().min(1, { message: "Please enter your username." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." }),
  phone: z.string().trim().min(1, { message: "Please enter your phone number." }),
  password: z.string().trim().min(1, { message: "Please enter a password." }),
});

type FormErrors = {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
};

interface CreateProps {
  onBackToLogin: () => void;
}

// Floating Tooltip Speech-Bubble Alert Component matching target screenshot
function TooltipAlert({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="relative z-30 mt-1.5 mb-1 animate-in fade-in slide-in-from-top-1 duration-150">
      {/* Pointer Triangle pointing UP to the input */}
      <div className="absolute -top-[8px] left-6 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-gray-400" />
      <div className="absolute -top-[6.5px] left-[25px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-white" />

      {/* Speech Bubble Card */}
      <div className="inline-flex items-center gap-2.5 bg-white border border-gray-400 rounded-md p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] max-w-xs">
        {/* Orange Exclamation Mark Badge */}
        <div className="w-6 h-6 bg-[#f95700] text-white font-bold text-base rounded flex items-center justify-center flex-shrink-0 shadow-xs select-none">
          !
        </div>
        {/* Error Message */}
        <span className="text-xs text-gray-900 font-normal leading-tight">
          {message}
        </span>
      </div>
    </div>
  );
}

export function Create({ onBackToLogin }: CreateProps) {
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Zod Errors & Active Focused Input
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeInput, setActiveInput] = useState<keyof FormErrors | null>(null);

  const validateField = (
    field: keyof FormErrors,
    value: string,
    currentUsername = username,
    currentEmail = email,
    currentPhone = phone,
    currentPassword = password
  ) => {
    if (value.trim().length > 0) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    const data = {
      username: field === "username" ? value : currentUsername,
      email: field === "email" ? value : currentEmail,
      phone: field === "phone" ? value : currentPhone,
      password: field === "password" ? value : currentPassword,
    };
    const result = createSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field]?.[0] || "Please fill in this field.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const validationResult = createSchema.safeParse({ username, email, phone, password });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const newErrors: FormErrors = {
        username: fieldErrors.username?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        password: fieldErrors.password?.[0],
      };
      setErrors(newErrors);
      if (newErrors.username) setActiveInput("username");
      else if (newErrors.email) setActiveInput("email");
      else if (newErrors.phone) setActiveInput("phone");
      else if (newErrors.password) setActiveInput("password");
      return;
    }

    setErrors({});

    // Register user in AuthContext & save profile data
    signup({
      name: username,
      email: email,
      phone: phone,
    });

    // Navigate to user profile page
    router.push("/userprofile");
  };


  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center">
        <div className="login_avatar_circle">
          <UserPlus className="w-10 h-10 stroke-[1.5]" />
        </div>
      </div>
      <h1 className="login_title">
        Create an account
      </h1>
      <p className="login_subtitle">
        Enter your details below to create your account
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>

          <div>
            <label className="login_input_label">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <Input
                type="text"
                value={username}
                onFocus={() => setActiveInput("username")}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  validateField("username", val);
                }}
                placeholder="enter your username"
                className="login_input_field"
              />
            </div>
            {activeInput === "username" && errors.username && (
              <TooltipAlert message={errors.username} />
            )}
          </div>
          <div>
            <label className="login_input_label">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                type="email"
                value={email}
                onFocus={() => setActiveInput("email")}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  validateField("email", val);
                }}
                placeholder="enter your email address"
                className="login_input_field"
              />
            </div>
            {activeInput === "email" && errors.email && (
              <TooltipAlert message={errors.email} />
            )}
          </div>
          <div>
            <label className="login_input_label">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <Phone className="w-4 h-4" />
              </span>
              <Input
                type="tel"
                value={phone}
                onFocus={() => setActiveInput("phone")}
                onChange={(e) => {
                  const val = e.target.value;
                  setPhone(val);
                  validateField("phone", val);
                }}
                placeholder="enter your phone number"
                className="login_input_field"
              />
            </div>
            {activeInput === "phone" && errors.phone && (
              <TooltipAlert message={errors.phone} />
            )}
          </div>
          <div>
            <label className="login_input_label">
              Password
            </label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onFocus={() => setActiveInput("password")}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  validateField("password", val);
                }}
                placeholder="create a strong password"
                className="login_input_field_pass"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {activeInput === "password" && errors.password && (
              <TooltipAlert message={errors.password} />
            )}
          </div>
          <Button
            type="submit"
            className="login_submit_button mt-2"
          >
            Sign Up
          </Button>
          <div className="text-center pt-1">
            <span className="text-xs text-gray-600">
              Already have an account?
            </span>
            &nbsp;
            <button
              type="button"
              onClick={onBackToLogin}
              className="login_forgot_link cursor-pointer border-none bg-transparent"
            >
              Log in
            </button>
          </div>
        </form>
    </div>
  );
}

export default Create;
