import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";
import { AuthLayout } from "../layouts/AuthLayout";
import { User, Mail, Lock, ShieldAlert, Sparkles, Loader2, ArrowRight } from "lucide-react";

// Mirror the backend Pydantic validation parameters
const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(150, "Full name cannot exceed 150 characters")
      .transform((val) => val.trim().replace(/\s+/g, " ")),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      .transform((val) => val.trim()),
    email: z.string().email("Invalid email address").transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .refine(
        (val) => val.trim() === val,
        "Password must not start or end with whitespace"
      )
      .refine(
        (val) =>
          /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val),
        "Password must include uppercase, lowercase, and numeric characters"
      ),
    confirm_password: z.string().min(8, "Confirmation password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    const success = await registerUser(data);
    setIsSubmitting(false);
    if (success) {
      navigate("/dashboard");
    }
  };

  // Dynamic Password Strength Meter
  const getPasswordStrength = () => {
    if (!passwordValue) return { label: "No Password", score: 0, color: "bg-muted" };
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (passwordValue.trim() === passwordValue && passwordValue.length > 0) score += 1;

    switch (score) {
      case 1:
        return { label: "Weak", score: 25, color: "bg-destructive" };
      case 2:
        return { label: "Fair", score: 50, color: "bg-orange-500" };
      case 3:
        return { label: "Good", score: 75, color: "bg-indigo-500" };
      case 4:
        return { label: "Strong", score: 100, color: "bg-emerald-500" };
      default:
        return { label: "Invalid Format", score: 10, color: "bg-destructive" };
    }
  };

  const strength = getPasswordStrength();

  return (
    <AuthLayout>
      <div className="glass rounded-3xl p-8 border border-border/80 shadow-2xl relative bg-card/45 backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary mb-3">
            <Sparkles className="w-3 h-3" />
            <span>AI VERIFICATION CORE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Register your credential keys to analyze news accuracy.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block" htmlFor="full_name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                id="full_name"
                type="text"
                placeholder="Eleanor Vance"
                {...register("full_name")}
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.full_name
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>
            {errors.full_name && (
              <p className="text-[11px] font-medium text-destructive flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                <span>{errors.full_name.message}</span>
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                id="username"
                type="text"
                placeholder="eleanor_v"
                {...register("username")}
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-[11px] font-medium text-destructive flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                <span>{errors.username.message}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="eleanor@yourdomain.com"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] font-medium text-destructive flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                onChange={(e) => setPasswordValue(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>

            {/* Password Strength Widget */}
            {passwordValue && (
              <div className="pt-1.5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className="font-semibold text-foreground">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-[11px] font-medium text-destructive flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                <span className="leading-snug">{errors.password.message}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground block" htmlFor="confirm_password">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                {...register("confirm_password")}
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.confirm_password
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>
            {errors.confirm_password && (
              <p className="text-[11px] font-medium text-destructive flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                <span>{errors.confirm_password.message}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-2 bg-primary hover:opacity-95 text-primary-foreground font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Generate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/40 pt-4">
          Already verified?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
