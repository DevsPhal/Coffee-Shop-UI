"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Edit3, Check, ShieldCheck, User, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/toast";
import { Modal, ModalContent } from "@/components/ui/modal";
import "@/app/globals.scss";

export interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
}

export function UserprofilepageView() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();

  const profile: UserProfileData = {
    userId: user?.userId || "001",
    name: user?.name || "Ream",
    email: user?.email || "Ream123@gmail.com",
    phone: user?.phone || "011111111",
    avatarUrl:
      user?.avatarUrl ||
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
  };

  const [activeTab, setActiveTab] = useState<"about" | "orders" | "settings">("about");

  // Modals & Overlay States
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
      toast.add({
        type: "success",
        description: "Password updated successfully!",
      });
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editForm);
    setIsEditProfileOpen(false);
    toast.add({
      type: "success",
      description: "Profile information updated!",
    });
  };


  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <div className="user_profile_container">

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
                priority
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

                  {profile.phone && (
                    <div className="user_profile_detail_row">
                      <span className="user_profile_detail_label">Phone Number</span>
                      <span className="user_profile_detail_value">{profile.phone}</span>
                    </div>
                  )}
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
      <Modal open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <ModalContent className="max-w-md text-left p-6" showCloseButton={false}>
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100 text-left">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-lg">Reset Password</h3>
              <p className="text-xs text-gray-500">Update your account security password</p>
            </div>
          </div>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2 text-left">
            {passError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium text-left">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-100 font-medium flex items-center gap-2 text-left">
                <ShieldCheck className="w-4 h-4" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-700 mb-1 text-left" style={{ textAlign: "left" }}>
                Current Password
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-700 mb-1 text-left" style={{ textAlign: "left" }}>
                New Password
              </label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-700 mb-1 text-left" style={{ textAlign: "left" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
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
        </ModalContent>
      </Modal>

      {/* Edit Profile Modal (Full Width Landscape Split Layout) */}
      <Modal open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <ModalContent className="max-w-[680px] w-[92%] p-6 text-left" showCloseButton={false}>
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-5 text-left">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
              <p className="text-xs text-gray-500">Update your public profile details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
            {/* Split 2-Column Layout */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch w-full text-left">
              {/* LEFT SIDE: Photo Only */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center w-full md:w-[180px] flex-shrink-0">
                <span className="block text-xs font-semibold text-gray-700 mb-3">
                  Profile Picture
                </span>

                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md mb-3 bg-gray-200 flex-shrink-0">
                  <Image
                    src={editForm.avatarUrl}
                    alt="Avatar Preview"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <label
                  htmlFor="avatar-file-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg border border-gray-300 shadow-xs hover:bg-gray-100 transition-colors cursor-pointer w-full justify-center"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Photo</span>
                </label>
                <input
                  type="file"
                  id="avatar-file-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) {
                          setEditForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <span className="text-[10px] text-gray-500 mt-2">
                  File Explorer / Phone
                </span>
              </div>

              {/* RIGHT SIDE: User Id, Display Name, Email Address (Stretches Full Width & Left Aligned) */}
              <div className="space-y-4 flex flex-col justify-center flex-1 min-w-0 text-left">
                <div className="w-full text-left">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-left" style={{ textAlign: "left" }}>
                    User Id
                  </label>
                  <input
                    type="text"
                    value={editForm.userId}
                    onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                    className="w-full block px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left"
                    style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
                    required
                  />
                </div>

                <div className="w-full text-left">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-left" style={{ textAlign: "left" }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full block px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left"
                    style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
                    required
                  />
                </div>

                <div className="w-full text-left">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-left" style={{ textAlign: "left" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full block px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left"
                    style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors border-none cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <ModalContent className="max-w-sm text-center p-6" showCloseButton={false}>
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
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UserprofilepageView;
