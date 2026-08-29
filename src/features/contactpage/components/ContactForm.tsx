"use client";

import React, { useEffect } from "react";
import { User, Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipAlert } from "@/components/ui/tooltip-alert";
import { useContactStore } from "@/store/useContactStore";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { cleanPhoneInput } from "@/lib/phoneUtils";
import "@/app/globals.scss";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Catering & Events",
  "Feedback & Suggestions",
  "Partnership",
  "Order Support",
];

export function ContactForm() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const {
    formData,
    isSubmitting,
    isSubmitted,
    errors,
    setField,
    setTopic,
    prefillUser,
    validateField,
    resetForm,
    submitMessage,
  } = useContactStore();

  useEffect(() => {
    if (user) {
      prefillUser(user);
    }
  }, [user, prefillUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldKey = name as keyof typeof formData;
    const finalVal = name === "phone" ? cleanPhoneInput(value) : value;
    setField(fieldKey, finalVal);
    validateField(fieldKey, finalVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && updateUser) {
      updateUser({
        name: formData.fullName ? formData.fullName : user.name,
        email: formData.email ? formData.email : user.email,
        phone: formData.phone ? formData.phone : user.phone,
      });
    }
    await submitMessage(user);
  };

  if (isSubmitted) {
    return (
      <div className="contact_form_success_card">
        <div className="contact_form_success_icon">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="contact_form_success_title">{t("Message Sent!")}</h3>
          <p className="contact_form_success_desc">
            {t("Thank you,")} <strong suppressHydrationWarning>{formData.fullName}</strong>. {t("We've received your message regarding")} <span suppressHydrationWarning>"{t(formData.topic)}"</span> {t("and will respond to")} <u suppressHydrationWarning>{formData.email}</u> {t("shortly.")}
          </p>
        </div>
        <div className="contact_form_submit_wrapper">
          <Button
            onClick={resetForm}
            className="button_pill_primary cursor-pointer"
          >
            {t("Send Another Message")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact_page_form_card">
      <div className="contact_form_header">
        {user && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#A1255B] bg-[#fff1f2] border border-[#fecdd3] rounded-full" suppressHydrationWarning>
              <User className="w-3.5 h-3.5" />
              {t("Connected with")} {user.name}
            </span>
          </div>
        )}
        <h2 className="contact_form_title">{t("Send Us a Message")}</h2>
        <p className="contact_form_subtitle">
          {t("Have a question, catering request, or feedback? Fill out the form below and we'll get back to you!")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="contact_form_stack">
        {/* Full Name Input */}
        <div>
          <label htmlFor="contact-fullName" className="contact_form_label">
            {t("Full Name")} <span className="contact_form_required">*</span>
          </label>
          <div className="contact_form_input_wrapper">
            <div className="contact_form_input_icon">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="contact-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t("e.g. Sok Sovann")}
              className="contact_form_input"
              aria-invalid={!!errors.fullName}
            />
          </div>
          {errors.fullName && <TooltipAlert message={t(errors.fullName)} />}
        </div>

        {/* Email & Phone Row */}
        <div className="contact_form_row">
          {/* Email Address */}
          <div>
            <label htmlFor="contact-email" className="contact_form_label">
              {t("Email Address")} <span className="contact_form_required">*</span>
            </label>
            <div className="contact_form_input_wrapper">
              <div className="contact_form_input_icon">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="contact_form_input"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <TooltipAlert message={t(errors.email)} />}
          </div>

          {/* Phone / Telegram */}
          <div>
            <label htmlFor="contact-phone" className="contact_form_label">
              {t("Phone / Telegram")} <span className="contact_form_optional">({t("Optional")})</span>
            </label>
            <div className="contact_form_input_wrapper">
              <div className="contact_form_input_icon">
                <Phone className="w-4 h-4" />
              </div>
              <Input
                id="contact-phone"
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="095 600 676"
                className="contact_form_input"
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && <TooltipAlert message={t(errors.phone)} />}
          </div>
        </div>

        {/* Select Topic Pills */}
        <div>
          <label className="contact_form_label">
            {t("Select Topic")}
          </label>
          <div className="contact_form_topic_list">
            {SUBJECT_OPTIONS.map((sub) => {
              const active = formData.topic === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setTopic(sub)}
                  className={`contact_form_topic_btn ${active ? "active" : ""}`}
                >
                  {t(sub)}
                </button>
              );
            })}
          </div>
          {errors.topic && <TooltipAlert message={t(errors.topic)} />}
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="contact-message" className="contact_form_label">
            {t("Your Message")} <span className="contact_form_required">*</span>
          </label>
          <div className="contact_form_input_wrapper">
            <div className="contact_form_input_icon_top">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="contact-message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t("Tell us what you're looking for or share your thoughts...")}
              className="contact_form_textarea"
              aria-invalid={!!errors.message}
            />
          </div>
          {errors.message && <TooltipAlert message={t(errors.message)} />}
        </div>

        {/* Submit Button */}
        <div className="contact_form_submit_wrapper">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="button_pill_primary cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                {t("Sending Message...")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                {t("Send Message")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
