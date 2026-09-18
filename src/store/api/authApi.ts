import { clearTokens, setTokens } from "@/lib/authStorage";
import { baseApi, unwrap } from "./baseApi";
import type {
  ApiEnvelope,
  AuthTokenResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  TelegramLinkCodeResponse,
  TelegramWidgetAuthRequest,
  UpdateProfileRequest,
  UserResponse,
  VerifyLoginOtpRequest,
  VerifyRegistrationRequest,
} from "./types";

/**
 * Customer authentication. Both registration and login are two-step: the API emails a 6-digit
 * code and the second call exchanges it. The `local` Spring profile also logs the code;
 * SMTP delivery uses the configured MAIL_* credentials in both profiles.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<void, RegisterRequest>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),

    /** Second half of sign-up; the account stays PENDING_VERIFICATION until this succeeds. */
    verifyRegistration: builder.mutation<void, VerifyRegistrationRequest>({
      query: (body) => ({ url: "/api/auth/verify-registration", method: "POST", body }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<LoginResponse>) => {
        const result = unwrap(response);
        // Customers always get an OTP challenge, but handle the direct-token branch too.
        if (result.tokens) setTokens(result.tokens);
        return result;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    verifyLoginOtp: builder.mutation<AuthTokenResponse, VerifyLoginOtpRequest>({
      query: (body) => ({ url: "/api/auth/verify-login-otp", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<AuthTokenResponse>) => {
        const tokens = unwrap(response);
        setTokens(tokens);
        return tokens;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    resendOtp: builder.mutation<void, ResendOtpRequest>({
      query: (body) => ({ url: "/api/auth/resend-otp", method: "POST", body }),
    }),

    /**
     * Sign-in via the Telegram Login Widget. Unlike email/password, this is a single step —
     * the widget's `hash` already proves the customer owns that Telegram account, so the API
     * returns tokens directly rather than an OTP challenge. Only works for a Telegram account
     * already linked to a customer (see `getTelegramLinkCode` below); there is no Telegram
     * sign-up, so an unlinked account gets a normal error here, not a new account.
     */
    loginTelegram: builder.mutation<AuthTokenResponse, TelegramWidgetAuthRequest>({
      query: (body) => ({ url: "/api/auth/login/telegram", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<AuthTokenResponse>) => {
        const tokens = unwrap(response);
        setTokens(tokens);
        return tokens;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/api/auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/api/auth/reset-password", method: "POST", body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      // Drop the session locally whether or not the server call succeeded.
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          clearTokens();
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    getCurrentUser: builder.query<UserResponse, void>({
      query: () => "/api/users/me",
      transformResponse: unwrap<UserResponse>,
      providesTags: ["Auth"],
    }),

    /**
     * Self-service edit of name, phone and gender. The API applies a partial update, so send
     * only what the customer actually changed — and note that `phoneNumber: ""` is a real
     * instruction to clear it, not the same as leaving the field out.
     */
    updateProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (body) => ({ url: "/api/users/me", method: "PATCH", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: ["Auth"],
    }),

    uploadAvatar: builder.mutation<UserResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        // No explicit Content-Type: the browser sets the multipart boundary.
        return { url: "/api/users/me/avatar", method: "POST", body: formData };
      },
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: ["Auth"],
    }),

    removeAvatar: builder.mutation<UserResponse, void>({
      query: () => ({ url: "/api/users/me/avatar", method: "DELETE" }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: ["Auth"],
    }),

    /**
     * A mutation, not a query: each call issues a fresh short-lived code, so caching or
     * refetching it the way a query would could hand out an already-expired one.
     */
    getTelegramLinkCode: builder.mutation<TelegramLinkCodeResponse, void>({
      query: () => ({ url: "/api/users/me/telegram/link-code", method: "POST" }),
      transformResponse: unwrap<TelegramLinkCodeResponse>,
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyRegistrationMutation,
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useResendOtpMutation,
  useLoginTelegramMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useGetTelegramLinkCodeMutation,
} = authApi;
