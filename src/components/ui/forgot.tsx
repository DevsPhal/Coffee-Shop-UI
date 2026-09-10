"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/ui/translatetokhmer";
import "@/app/globals.scss";

import { forgotPasswordSchema, strongPassword } from "@/lib/authSchema";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} from "@/store/api/authApi";

interface ForgotProps {
  onBackToLogin: () => void;
}

export function Forgot({ onBackToLogin }: ForgotProps) {
  const { t } = useLanguage();
  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetErrors, setResetErrors] = useState<{ otp?: string; password?: string; confirm?: string }>({});
  const [requestError, setRequestError] = useState("");
  const [notice, setNotice] = useState("");
  const isBusy = isRequesting || isResetting || isResending;

  const validateField = (val: string) => {
    if (!val.trim()) {
      setError(undefined);
      return;
    }
    const result = forgotPasswordSchema.safeParse({ email: val.trim() });
    if (!result.success) {
      setError(result.error.issues[0]?.message);
    } else {
      setError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setRequestError("");
    const result = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!result.success) {
      const errMsg = result.error.issues[0]?.message || "Please enter a valid email address.";
      setError(errMsg);
      return;
    }

    setError(undefined);
    const accountEmail = result.data.email.toLowerCase();
    try {
      await forgotPassword({ email: accountEmail }).unwrap();
      setResetEmail(accountEmail);
      setNotice("");
      setStep("reset");
    } catch (err) {
      setRequestError(apiErrorMessage(
        err as Parameters<typeof apiErrorMessage>[0],
        "Could not request a reset code. Please try again."
      ));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setRequestError("");
    setNotice("");
    const passwordResult = strongPassword.safeParse(newPassword);
    const fieldErrors = {
      otp: /^\d{6}$/.test(otp) ? undefined : "Enter the 6-digit code from your email.",
      password: passwordResult.success ? undefined : passwordResult.error.issues[0]?.message,
      confirm: newPassword === confirmPassword ? undefined : "Passwords do not match.",
    };
    setResetErrors(fieldErrors);
    if (fieldErrors.otp || fieldErrors.password || fieldErrors.confirm) return;

    try {
      await resetPassword({ email: resetEmail, otp, newPassword }).unwrap();
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("done");
    } catch (err) {
      setRequestError(apiErrorMessage(
        err as Parameters<typeof apiErrorMessage>[0],
        "Could not reset your password. Check the code and try again."
      ));
    }
  };

  const handleResend = async () => {
    if (isBusy) return;
    setRequestError("");
    setNotice("");
    try {
      await resendOtp({ purpose: "RESET_PASSWORD", email: resetEmail }).unwrap();
      setOtp("");
      setResetErrors({});
      setNotice("If an account exists for this email, a new reset code has been requested. Check your inbox and spam folder.");
    } catch (err) {
      setRequestError(apiErrorMessage(
        err as Parameters<typeof apiErrorMessage>[0],
        "Could not resend the code. Please try again."
      ));
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Icon Circle */}
      <div className="flex justify-center">
        <div className="login_avatar_circle">
          <KeyRound className="w-10 h-10 stroke-[1.5]" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <h1 className="login_title">
        {t(step === "request" ? "Forgot Password?" : step === "reset" ? "Reset your password" : "Password reset")}
      </h1>
      <p className="login_subtitle">
        {step === "request" ? t("Enter your account email to request a 6-digit password reset code.")
          : step === "reset" ? <>{t("If an account exists for")} <strong>{resetEmail}</strong>, {t("a reset code will be emailed to it. Enter the code and your new password below.")}</>
          : t("Your password has been updated. Sign in with your new password.")}
      </p>

      {requestError && <p role="alert" className="text-sm text-red-700">{requestError}</p>}
      {notice && <p role="status" className="text-sm text-teal-700">{t(notice)}</p>}

      {step === "done" ? (
        <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center space-y-3">
          <p className="text-xs font-semibold text-teal-800">
            {t("Password reset successfully.")}
          </p>
          <Button
            type="button"
            onClick={onBackToLogin}
            className="login_submit_button mt-2"
          >
            {t("Back to Login")}
          </Button>
        </div>
      ) : step === "reset" ? (
        <form onSubmit={handleReset} className="w-full space-y-4" noValidate>
          <div>
            <label htmlFor="reset-otp" className="login_input_label">{t("Verification code")}</label>
            <Input
              id="reset-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              disabled={isBusy}
              className="login_input_field text-center tracking-[0.5em]"
            />
            {resetErrors.otp && <TooltipAlert message={resetErrors.otp} />}
          </div>
          <div>
            <label htmlFor="reset-password" className="login_input_label">{t("New password")}</label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isBusy}
              className="login_input_field"
            />
            <p className="mt-1 text-xs text-gray-500">{t("Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol.")}</p>
            {resetErrors.password && <TooltipAlert message={resetErrors.password} />}
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="login_input_label">{t("Confirm new password")}</label>
            <Input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isBusy}
              className="login_input_field"
            />
            {resetErrors.confirm && <TooltipAlert message={resetErrors.confirm} />}
          </div>
          <Button type="submit" disabled={isBusy} className="login_submit_button">
            {isResetting ? t("Resetting password...") : t("Reset password")}
          </Button>
          <div className="flex justify-between gap-4 text-sm">
            <button type="button" disabled={isBusy} onClick={handleResend}
              className="login_forgot_link bg-transparent border-none cursor-pointer disabled:opacity-60">
              {isResending ? t("Sending...") : t("Resend code")}
            </button>
            <button type="button" disabled={isBusy} onClick={() => {
              setStep("request");
              setResetEmail("");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
              setResetErrors({});
              setRequestError("");
              setNotice("");
            }} className="login_forgot_link bg-transparent border-none cursor-pointer disabled:opacity-60">
              {t("Use a different email")}
            </button>
          </div>
          <button type="button" disabled={isBusy} onClick={onBackToLogin}
            className="login_forgot_link w-full bg-transparent border-none cursor-pointer disabled:opacity-60">
            {t("Back to Login")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="forgot-email" className="login_input_label">
              {t("Email Address")}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                disabled={isBusy}
                value={email}
                onFocus={() => {
                  if (email.trim()) validateField(email);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  validateField(val);
                }}
                placeholder="enter your email address"
                className="login_input_field"
              />
            </div>
            {error && <TooltipAlert message={error} />}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isBusy}
            className="login_submit_button"
          >
            {isRequesting ? t("Sending...") : t("Send reset code")}
          </Button>

          {/* Back to Login Link */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={onBackToLogin}
              className="login_forgot_link flex items-center justify-center gap-1.5 cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("Back to Login")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Forgot;

