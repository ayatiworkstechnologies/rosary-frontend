  import axios from "axios";


  // =========================================================
  // API BASE URL
  // =========================================================

  const configuredApiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "/backend/api/v1";

  // Axios treats a host without a scheme (for example,
  // "localhost:8000/api/v1") as an unsupported protocol. Keep relative
  // proxy paths intact and make accidentally scheme-less hosts usable.
  export const API_BASE_URL =
    configuredApiBaseUrl.startsWith("/") ||
    /^[a-z][a-z\d+.-]*:\/\//i.test(configuredApiBaseUrl)
      ? configuredApiBaseUrl
      : `${
          /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::|\/|$)/i.test(
            configuredApiBaseUrl
          )
            ? "http"
            : "https"
        }://${configuredApiBaseUrl}`;


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
          sessionStorage.getItem(
            "access_token"
          ) ||
          localStorage.getItem(
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
