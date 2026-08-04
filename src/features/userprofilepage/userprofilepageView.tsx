"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Edit3, Check, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import "@/app/globals.scss";

export interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export function UserprofilepageView() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileData>({
    userId: "001",
    name: "Ream",
    email: "Ream123@gmail.com",
    avatarUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
  });

  const [activeTab, setActiveTab] = useState<"about" | "orders" | "settings">("about");

  // Modals & Overlay States
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for password reset
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Edit profile form state
  const [editForm, setEditForm] = useState<UserProfileData>({ ...profile });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      setPassError("Please enter your current password.");
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setPassError("");
    setPassSuccess("Password reset successfully!");

    setTimeout(() => {
      setPassSuccess("");
      setIsResetPasswordOpen(false);
      setPasswords({ current: "", newPass: "", confirmPass: "" });
      showToast("Password updated successfully!");
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditProfileOpen(false);
    showToast("Profile information updated!");
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    showToast("You have logged out.");
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="user_profile_container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="user_profile_wrapper">
        {/* Top Header & Breadcrumbs */}
        <div className="product_detail_header">
          <h1 className="product_detail_title">User Profile</h1>

          <nav className="product_detail_breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="breadcrumb_link">
              Home
            </Link>
            <span className="breadcrumb_separator">»</span>
            <span className="breadcrumb_current">User Profile</span>
          </nav>
        </div>

        {/* User Profile Main Card */}
        <div className="user_profile_card">
          {/* Left Avatar Side */}
          <div className="user_profile_avatar_side">
            <div className="user_profile_avatar_box group">
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                unoptimized
                className="user_profile_avatar_img"
              />
              <button
                type="button"
                onClick={() => {
                  setEditForm({ ...profile });
                  setIsEditProfileOpen(true);
                }}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium transition-opacity cursor-pointer border-none"
                title="Change Avatar"
              >
                <Edit3 className="w-5 h-5 mb-1" />
                <span>Edit Photo</span>
              </button>
            </div>
          </div>

          {/* Right Content Side */}
          <div className="user_profile_content_side">
            <div>
              {/* Header Row: Username + Reset Password Button */}
              <div className="user_profile_header_row">
                <h2 className="user_profile_username">{profile.name}</h2>
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="user_profile_reset_btn"
                >
                  reset password
                </button>
              </div>

              {/* Tabs Bar */}
              <div className="user_profile_tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`user_profile_tab_item ${
                    activeTab === "about" ? "" : "text-gray-500 border-transparent"
                  }`}
                >
                  About
                </button>
              </div>

              {/* Profile Details List */}
              {activeTab === "about" && (
                <div className="user_profile_details">
                  <div className="user_profile_detail_row">
                    <span className="user_profile_detail_label">User Id</span>
                    <span className="user_profile_detail_value">{profile.userId}</span>
                  </div>

                  <div className="user_profile_detail_row">
                    <span className="user_profile_detail_label">Name</span>
                    <span className="user_profile_detail_value">{profile.name}</span>
                  </div>

                  <div className="user_profile_detail_row">
                    <span className="user_profile_detail_label">Email</span>
                    <span className="user_profile_detail_value">{profile.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Log Out */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="user_profile_logout_btn"
              >
                Log Out
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditForm({ ...profile });
                  setIsEditProfileOpen(true);
                }}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {isResetPasswordOpen && (
        <div className="modal_backdrop" onClick={() => setIsResetPasswordOpen(false)}>
          <div
            className="modal_card max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal_close_btn"
              onClick={() => setIsResetPasswordOpen(false)}
            >
              
            </button>

            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Reset Password</h3>
                <p className="text-xs text-gray-500">Update your account security password</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
              {passError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-100 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirmPass}
                  onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors border-none cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal_backdrop" onClick={() => setIsEditProfileOpen(false)}>
          <div
            className="modal_card max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal_close_btn"
              onClick={() => setIsEditProfileOpen(false)}
            >
              
            </button>

            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
                <p className="text-xs text-gray-500">Update your public profile details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  User Id
                </label>
                <input
                  type="text"
                  value={editForm.userId}
                  onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors border-none cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="modal_backdrop" onClick={() => setIsLogoutModalOpen(false)}>
          <div
            className="modal_card max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-1">Log Out</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors border-none cursor-pointer flex-1"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserprofilepageView;
