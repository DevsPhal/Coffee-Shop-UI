"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Edit3, Check, ShieldCheck, User, Upload, Eye, EyeOff, MessageSquare, Calendar, Tag, ExternalLink, ShoppingBag, Clock, ChevronRight, CheckCircle2, Move } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useContactStore } from "@/store/useContactStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/toast";
import { Modal, ModalContent } from "@/components/ui/modal";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { cleanPhoneInput } from "@/lib/phoneUtils";
import "@/app/globals.scss";

export interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  capital?: string;
  district?: string;
  zipCode?: string;
  address?: string;
}

export function UserprofilepageView() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();
  const { messagesHistory } = useContactStore();
  const { ordersHistory } = useOrderStore();
  const { addItem, openCart } = useCart();

  const userMessages = user
    ? messagesHistory.filter(
        (m) =>
          (!!user.userId && m.userId === user.userId) ||
          (!!user.email && m.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
          (!!user.name && m.fullName && m.fullName.toLowerCase() === user.name.toLowerCase())
      )
    : [];

  const userOrders = user
    ? ordersHistory.filter((o) => {
        if (user.userId && o.userId === user.userId) return true;
        if (user.name && o.customerName && o.customerName.toLowerCase() === user.name.toLowerCase()) return true;
        if (user.email && o.customerName && o.customerName.toLowerCase() === user.email.toLowerCase()) return true;
        return false;
      })
    : [];

  const profile: UserProfileData = {
    userId: user?.userId || "N/A",
    name: user?.name || "Guest",
    email: user?.email || "N/A",
    phone: user?.phone || "",
    avatarUrl:
      user?.avatarUrl ||
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    capital: user?.capital || "Phnom Penh",
    district: user?.district || "Khan Boeng Keng Kang",
    zipCode: user?.zipCode || "120000",
    address: user?.address || "",
  };

  const [activeTab, setActiveTab] = useState<"about" | "messages" | "orders">("about");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const maskEmail = (email: string) => {
    if (!email || email === "N/A") return "N/A";
    const parts = email.split("@");
    if (parts.length !== 2) return "••••••••";
    const [userPart, domain] = parts;
    if (userPart.length <= 2) {
      return `${userPart.slice(0, 1)}***@${domain}`;
    }
    const maskedName = `${userPart.slice(0, 2)}${"*".repeat(Math.max(userPart.length - 2, 3))}`;
    return `${maskedName}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "";
    if (phone.length <= 4) return "••••••••";
    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  };

  // Modals & Overlay States
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Password Verification Modal States
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<"changePassword" | "editProfile" | "email" | "phone" | null>(null);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyShowPassword, setVerifyShowPassword] = useState(false);

  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPassword.trim()) {
      const err = "Password is required.";
      setVerifyError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }

    const correctPassword = user?.password || "123";

    if (verifyPassword !== correctPassword) {
      const err = "Incorrect password. Please try again.";
      setVerifyError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }

    setVerifyError("");
    setIsVerifyModalOpen(false);

    if (verifyTarget === "changePassword") {
      setPasswords({ current: verifyPassword, newPass: "", confirmPass: "" });
      setPassError("");
      setIsResetPasswordOpen(true);
      toast.add({
        type: "success",
        description: "Password verified! Please enter your new password.",
      });
    } else if (verifyTarget === "editProfile") {
      setEditForm({ ...profile });
      setIsEditProfileOpen(true);
      toast.add({
        type: "success",
        description: "Password verified! You can now edit your profile.",
      });
    } else if (verifyTarget === "email") {
      setShowEmail(true);
    } else if (verifyTarget === "phone") {
      setShowPhone(true);
    }

    setVerifyPassword("");
  };

  // Form states for password reset
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [passError, setPassError] = useState("");

  // Edit profile form state
  const [editForm, setEditForm] = useState<UserProfileData>({ ...profile });

  // Avatar position adjustment state
  const [avatarPos, setAvatarPos] = useState({ x: 50, y: 50 });
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const dragStartRef = React.useRef({ mouseX: 0, mouseY: 0, posX: 50, posY: 50 });

  const handleAvatarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: avatarPos.x,
      posY: avatarPos.y,
    };
  };

  const handleAvatarMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingAvatar) return;
    const deltaX = (e.clientX - dragStartRef.current.mouseX) * 0.6;
    const deltaY = (e.clientY - dragStartRef.current.mouseY) * 0.6;
    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - deltaY));
    setAvatarPos({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingAvatar(true);
      dragStartRef.current = {
        mouseX: e.touches[0].clientX,
        mouseY: e.touches[0].clientY,
        posX: avatarPos.x,
        posY: avatarPos.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingAvatar || e.touches.length !== 1) return;
    const deltaX = (e.touches[0].clientX - dragStartRef.current.mouseX) * 0.6;
    const deltaY = (e.touches[0].clientY - dragStartRef.current.mouseY) * 0.6;
    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - deltaY));
    setAvatarPos({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleAvatarMouseUp = () => {
    setIsDraggingAvatar(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPass.trim()) {
      const err = "New password is required.";
      setPassError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }
    if (passwords.newPass.length < 3) {
      const err = "New password must be at least 3 characters.";
      setPassError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }
    if (!passwords.confirmPass.trim()) {
      const err = "Confirm password is required.";
      setPassError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      const err = "New password and confirm password do not match.";
      setPassError(err);
      toast.add({
        type: "warning",
        description: err,
      });
      return;
    }

    setPassError("");
    updateUser({ password: passwords.newPass });
    setIsResetPasswordOpen(false);
    setPasswords({ current: "", newPass: "", confirmPass: "" });
    toast.add({
      type: "success",
      description: "Password updated successfully!",
    });
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
                style={{ objectPosition: `${avatarPos.x}% ${avatarPos.y}%` }}
              />
              <button
                type="button"
                onClick={() => {
                  setVerifyTarget("editProfile");
                  setVerifyPassword("");
                  setVerifyError("");
                  setIsVerifyModalOpen(true);
                }}
                className="user_profile_avatar_edit_btn"
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
              {/* Header Row: Username + Edit Profile & Change Password Buttons */}
              <div className="user_profile_header_row">
                <h2 className="user_profile_username" suppressHydrationWarning>{profile.name}</h2>
                <div className="user_profile_action_group">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyTarget("editProfile");
                      setVerifyPassword("");
                      setVerifyError("");
                      setIsVerifyModalOpen(true);
                    }}
                    title="Edit Profile"
                    className="user_profile_change_btn"
                  >
                    <Edit3 className="w-4 h-4 sm:w-3 sm:h-3" />
                    <span className="btn_responsive_text">Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyTarget("changePassword");
                      setVerifyPassword("");
                      setVerifyError("");
                      setIsVerifyModalOpen(true);
                    }}
                    title="Change Password"
                    className="user_profile_change_btn"
                  >
                    <KeyRound className="w-4 h-4 sm:w-3 sm:h-3" />
                    <span className="btn_responsive_text">Change Password</span>
                  </button>
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="user_profile_tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`user_profile_tab_item ${
                    activeTab === "about" ? "active_tab" : ""
                  }`}
                >
                  About
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  className={`user_profile_tab_item flex items-center gap-1.5 ${
                    activeTab === "messages" ? "active_tab" : ""
                  }`}
                >
                  <span>My Messages</span>
                  <span
                    className={`tab_badge ${
                      activeTab === "messages" ? "tab_badge_active" : ""
                    }`}
                  >
                    {userMessages.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`user_profile_tab_item flex items-center gap-1.5 ${
                    activeTab === "orders" ? "active_tab" : ""
                  }`}
                >
                  <span>Order History</span>
                  <span
                    className={`tab_badge ${
                      activeTab === "orders" ? "tab_badge_active" : ""
                    }`}
                  >
                    {userOrders.length}
                  </span>
                </button>
              </div>

              {/* Profile Details List */}
              {activeTab === "about" && (
                <div className="user_profile_details">
                  <div className="user_profile_detail_row">
                    <span className="user_profile_detail_label">User Id</span>
                    <span className="user_profile_detail_value" suppressHydrationWarning>#{profile.userId}</span>
                  </div>

                  <div className="user_profile_detail_row">
                    <span className="user_profile_detail_label">Email</span>
                    <span className="user_profile_detail_value">
                      {profile.email}
                    </span>
                  </div>

                  {profile.phone && (
                    <div className="user_profile_detail_row">
                      <span className="user_profile_detail_label">Phone Number</span>
                      <span className="user_profile_detail_value">
                        {profile.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Tab Content */}
              {activeTab === "messages" && (
                <div>
                  {userMessages.length === 0 ? (
                    <div className="profile_empty_state">
                      <MessageSquare className="profile_empty_icon" />
                      <p className="profile_empty_title">No Sent Messages Yet</p>
                      <p className="profile_empty_desc">
                        Have questions or feedback? Send us a message from our contact page.
                      </p>
                      <Link
                        href="/contact"
                        className="profile_empty_btn"
                      >
                        <span>Contact Us</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="history_scroll_list">
                      {userMessages.map((msg) => (
                        <div key={msg.id} className="history_item_card">
                          <div className="history_header_row">
                            <span className="message_topic_badge">
                              <Tag className="w-3 h-3" />
                              {msg.topic}
                            </span>
                            <span className="history_meta_date">
                              <Calendar className="w-3 h-3" />
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="message_bubble_content">
                            "{msg.message}"
                          </p>
                          <div className="message_footer_row">
                            <span>Status: <strong className="message_status_text">{msg.status || "Received"}</strong></span>
                            <span>{msg.phone ? `Phone: ${msg.phone}` : msg.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Order History Tab Content */}
              {activeTab === "orders" && (
                <div>
                  {userOrders.length === 0 ? (
                    <div className="profile_empty_state">
                      <ShoppingBag className="profile_empty_icon" />
                      <p className="profile_empty_title">No Past Orders Found</p>
                      <p className="profile_empty_desc">
                        Once you complete checkout, your order history will appear here.
                      </p>
                      <Link
                        href="/menu"
                        className="profile_empty_btn profile_empty_btn_secondary"
                      >
                        <span>Order Now</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="history_scroll_list">
                      {userOrders.map((order) => (
                        <div key={order.id} className="history_item_card">
                          <div className="history_header_row">
                            <div className="flex items-center gap-2">
                              <span className="order_id_badge">{order.id}</span>
                              <span
                                className={`order_status_badge ${
                                  order.status === "Completed"
                                    ? "order_status_completed"
                                    : order.status === "On the way"
                                    ? "order_status_transit"
                                    : "order_status_pending"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <span className="history_meta_date">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="order_items_box">
                            {order.items.map((it, idx) => (
                              <div key={it.id || idx} className="order_item_row">
                                <span>{it.quantity}x {it.title}</span>
                                <span className="order_item_price">$ {(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order_footer_row">
                            <div className="order_total_wrapper">
                              <span className="order_total_label">Grand Total: </span>
                              <span className="order_total_value">$ {order.grandTotal.toFixed(2)}</span>
                            </div>

                            <div className="order_actions_group">
                              <button
                                type="button"
                                onClick={() => {
                                  order.items.forEach((item) => {
                                    addItem({ id: item.id, title: item.title, price: item.price, quantity: item.quantity, image: item.image || "" }, false);
                                  });
                                  toast.add({ type: "success", description: "Items reordered into cart!" });
                                  openCart();
                                }}
                                className="btn_reorder"
                              >
                                Reorder
                              </button>

                              {order.status === "Completed" ? (
                                <Link
                                  href={`/checkoutdone?id=${order.id}`}
                                  className="btn_order_status_complete"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Order Complete</span>
                                </Link>
                              ) : (
                                <Link
                                  href={`/checkoutdone?id=${order.id}`}
                                  className="btn_order_track"
                                >
                                  <span>Track</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions: Log Out (Aligned Right Bottom) */}
            <div className="profile_bottom_actions">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="user_profile_logout_btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <ModalContent className="max-w-md text-left p-6" showCloseButton={false}>
          <div className="modal_header_group">
            <div className="modal_icon_box">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="modal_title">Change Password</h3>
              <p className="modal_subtitle">Enter your new security password below</p>
            </div>
          </div>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2 text-left" noValidate>
            <div className="modal_notice_success">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Current password verified successfully</span>
            </div>

            <div className="modal_input_group">
              <label className="modal_input_label">
                New Password
              </label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => {
                  setPasswords({ ...passwords, newPass: e.target.value });
                  if (passError) setPassError("");
                }}
                placeholder="Enter new password (at least 3 characters)"
                className={`modal_input_control ${passError ? "modal_input_control_error" : ""}`}
              />
            </div>

            <div className="modal_input_group">
              <label className="modal_input_label">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => {
                  setPasswords({ ...passwords, confirmPass: e.target.value });
                  if (passError) setPassError("");
                }}
                placeholder="Re-enter new password"
                className={`modal_input_control ${passError ? "modal_input_control_error" : ""}`}
              />
              {passError && <TooltipAlert message={passError} />}
            </div>

            <div className="modal_footer_actions">
              <button
                type="button"
                onClick={() => setIsResetPasswordOpen(false)}
                className="btn_modal_cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn_modal_submit"
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
          <div className="modal_header_group">
            <div className="modal_icon_box">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="modal_title">Edit Profile</h3>
              <p className="modal_subtitle">Update your public profile details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
            {/* Split 2-Column Layout */}
            <div className="profile_edit_split_layout">
              {/* LEFT SIDE: Photo & Direct Drag-to-Move */}
              <div className="profile_edit_avatar_column">
                <span className="profile_edit_avatar_label">
                  Profile Picture
                </span>

                {/* Direct Drag-to-Move Circular Avatar Box */}
                <div
                  className="avatar_interactive_wrapper group"
                  onMouseDown={handleAvatarMouseDown}
                  onMouseMove={handleAvatarMouseMove}
                  onMouseUp={handleAvatarMouseUp}
                  onMouseLeave={handleAvatarMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleAvatarMouseUp}
                  title="Click & drag to adjust image position"
                >
                  <Image
                    src={editForm.avatarUrl}
                    alt="Avatar Preview"
                    fill
                    priority
                    unoptimized
                    className="object-cover pointer-events-none transition-none"
                    style={{ objectPosition: `${avatarPos.x}% ${avatarPos.y}%` }}
                  />
                  <div className="avatar_drag_hint_overlay">
                    <Move className="w-4 h-4 text-white mb-0.5" />
                    <span>Drag to move</span>
                  </div>
                </div>

                <label
                  htmlFor="avatar-file-upload"
                  className="btn_upload_photo"
                >
                  <Upload className="w-3.5 h-3.5 text-[#A1255B]" />
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
                <span className="upload_hint_caption">
                  File Explorer / Phone
                </span>
              </div>

              {/* RIGHT SIDE: User Details */}
              <div className="profile_edit_fields_column">
                <div className="profile_edit_grid_2col">
                  <div className="modal_input_group">
                    <label className="modal_input_label">
                      User Id
                    </label>
                    <input
                      type="text"
                      value={editForm.userId}
                      onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                      className="modal_input_control modal_input_control_disabled"
                      disabled
                    />
                  </div>

                  <div className="modal_input_group">
                    <label className="modal_input_label">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="modal_input_control"
                      required
                    />
                  </div>
                </div>

                <div className="profile_edit_grid_2col">
                  <div className="modal_input_group">
                    <label className="modal_input_label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="modal_input_control"
                      required
                    />
                  </div>

                  <div className="modal_input_group">
                    <label className="modal_input_label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: cleanPhoneInput(e.target.value) })}
                      placeholder="e.g. 12345678"
                      className="modal_input_control"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal_footer_actions">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="btn_modal_cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn_modal_submit"
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
          <div className="logout_modal_icon_box">
            <LogOut className="w-6 h-6" />
          </div>

          <h3 className="logout_modal_title">Log Out</h3>
          <p className="logout_modal_subtitle">
            Are you sure you want to log out of your account?
          </p>

          <div className="logout_modal_actions">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="btn_modal_cancel btn_modal_cancel_flex"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn_logout_confirm"
            >
              Log Out
            </button>
          </div>
        </ModalContent>
      </Modal>

      {/* Verify Password Modal */}
      <Modal open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <ModalContent className="max-w-[420px] w-[92%] p-6 text-left" showCloseButton={false}>
          <div className="modal_header_group">
            <div className="modal_icon_box">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="modal_title">Password Verification</h3>
              <p className="modal_subtitle">
                {verifyTarget === "changePassword"
                  ? "Enter your current password to verify your identity before changing password"
                  : verifyTarget === "editProfile"
                  ? "Enter your current password to verify your identity before editing profile"
                  : "Confirm your password to proceed"}
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyPasswordSubmit} className="space-y-4 pt-1 text-left" noValidate>

            <div className="modal_input_group">
              <label className="modal_input_label">
                Account Password
              </label>
              <div className="password_input_container">
                <input
                  type={verifyShowPassword ? "text" : "password"}
                  value={verifyPassword}
                  onChange={(e) => {
                    setVerifyPassword(e.target.value);
                    if (verifyError) setVerifyError("");
                  }}
                  placeholder="Enter your account password"
                  className={`modal_input_control password_input_field ${
                    verifyError ? "modal_input_control_error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVerifyShowPassword(!verifyShowPassword)}
                  className="password_visibility_toggle"
                >
                  {verifyShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {verifyError && <TooltipAlert message={verifyError} />}
            </div>

            <div className="modal_footer_actions">
              <button
                type="button"
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setVerifyPassword("");
                  setVerifyError("");
                }}
                className="btn_modal_cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn_modal_submit"
              >
                Confirm
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UserprofilepageView;
