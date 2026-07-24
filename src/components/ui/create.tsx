"use client";

import React, { useState } from "react";
import { User, Mail, Eye, EyeOff, UserPlus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "@/app/globals.scss";

interface CreateProps {
  onBackToLogin: () => void;
}

export function Create({ onBackToLogin }: CreateProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && email && password) {
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Avatar Circle */}
      <div className="flex justify-center">
        <div className="login_avatar_circle">
          <UserPlus className="w-10 h-10 stroke-[1.5]" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <h1 className="login_title">
        Create an account
      </h1>
      <p className="login_subtitle">
        Enter your details below to create your account
      </p>

      {submitted ? (
        <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center space-y-3">
          <p className="text-xs font-semibold text-teal-800">
            Account Created Successfully!
          </p>
          <p className="text-[11px] text-teal-600">
            Welcome, <span className="font-medium">{username}</span>! You can now log in with your credentials.
          </p>
          <Button
            type="button"
            onClick={onBackToLogin}
            className="login_submit_button mt-2"
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Username Field */}
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
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter your username"
                className="login_input_field"
              />
            </div>
            <p className="login_input_helper">
              Choose a unique username
            </p>
          </div>

          {/* Email Field */}
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email address"
                className="login_input_field"
              />
            </div>
            <p className="login_input_helper">
              Please enter a valid email address
            </p>
          </div>

          {/* Phone Field */}
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="enter your phone number"
                className="login_input_field"
              />
            </div>
            <p className="login_input_helper">
              Please enter your phone number
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="login_input_label">
              Password
            </label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="login_input_helper">
              Password must be at least 6 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="login_submit_button mt-2"
          >
            Sign Up
          </Button>

          {/* Switch to Login Link */}
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
      )}
    </div>
  );
}

export default Create;

