import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";
import { AuthLayout } from "../layouts/AuthLayout";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setIsSubmitting(true);
    const success = await login(data);
    setIsSubmitting(false);
    if (success) {
      // Redirect to the location they came from, or dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout>
      <div className="glass rounded-3xl p-8 border border-border/80 shadow-2xl relative bg-card/45 backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

        <div className="mb-8">
          <div className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary mb-3">
            <Sparkles className="w-3 h-3" />
            <span>SECURE CONSOLE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Log in to continue verifying media sources and news text.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
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
                placeholder="editor@yourdomain.com"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                Password
              </label>
              <span className="text-[10px] text-primary font-medium hover:underline cursor-pointer hover:opacity-90">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-10 pr-10 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                    : "border-border/80 focus:ring-primary/25 focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-primary hover:opacity-95 text-primary-foreground font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/40 pt-6">
          New to Veritas.AI?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
