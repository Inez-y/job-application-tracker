import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        const existingToken = localStorage.getItem("accessToken");

        if (existingToken) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(values: LoginFormValues) {
        setServerError(null);

        try {
            const response = await login(values);

            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);
            localStorage.setItem("userEmail", response.email);
            localStorage.setItem("userId", response.userId);

            navigate("/dashboard", { replace: true });
        } catch {
            setServerError("Invalid email or password");
        }
    }

    return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md">
        <Card className="p-8">
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>

            <p className="mt-2 text-sm text-slate-600">
            Log in to manage your job applications.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">
                Email
                </label>

                <input
                type="email"
                {...register("email")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="your@email.com"
                />

                {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">
                Password
                </label>

                <input
                type="password"
                {...register("password")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Password"
                />

                {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                </p>
                )}
            </div>

            {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
                </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-slate-900 underline">
                Create one
            </Link>
            </p>
        </Card>
        </div>
    </main>
    );
}
