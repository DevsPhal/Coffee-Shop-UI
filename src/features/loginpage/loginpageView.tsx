"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff, Check, Heart, X } from "lucide-react";
import HomepageView from "@/features/Homepage/homepageView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Forgot } from "@/components/ui/forgot";
import { Create } from "@/components/ui/create";
import "@/app/globals.scss";

export function LoginPageView() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [viewMode, setViewMode] = useState<"login" | "forgot" | "create">("login");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="login_page_wrapper font-sans">
      {/* Left Side: Login Form */}
      <div className="login_form_side">
        {/* Top Left Back Button with back.svg icon */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="login_back_home_btn"
            title="Return to Home"
          >
            <Image
              src="/icons/back.svg"
              alt="Back to Home"
              width={24}
              height={24}
              unoptimized
              className="w-6 h-6 object-contain"
            />
          </Link>
        </div>

        {/* Form Area */}
        <div className="login_form_area">
          {/* 590st CAFE Logo with Hearts */}
          <div className="login_logo-container">
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
            <div className="login_brand_subtitle">
              CAFE
            </div>
          </div>

          {viewMode === "forgot" ? (
            <Forgot onBackToLogin={() => setViewMode("login")} />
          ) : viewMode === "create" ? (
            <Create onBackToLogin={() => setViewMode("login")} />
          ) : (
            <>
              {/* Avatar Circle */}
              <div className="login_avatar_circle">
                <User className="w-10 h-10 stroke-[1.5]" />
              </div>

              {/* Title & Subtitle */}
              <h1 className="login_title">
                Login to your account
              </h1>
              <p className="login_subtitle">
                Enter your credential to login
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
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
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="enter your username"
                      className="login_input_field"
                    />
                  </div>
                  <p className="login_input_helper">
                    Please enter your username
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="enter your password"
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
                    Please enter your password
                  </p>
                </div>

                {/* Controls Row */}
                <div className="login_controls_row">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                      className={`login_checkbox_box ${keepLoggedIn ? "checked" : ""}`}
                    >
                      {keepLoggedIn && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      Keep me logged in
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setViewMode("forgot")}
                    className="login_forgot_link cursor-pointer border-none bg-transparent"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="login_submit_button"
                >
                  Login
                </Button>
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Don't have an account?
                  </span>
                  &nbsp;
                  <button
                    type="button"
                    onClick={() => setViewMode("create")}
                    className="login_forgot_link cursor-pointer border-none bg-transparent"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div />
      </div>

      {/* Right Side: slideshowloginscreen.svg */}
      <div className="login_slideshow_side">
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
