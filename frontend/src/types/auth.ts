export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    email: string;
    password: string;
    firstName: string;
    lastname: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    email: string;
    userId: string;
};
