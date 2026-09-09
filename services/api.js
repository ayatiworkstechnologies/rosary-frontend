import axios from "axios";


// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",

    Accept:
      "application/json",
  },

  timeout: 15000,
});


// =========================================================
// REQUEST INTERCEPTOR
// ADD JWT TOKEN
// =========================================================

api.interceptors.request.use(
  (config) => {

    if (
      typeof window !==
      "undefined"
    ) {

      const token =
        localStorage.getItem(
          "access_token"
        ) ||
        sessionStorage.getItem(
          "access_token"
        );


      if (token) {

        config.headers =
          config.headers || {};


        config.headers.Authorization =
          `Bearer ${token}`;
      }

    }


    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    // ================================================
    // NETWORK ERROR
    // ================================================

    if (!error.response) {

      console.error(
        "API Network Error:",
        {
          message:
            error.message,

          baseURL:
            API_BASE_URL,

          url:
            error.config?.url,
        }
      );


      return Promise.reject(
        new Error(
          `Cannot connect to backend server at ${API_BASE_URL}`
        )
      );
    }


    // ================================================
    // HTTP ERROR
    // ================================================

    console.error(
      "API Error:",
      {
        status:
          error.response
            ?.status,

        data:
          error.response
            ?.data,

        url:
          error.config
            ?.url,
      }
    );


    return Promise.reject(
      error
    );
  }
);


export default api;