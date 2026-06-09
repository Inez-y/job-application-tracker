import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../api/authApi";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const existingToken = localStorage.getItem("accessToken");

        if (existingToken) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const {
      register,
      handleSubmit,
      trigger,
      getValues,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
    });

    async function goToEmailStep() {
      const isValid = await trigger(["firstName", "lastName"]);

      if (isValid) { setStep(2); }
    }

    async function goToPasswordStep() {
      const isValid = await trigger("email");

      if (isValid) { setStep(3); } 
    }

    async function goToReviewStep() {
      const isValid = await trigger(["password", "confirmPassword"]);

      if (isValid) { setStep(4); }
    }

    async function onSubmit(values: RegisterFormValues) {
        setServerError(null);

    try {
        const response = await registerUser(values);

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("userEmail", response.email);
        localStorage.setItem("userId", response.userId);

        navigate("/dashboard", { replace: true });
    } catch {
        setServerError("Failed to create account. This email may already be registered.");
    }
  }

  return (
  <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div className="w-full max-w-md">
      <Card className="p-2">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">
            Step {step} of 4
          </p>

          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {step === 1 && "What’s your name?"}
          {step === 2 && "What’s your email?"}
          {step === 3 && "Create a password"}
          {step === 4 && "Review your account"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {step === 1 && "Let’s personalize your job application tracker."}
          {step === 2 && "You’ll use this email to sign in."}
          {step === 3 && "Choose a secure password to protect your account."}
          {step === 4 && "Double-check your information before creating your account."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  {...register("firstName")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  autoFocus
                />

                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  {...register("lastName")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />

                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={goToEmailStep}
                className="w-full"
              >
                Continue
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  placeholder="you@example.com"
                  autoFocus
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={goToPasswordStep}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  placeholder="At least 8 characters"
                  autoFocus
                />
                  
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-r-lg px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  placeholder="Re-enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="rounded-r-lg px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}

              {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={goToReviewStep}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="mt-1 text-slate-900">
                    {getValues("firstName")} {getValues("lastName")}
                  </p>
                </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    Edit
                  </button>

                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 text-slate-900">{getValues("email")}</p>
                </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    Edit
                  </button>

                <div>
                  <p className="text-sm font-medium text-slate-500">Password</p>
                    <p className="mt-1 text-slate-900">Password confirmed</p>
                  <p className="mt-1 text-slate-900">
                    {"•".repeat(Math.max(getValues("password")?.length ?? 0, 8))}
                  </p>
                </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    Edit
                  </button>
              </div>

              {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(3)}
                  className="w-full"
                >
                  Back
                </Button>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  </main>
);
}
