import { baseApi, unwrap } from "./baseApi";

export interface CreateFeedbackRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  topic: string;
  message: string;
}

export interface FeedbackResponse {
  id: string;
  createdAt: string;
}

// Through baseApi, so an expired token is refreshed and errors arrive in the API's one error shape.
export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFeedback: builder.mutation<FeedbackResponse, CreateFeedbackRequest>({
      query: (body) => ({ url: "/api/customer/feedback", method: "POST", body }),
      transformResponse: unwrap<FeedbackResponse>,
    }),
  }),
});

export const { useCreateFeedbackMutation } = feedbackApi;
