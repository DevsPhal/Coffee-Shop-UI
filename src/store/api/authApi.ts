import { clearTokens, setTokens } from "@/lib/authStorage";
import { markWelcomePending } from "@/lib/welcomeToast";
import { baseApi, unwrap } from "./baseApi";
import type {
  ApiEnvelope,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  TelegramLinkCodeResponse,
  TelegramLoginChallenge,
  TelegramLoginStatusRequest,
  TelegramLoginStatusResponse,
  TelegramWidgetConfigResponse,
  TelegramWidgetAuthRequest,
  UpdateProfileRequest,
  UserResponse,
  VerifyLoginOtpRequest,
  VerifyRegistrationRequest,
} from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<void, RegisterRequest>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),

    verifyRegistration: builder.mutation<void, VerifyRegistrationRequest>({
      query: (body) => ({ url: "/api/auth/verify-registration", method: "POST", body }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<LoginResponse>) => {
        const result = unwrap(response);
        if (result.tokens) {
          setTokens(result.tokens);
          markWelcomePending();
        }
        return result;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    verifyLoginOtp: builder.mutation<AuthTokenResponse, VerifyLoginOtpRequest>({
      query: (body) => ({ url: "/api/auth/verify-login-otp", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<AuthTokenResponse>) => {
        const tokens = unwrap(response);
        setTokens(tokens);
        markWelcomePending();
        return tokens;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    resendOtp: builder.mutation<void, ResendOtpRequest>({
      query: (body) => ({ url: "/api/auth/resend-otp", method: "POST", body }),
    }),

    getTelegramWidgetConfig: builder.query<TelegramWidgetConfigResponse, void>({
      query: () => "/api/auth/telegram/widget-config",
      transformResponse: unwrap<TelegramWidgetConfigResponse>,
    }),

    loginTelegram: builder.mutation<AuthTokenResponse, TelegramWidgetAuthRequest>({
      query: (body) => ({ url: "/api/auth/login/telegram", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<AuthTokenResponse>) => {
        const tokens = unwrap(response);
        setTokens(tokens);
        markWelcomePending();
        return tokens;
      },
      invalidatesTags: ["Auth", "Cart", "Order"],
    }),

    startTelegramLogin: builder.mutation<TelegramLoginChallenge, void>({
      query: () => ({ url: "/api/auth/telegram/login-requests", method: "POST" }),
      transformResponse: unwrap<TelegramLoginChallenge>,
    }),

    checkTelegramLogin: builder.mutation<TelegramLoginStatusResponse, TelegramLoginStatusRequest>({
      query: (body) => ({ url: "/api/auth/telegram/login-requests/status", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<TelegramLoginStatusResponse>) => {
        const result = unwrap(response);
        if (result.tokens) {
          setTokens(result.tokens);
          markWelcomePending();
        }
        return result;
      },
      invalidatesTags: (result) => (result?.tokens ? ["Auth", "Cart", "Order"] : []),
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/api/auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/api/auth/reset-password", method: "POST", body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
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

    updateProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (body) => ({ url: "/api/users/me", method: "PATCH", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: ["Auth"],
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/api/users/me/change-password", method: "POST", body }),
    }),

    uploadAvatar: builder.mutation<UserResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
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

    getTelegramLinkCode: builder.mutation<TelegramLinkCodeResponse, void>({
      query: () => ({ url: "/api/users/me/telegram/link-code", method: "POST" }),
      transformResponse: unwrap<TelegramLinkCodeResponse>,
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useRegisterMutation,
  useVerifyRegistrationMutation,
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useResendOtpMutation,
  useLoginTelegramMutation,
  useGetTelegramWidgetConfigQuery,
  useStartTelegramLoginMutation,
  useCheckTelegramLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useGetTelegramLinkCodeMutation,
} = authApi;
