"use client";

import { validateForm } from "@/lib/formValidation";
import React, { useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, Eye, EyeOff, Check, Heart, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Forgot } from "@/components/ui/forgot";
import { Create } from "@/components/ui/create";
import { TelegramLoginWidget } from "@/components/ui/TelegramLoginWidget";
import { TelegramVerificationCard } from "@/components/ui/TelegramVerificationCard";
import { useTelegramLogin } from "@/hooks/useTelegramLogin";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useLoginMutation,
  useResendOtpMutation,
  useVerifyLoginOtpMutation,
} from "@/store/api/authApi";
import { toast } from "@/components/ui/toast";
import "@/app/globals.scss";

import { otpSchema, userLoginSchema } from "@/lib/authSchema";

type FormErrors = {
  email?: string;
  password?: string;
};

import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useCustomerOnlySignIn } from "@/hooks/useCustomerOnlySignIn";
import { STAFF_ACCOUNT_MESSAGE } from "@/lib/staffAccess";

interface LoginPageViewProps {
  initialViewMode?: ViewMode;
}

type ViewMode = "login" | "forgot" | "create";

const VIEW_PATHS: Record<ViewMode, string> = {
  login: "/login",
  create: "/register",
  forgot: "/forgot-password",
};

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
  const [email, setEmail] = usePersistentState("login:email", "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const viewMode = initialViewMode;
  const setViewMode = (mode: ViewMode) => {
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next ? `${VIEW_PATHS[mode]}?next=${encodeURIComponent(next)}` : VIEW_PATHS[mode], { scroll: false });
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const confirmCustomer = useCustomerOnlySignIn();

  const finishSignIn = async (): Promise<boolean> => {
    if (await confirmCustomer()) {
      router.push(nextPath());
      return true;
    }
    setLoginTicket(null);
    setOtp("");
    setPassword("");
    setErrors({ email: t(STAFF_ACCOUNT_MESSAGE) });
    toast.add({ type: "warning", description: STAFF_ACCOUNT_MESSAGE });
    return false;
  };
  const telegram = useTelegramLogin(finishSignIn);
  const showTelegramStep = viewMode === "login" && !loginTicket && telegram.isActive;

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

    const check = validateForm(userLoginSchema, { email, password });
    if (!check.ok) {
      setErrors(check.errors as FormErrors);
      return;
    }

    setErrors({});
    setEmail(check.data.email);

    try {
      const result = await login(check.data).unwrap();

      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
        toast.add({
          type: "success",
          description: "We emailed you a 6-digit verification code.",
        });
      } else {
        await finishSignIn();
      }
    } catch (err) {
      const message = apiErrorMessage(
        err as Parameters<typeof apiErrorMessage>[0],
        "Login failed. Check your email and password."
      );
      setErrors({ email: message });
      toast.add({ type: "error", description: message });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTicket) return;
    const check = validateForm(otpSchema, { otp });
    if (!check.ok) return;
    try {
      await verifyOtp({ loginTicket, otp: check.data.otp }).unwrap();
      await finishSignIn();
    } catch (err) {
      toast.add({
        type: "error",
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
            <div className="login_logo_hearts absolute -inset-6 pointer-events-none">
              <Heart className="absolute top-0 left-2 w-4 h-4 text-pink-500 fill-pink-500 rotate-[-15deg] animate-pulse" />
              <Heart className="absolute top-2 right-1 w-3.5 h-3.5 text-red-500 fill-red-500 rotate-[20deg]" />
              <Heart className="absolute top-8 -left-4 w-4 h-4 text-red-600 fill-red-600 rotate-[-30deg]" />
              <Heart className="absolute top-10 -right-5 w-3 h-3 text-pink-500 fill-pink-500 rotate-[15deg]" />
              <Heart className="absolute bottom-2 left-0 w-3 h-3 text-pink-600 fill-pink-600 rotate-[-10deg]" />
              <Heart className="absolute bottom-1 right-2 w-4 h-4 text-red-500 fill-red-500 rotate-[25deg]" />
              <Heart className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 text-pink-400 fill-pink-400" />
            </div>

            <div className="relative z-10">
              <BrandLogo className="h-16" priority />
            </div>
          </div>

          {loginTicket ? (
            <form onSubmit={handleVerifyOtp} className="w-full">
              <div className="login_avatar_circle">
                <MailCheck aria-hidden="true" />
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
                className="login_submit_button mt-6"
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
          ) : showTelegramStep ? (
            <TelegramVerificationCard login={telegram} />
          ) : (
            <>
              <div className="login_avatar_circle">
                <User aria-hidden="true" />
              </div>
              <h1 className="login_title">
                {t("Login to your account")}
              </h1>
              <p className="login_subtitle">
                {t("Enter your registered email address and password.")}
              </p>
              <form onSubmit={handleSubmit} className="w-full space-y-[clamp(0.75rem,2vh,1rem)]" noValidate>
                <div>
                  <label htmlFor="login-email" className="login_input_label">
                    {t("Email Address")}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 pointer-events-none">
                      <Mail className="w-4.5 h-4.5" />
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
                      className="absolute right-1.5 grid size-9 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
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
                    <span className="login_checkbox_label">
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

                <TelegramLoginWidget login={telegram} />

                <div className="text-center">
                  <span className="login_footer_text">
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
        <div className="relative w-full h-full flex items-center justify-center">
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
