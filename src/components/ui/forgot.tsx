"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "@/app/globals.scss";

interface ForgotProps {
  onBackToLogin: () => void;
}

export function Forgot({ onBackToLogin }: ForgotProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
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
        Forgot Password?
      </h1>
      <p className="login_subtitle">
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>

      {submitted ? (
        <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center space-y-3">
          <p className="text-xs font-semibold text-teal-800">
            Reset link sent!
          </p>
          <p className="text-[11px] text-teal-600">
            Check your inbox at <span className="font-medium">{email}</span> for further instructions.
          </p>
          <Button
            type="button"
            onClick={onBackToLogin}
            className="login_submit_button mt-2"
          >
            Back to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email Field */}
          <div>
            <label className="login_input_label">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email address"
                className="login_input_field"
              />
            </div>
            <p className="login_input_helper">
              Please enter your registered email address
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="login_submit_button"
          >
            Send Reset Link
          </Button>

          {/* Back to Login Link */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="login_forgot_link flex items-center justify-center gap-1.5 cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Forgot;

