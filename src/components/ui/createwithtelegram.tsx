"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff, UserPlus, Phone, ChevronDown, Users, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import "@/app/globals.scss";

import { telegramSignUpSchema } from "@/lib/authSchema";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { cleanPhoneInput } from "@/lib/phoneUtils";
import { useLanguage } from "@/components/ui/translatetokhmer";

type FormErrors = {
  username?: string;  
  gender?: string;
  phone?: string;
  password?: string;
};

interface CreateWithTelegramProps {
  onBackToLogin: () => void;
  onRegisterWithEmail?: () => void;
}

export function CreateWithTelegram({ onBackToLogin, onRegisterWithEmail }: CreateWithTelegramProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Custom Dropdown Open States & Refs
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const genderRef = useRef<HTMLDivElement>(null);

  // Click Outside to Dismiss Custom Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Zod Errors & Active Focused Input
  const [errors, setErrors] = useState<FormErrors>({});
  const [, setActiveInput] = useState<keyof FormErrors | null>(null);

  const validateField = (field: keyof FormErrors, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    const fieldSchema = telegramSignUpSchema.shape[field];
    if (!fieldSchema) return;
    const result = fieldSchema.safeParse(value);

    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0]?.message,
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

    // Validate with Zod schema for Telegram registration
    const formData = { username, gender, phone, password };

    const validationResult = telegramSignUpSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const newErrors: FormErrors = {
        username: fieldErrors.username?.[0],
        gender: fieldErrors.gender?.[0],
        phone: fieldErrors.phone?.[0],
        password: fieldErrors.password?.[0],
      };
      setErrors(newErrors);
      if (newErrors.username) setActiveInput("username");
      else if (newErrors.gender) setActiveInput("gender");
      else if (newErrors.phone) setActiveInput("phone");
      else if (newErrors.password) setActiveInput("password");
      return;
    }

    setErrors({});

    // Register user in AuthContext (generates telegram email fallback)
    const generatedEmail = `${username.toLowerCase().replace(/\s+/g, "")}@telegram.user`;
    const res = signup({
      name: username,
      email: generatedEmail,
      phone: phone,
      gender: gender,
      password: password,
    });

    if (!res.success) {
      setErrors({ username: res.message });
      setActiveInput("username");
      return;
    }

    // Navigate to user profile page
    router.push("/userprofile");
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center">
        <div className="login_avatar_circle relative bg-pink-50 border-pink-200 text-[#A1255B]">
          <Send className="w-9 h-9 stroke-[1.8] ml-[-2px] text-[#A1255B]" />
        </div>
      </div>
      <h1 className="login_title flex items-center justify-center gap-2">
        <span>{t("Register with Telegram")}</span>
      </h1>
      <p className="login_subtitle">
        {t("Create an account linked directly to your Telegram phone number")}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>

        {/* Username Field */}
        <div>
          <label className="login_input_label">
            {t("Username")}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </span>
            <Input
              type="text"
              value={username}
              onFocus={() => {
                setActiveInput("username");
                if (username.trim()) validateField("username", username);
              }}
              onChange={(e) => {
                const val = e.target.value;
                setUsername(val);
                validateField("username", val);
              }}
              placeholder="enter your username"
              className="login_input_field"
            />
          </div>
          {errors.username && (
            <TooltipAlert message={errors.username} />
          )}
        </div>

        {/* Custom Gender Dropdown Selection */}
        <div ref={genderRef} className="relative">
          <label className="login_input_label">
            {t("Gender")}
          </label>
          <button
            type="button"
            onClick={() => setIsGenderOpen(!isGenderOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full border border-[#94a3b8] bg-white text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#475569] transition-all cursor-pointer select-none text-left"
            aria-expanded={isGenderOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={gender ? "text-gray-900 font-semibold" : "text-gray-400"}>
                {t(gender) || "select your gender"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                isGenderOpen ? "rotate-180 text-[#A1255B]" : ""
              }`}
            />
          </button>

          {/* Custom Dropdown Menu */}
          {isGenderOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white border border-gray-100 rounded-2xl shadow-lg p-1.5 space-y-0.5 animate-in fade-in duration-150">
              {["Male", "Female", "Other"].map((option) => {
                const isSelected = gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setGender(option);
                      setIsGenderOpen(false);
                      validateField("gender", option);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none text-left select-none ${
                      isSelected
                        ? "bg-[#A1255B] text-white font-bold shadow-2xs"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>{t(option)}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          )}
          {errors.gender && (
            <TooltipAlert message={errors.gender} />
          )}
        </div>

        {/* Phone Number with Telegram Input Field */}
        <div>
          <label className="login_input_label flex items-center justify-between">
            <span>{t("Phone Number with Telegram")}</span>
            <span className="text-[10px] text-[#A1255B] font-extrabold uppercase bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
              Telegram
            </span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              <Phone className="w-4 h-4 text-gray-400" />
            </span>
            <Input
              type="tel"
              value={phone}
              onFocus={() => {
                setActiveInput("phone");
                if (phone.trim()) validateField("phone", phone);
              }}
              onChange={(e) => {
                const val = cleanPhoneInput(e.target.value);
                setPhone(val);
                validateField("phone", val);
              }}
              placeholder="enter your phone number"
              className="login_input_field"
            />
          </div>
          {errors.phone && (
            <TooltipAlert message={errors.phone} />
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="login_input_label">
            {t("Password")}
          </label>
          <div className="relative flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onFocus={() => {
                setActiveInput("password");
                if (password.trim()) validateField("password", password);
              }}
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
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <TooltipAlert message={errors.password} />
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="login_submit_button mt-2"
        >
          <Send className="w-4 h-4 text-white mr-1.5" />
          <span>{t("Sign Up with Telegram")}</span>
        </Button>

        {/* Option to Switch Back to Standard Email Registration */}
        {onRegisterWithEmail && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onRegisterWithEmail}
              className="text-xs font-bold text-[#A1255B] hover:underline cursor-pointer border-none bg-transparent"
            >
              {t("← Register with Email instead")}
            </button>
          </div>
        )}

        <div className="text-center pt-1 border-t border-gray-100 mt-3">
          <span className="text-xs text-gray-600 font-medium">
            {t("Already have an account?")}
          </span>
          &nbsp;
          <button
            type="button"
            onClick={onBackToLogin}
            className="login_forgot_link cursor-pointer border-none bg-transparent"
          >
            {t("Log in")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateWithTelegram;
