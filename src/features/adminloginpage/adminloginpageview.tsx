"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff, Check, Heart, ShieldCheck, ChevronDown, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Forgot } from "@/components/ui/forgot";
import { Create } from "@/components/ui/create";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/toast";
import "@/app/globals.scss";

// Zod Schema for Admin Login Form Validation
const adminLoginSchema = z.object({
  role: z.string().trim().min(1, { message: "Please select your position/role." }),
  username: z.string().trim().min(1, { message: "Please enter your username." }),
  password: z.string().trim().min(1, { message: "Please enter your password." }),
});

type FormErrors = {
  role?: string;
  username?: string;
  password?: string;
};

import { TooltipAlert } from "@/components/ui/tooltip-alert";

export function AdminloginpageView() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [viewMode, setViewMode] = useState<"login" | "forgot" | "create">("login");

  // Zod Validation Errors & Active Input State (Starts empty so no false alerts when typing)
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeInput, setActiveInput] = useState<keyof FormErrors | null>(null);

  // Validate fields dynamically using Zod
  const validateField = (field: keyof FormErrors, value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      const emptyMessages: Record<keyof FormErrors, string> = {
        role: "Please select your position/role.",
        username: "Please enter your username.",
        password: "Please enter your password.",
      };
      setErrors((prev) => ({
        ...prev,
        [field]: emptyMessages[field],
      }));
    } else if (field !== "role" && trimmed.length < 3) {
      const minMessages: Record<keyof FormErrors, string> = {
        role: "Please select your position/role.",
        username: "Username must be at least 3 characters.",
        password: "Password must be at least 3 characters.",
      };
      setErrors((prev) => ({
        ...prev,
        [field]: minMessages[field],
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

    // Validate all fields using Zod
    const validationResult = adminLoginSchema.safeParse({ role, username, password });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const newErrors: FormErrors = {
        role: fieldErrors.role?.[0],
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      };
      setErrors(newErrors);

      if (newErrors.role) setActiveInput("role");
      else if (newErrors.username) setActiveInput("username");
      else if (newErrors.password) setActiveInput("password");

      toast.add({
        type: "error",
        description: "Admin login failed! Please check required fields.",
        priority: "high",
      });
      return;
    }

    setErrors({});
    login();
    router.push("/userprofile");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 font-sans relative">

      {/* Top Left Back Button */}
      <div className="w-full max-w-md flex justify-start pt-2">
        <button
          type="button"
          onClick={handleBack}
          className="login_back_home_btn group cursor-pointer border-none bg-transparent"
          title="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* Centered Main Form Container */}
      <div className="w-full max-w-[420px] my-auto py-6 flex flex-col items-center">
        {/* 590st CAFE Logo with Hearts */}
        <div className="login_logo-container mb-4">
          {/* Floating Hearts around Logo */}
          <div className="absolute -inset-6 pointer-events-none">
            <Heart className="absolute top-0 left-2 w-4 h-4 text-pink-500 fill-pink-500 rotate-[-15deg] animate-pulse" />
            <Heart className="absolute top-2 right-1 w-3.5 h-3.5 text-red-500 fill-red-500 rotate-[20deg]" />
            <Heart className="absolute top-8 -left-4 w-4 h-4 text-red-600 fill-red-600 rotate-[-30deg]" />
            <Heart className="absolute top-10 -right-5 w-3 h-3 text-pink-500 fill-pink-500 rotate-[15deg]" />
            <Heart className="absolute bottom-2 left-0 w-3 h-3 text-pink-600 fill-pink-600 rotate-[-10deg]" />
            <Heart className="absolute bottom-1 right-2 w-4 h-4 text-red-500 fill-red-500 rotate-[25deg]" />
            <Heart className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 text-pink-400 fill-pink-400" />
          </div>

          {/* Logo Title */}
          <div className="login_brand_title">
            590<span>St</span>
          </div>
          <div className="login_brand_subtitle">CAFE</div>
        </div>

        {viewMode === "forgot" ? (
          <Forgot onBackToLogin={() => setViewMode("login")} />
        ) : viewMode === "create" ? (
          <Create onBackToLogin={() => setViewMode("login")} />
        ) : (
          <>
            {/* Avatar Circle */}
            <div className="login_avatar_circle mb-5">
              <User className="w-10 h-10 stroke-[1.5] text-gray-500" />
            </div>

            {/* Title & Subtitle */}
            <h1 className="login_title text-2xl font-bold text-gray-900 mb-1">
              Login to your account
            </h1>
            <p className="login_subtitle text-xs text-gray-400 mb-6">
              Enter your credential to login
            </p>

            {/* Admin Login Form with Zod Validation */}
            <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
              {/* Role Field */}
              <div>
                <label className="login_input_label">Role</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                  </span>
                  <select
                    value={role}
                    onFocus={() => setActiveInput("role")}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRole(val);
                      validateField("role", val);
                    }}
                    className="w-full pl-9 pr-9 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 appearance-none cursor-pointer font-medium"
                  >
                    <option value="" disabled hidden>
                      enter your role
                    </option>
                    <option value="Admin">Admin</option>
                    <option value="Barista">Barista</option>
                  </select>
                  <span className="absolute right-3 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>

                {/* Speech Bubble Alert Tooltip */}
                {activeInput === "role" && errors.role && (
                  <TooltipAlert message={errors.role} />
                )}
              </div>

              {/* Username Field */}
              <div>
                <label className="login_input_label">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <Input
                    type="text"
                    value={username}
                    onFocus={() => {
                      setActiveInput("username");
                      if (!username.trim()) {
                        setErrors((prev) => ({ ...prev, username: "Please enter your username." }));
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsername(val);
                      validateField("username", val);
                    }}
                    placeholder="enter your username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300"
                  />
                </div>

                {/* Speech Bubble Alert Tooltip */}
                {activeInput === "username" && errors.username && (
                  <TooltipAlert message={errors.username} />
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="login_input_label">Password</label>
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onFocus={() => {
                      setActiveInput("password");
                      if (!password.trim()) {
                        setErrors((prev) => ({ ...prev, password: "Please enter your password." }));
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      validateField("password", val);
                    }}
                    placeholder="enter your password"
                    className="w-full pl-3 pr-9 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Speech Bubble Alert Tooltip */}
                {activeInput === "password" && errors.password && (
                  <TooltipAlert message={errors.password} />
                )}
              </div>

              {/* Controls Row: Checkbox + Forgot Link */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                    className={`w-4 h-4 rounded border border-gray-300 flex items-center justify-center transition-colors ${
                      keepLoggedIn ? "bg-black border-black text-white" : "bg-white"
                    }`}
                  >
                    {keepLoggedIn && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs text-gray-800 font-semibold">
                    Keep me logged in
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setViewMode("forgot")}
                  className="text-xs font-semibold text-[#03ab97] hover:underline cursor-pointer border-none bg-transparent"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#0a0f1d] hover:bg-[#1a2035] text-white font-semibold py-3 px-4 rounded-lg text-xs tracking-wide transition-colors cursor-pointer border-none shadow-sm"
              >
                Login
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-2">
                <span className="text-xs text-gray-600 font-medium">
                  Don't have an account?
                </span>
                &nbsp;
                <button
                  type="button"
                  onClick={() => setViewMode("create")}
                  className="text-xs font-semibold text-[#03ab97] hover:underline cursor-pointer border-none bg-transparent"
                >
                  Sign up
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="py-2" />
    </div>
  );
}

export default AdminloginpageView;
