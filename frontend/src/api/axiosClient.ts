import axios from "axios";

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
    "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
        return Promise.reject(error);
    }

    if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/auth/login") &&
        !originalRequest.url?.includes("/api/auth/register") &&
        !originalRequest.url?.includes("/api/auth/refresh")
    ) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            localStorage.clear();
            window.location.replace("/login");

            return Promise.reject(error);
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
                { refreshToken },
                {
                    headers: { "Content-Type": "application/json", },
                }
            );

            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            localStorage.setItem("userEmail", response.data.email);
            localStorage.setItem("userId", response.data.userId);

            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

            return axiosClient(originalRequest);
        
        } catch (refreshError) {
            localStorage.clear();
            window.location.replace("/login");

            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
  }
);
