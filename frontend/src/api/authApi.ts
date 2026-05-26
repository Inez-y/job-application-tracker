import { axiosClient } from "./axiosClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>("/api/auth/login", request);
    
    return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>("/api/auth/register", request);

    return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
    await axiosClient.post("/api/auth/logout", { refreshToken });
}
