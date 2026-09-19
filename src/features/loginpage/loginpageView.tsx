"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, Eye, EyeOff, Check, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Forgot } from "@/components/ui/forgot";
import { Create } from "@/components/ui/create";
import { TelegramLoginWidget } from "@/components/ui/TelegramLoginWidget";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useLoginMutation,
  useResendOtpMutation,
  useVerifyLoginOtpMutation,
} from "@/store/api/authApi";
import { toast } from "@/components/ui/toast";
import "@/app/globals.scss";

import { userLoginSchema } from "@/lib/authSchema";

type FormErrors = {
  email?: string;
  password?: string;
};

import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { useLanguage } from "@/components/ui/translatetokhmer";

interface LoginPageViewProps {
  initialViewMode?: "login" | "forgot" | "create";
}

/**
 * Where to land after signing in. Guards append ?next= when they bounce someone here; only
 * same-origin paths are honoured so a crafted link cannot redirect off-site.
 */
function nextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export function LoginPageView({ initialViewMode = "login" }: LoginPageViewProps = {}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyLoginOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [loginTicket, setLoginTicket] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<"login" | "forgot" | "create">(initialViewMode);
  const [errors, setErrors] = useState<FormErrors>({});
  const validateField = (field: keyof FormErrors, value: string) => {
    const fieldSchema = userLoginSchema.shape[field];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Full form validation using Zod Schema
    const validationResult = userLoginSchema.safeParse({ email, password });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const newErrors: FormErrors = {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      };
      setErrors(newErrors);
      toast.add({
        type: "warning",
        description: newErrors.email || newErrors.password || "Please fix validation errors.",
      });
      return;
    }

    setErrors({});
    setEmail(validationResult.data.email);

    // The API authenticates by email and answers with either tokens (rare) or an OTP
    // challenge the customer completes below.
    try {
      const result = await login(validationResult.data).unwrap();

      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
        toast.add({
          type: "success",
          description: "We emailed you a 6-digit verification code.",
        });
      } else {
        router.push(nextPath());
      }
    } catch (err) {
      const message = apiErrorMessage(
        err as Parameters<typeof apiErrorMessage>[0],
        "Login failed. Check your email and password."
      );
      setErrors({ email: message });
      toast.add({ type: "warning", description: message });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTicket) return;
    try {
      await verifyOtp({ loginTicket, otp: otp.trim() }).unwrap();
      router.push(nextPath());
    } catch (err) {
      toast.add({
        type: "warning",
        description: apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "That code was not accepted."
        ),
      });
    }
  };

  return (
    <div className="login_page_wrapper font-sans relative">
      <div className="login_form_side">
        <div className="flex justify-start">
          <Link
            href="/"
            className="login_back_home_btn"
            title="Return to Home"
          >
            <ArrowLeft className="w-6 h-6" aria-label="Back to Home" />
          </Link>
        </div>
        <div className="login_form_area">
          <div className="login_logo-container">
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
            <div className="login_brand_subtitle">
              CAFE
            </div>
          </div>

          {loginTicket ? (
            /* Step two of login: the 6-digit code the API emails to the verified address. */
            <form onSubmit={handleVerifyOtp} className="w-full">
              <div className="login_avatar_circle">
                <Check className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h1 className="login_title">{t("Enter your code")}</h1>
              <p className="login_subtitle">
                {t("We sent a 6-digit verification code to")}{" "}
                <strong>{email}</strong>
              </p>

              <input
                className="mt-6 h-12 w-full rounded-md border border-gray-300 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#A1255B]"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />

              <Button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="mt-6 w-full"
              >
                {isVerifying ? t("Verifying...") : t("Verify and sign in")}
              </Button>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await resendOtp({ purpose: "LOGIN", loginTicket }).unwrap();
                      toast.add({ type: "success", description: "Code re-sent." });
                    } catch {
                      toast.add({
                        type: "warning",
                        description: "Could not resend the code.",
                      });
                    }
                  }}
                  disabled={isResending}
                  className="text-gray-600 underline disabled:opacity-60"
                >
                  {isResending ? t("Sending...") : t("Resend code")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginTicket(null);
                    setOtp("");
                  }}
                  className="text-gray-600 underline"
                >
                  {t("Use a different account")}
                </button>
              </div>
            </form>
          ) : viewMode === "forgot" ? (
            <Forgot onBackToLogin={() => setViewMode("login")} />
          ) : viewMode === "create" ? (
            <Create onBackToLogin={() => setViewMode("login")} />
          ) : (
            <>
              <div className="login_avatar_circle">
                <User className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h1 className="login_title">
                {t("Login to your account")}
              </h1>
              <p className="login_subtitle">
                {t("Enter your registered email address and password.")}
              </p>
              <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="login_input_label">
                    {t("Email Address")}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      disabled={isLoggingIn}
                      value={email}
                      onFocus={() => {
                        if (email.trim()) validateField("email", email);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        validateField("email", val);
                      }}
                      placeholder="enter your email address"
                      className="login_input_field"
                    />
                  </div>
                  {errors.email && (
                    <TooltipAlert message={errors.email} />
                  )}
                </div>
                <div>
                  <label htmlFor="login-password" className="login_input_label">
                    {t("Password")}
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoggingIn}
                      value={password}
                      onFocus={() => {
                        if (password.trim()) validateField("password", password);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassword(val);
                        validateField("password", val);
                      }}
                      placeholder="enter your password"
                      className="login_input_field_pass"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                  {errors.password && (
                    <TooltipAlert message={errors.password} />
                  )}
                </div>
                <div className="login_controls_row">
                  <label
                    onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div
                      className={`login_checkbox_box ${keepLoggedIn ? "checked" : ""}`}
                      role="checkbox"
                      aria-checked={keepLoggedIn}
                    >
                      {keepLoggedIn && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {t("Keep me logged in")}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setViewMode("forgot")}
                    className="login_forgot_link cursor-pointer border-none bg-transparent"
                  >
                    {t("Forgot password?")}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="login_submit_button"
                >
                  {isLoggingIn ? t("Signing in...") : t("Login")}
                </Button>

                <TelegramLoginWidget onSuccess={() => router.push(nextPath())} />

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {t("Don't have an account?")}
                  </span>
                  &nbsp;
                  <button
                    type="button"
                    onClick={() => setViewMode("create")}
                    className="login_forgot_link cursor-pointer border-none bg-transparent"
                  >
                    {t("Sign up")}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div />
      </div>
      <div className="login_slideshow_side hidden lg:flex">
        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
          <Image
            src="/images/slideshowloginscreen.svg"
            alt="590st Cafe Login Slideshow"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPageView;
