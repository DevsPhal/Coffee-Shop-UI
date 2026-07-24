"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "@/app/globals.scss";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Catering & Events",
  "Feedback & Suggestions",
  "Partnership",
  "Order Support",
];

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubjectSelect = (subject: string) => {
    setFormData((prev) => ({ ...prev, subject }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "General Inquiry",
      message: "",
    });
    setIsSubmitted(false);
    setError(null);
  };

  if (isSubmitted) {
    return (
      <div className="contact_form_success_card">
        <div className="contact_form_success_icon">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="contact_form_success_title">Message Sent!</h3>
          <p className="contact_form_success_desc">
            Thank you, <strong>{formData.name}</strong>. We've received your message regarding <span>"{formData.subject}"</span> and will respond to <u>{formData.email}</u> shortly.
          </p>
        </div>
        <div className="contact_form_submit_wrapper">
          <Button
            onClick={handleReset}
            className="button_pill_primary cursor-pointer"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact_page_form_card">
      <div className="contact_form_header">
        <h2 className="contact_form_title">Send Us a Message</h2>
        <p className="contact_form_subtitle">
          Have a question, catering request, or feedback? Fill out the form below and we'll get back to you!
        </p>
      </div>

      {error && (
        <div className="contact_form_alert_error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact_form_stack">
        {/* Name Input */}
        <div>
          <label htmlFor="contact-name" className="contact_form_label">
            Full Name <span className="contact_form_required">*</span>
          </label>
          <div className="contact_form_input_wrapper">
            <div className="contact_form_input_icon">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="contact-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sok Sovann"
              className="contact_form_input"
            />
          </div>
        </div>

        {/* Email & Phone Row */}
        <div className="contact_form_row">
          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="contact_form_label">
              Email Address <span className="contact_form_required">*</span>
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
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="contact_form_input"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="contact-phone" className="contact_form_label">
              Phone / Telegram <span className="contact_form_optional">(Optional)</span>
            </label>
            <div className="contact_form_input_wrapper">
              <div className="contact_form_input_icon">
                <Phone className="w-4 h-4" />
              </div>
              <Input
                id="contact-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="095 600 676"
                className="contact_form_input"
              />
            </div>
          </div>
        </div>

        {/* Topic / Subject Pills */}
        <div>
          <label className="contact_form_label">
            Select Topic
          </label>
          <div className="contact_form_topic_list">
            {SUBJECT_OPTIONS.map((sub) => {
              const active = formData.subject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubjectSelect(sub)}
                  className={`contact_form_topic_btn ${active ? "active" : ""}`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="contact-message" className="contact_form_label">
            Your Message <span className="contact_form_required">*</span>
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
              onChange={handleChange}
              placeholder="Tell us what you're looking for or share your thoughts..."
              className="contact_form_textarea"
            />
          </div>
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
                Sending Message...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
