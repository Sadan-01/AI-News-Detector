import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import type { User, APIResponse } from "../types/api";
import {
  User as UserIcon,
  Mail,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Lock,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";

// Mirror the backend Pydantic validation parameters for UserUpdate
const profileSchema = z.object({
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
});

type ProfileFields = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfileState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFields) => {
    setIsSubmitting(true);
    try {
      const response = await api.put<APIResponse<User>>("/users/profile", data);
      if (response.data.success && response.data.data) {
        updateProfileState(response.data.data);
        toast.success(response.data.message || "Profile updated successfully!");
      }
    } catch (error) {
      // Errors are already handled by axios interceptors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto relative">
        {/* Profile Card Info */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border/40">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-3xl shadow-inner shrink-0">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-xl font-bold text-foreground">{user?.full_name}</h3>
              <p className="text-xs text-muted-foreground">@{user?.username} • Veritas Fact-checker</p>
              
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                Role: {user?.role || "standard"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>Created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span>Verification Core: Online</span>
            </div>
          </div>
        </div>

        {/* Update Form Card */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm text-left space-y-6">
          <div>
            <h4 className="text-sm font-bold text-foreground">Update Personal Details</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Modify your credentials keys. Email alterations require unique verification.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="full_name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="full_name"
                  type="text"
                  {...register("full_name")}
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.full_name
                      ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                      : "border-border/80 focus:ring-primary/25 focus:border-primary"
                  }`}
                />
              </div>
              {errors.full_name && (
                <p className="text-[10px] font-semibold text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  {...register("username")}
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.username
                      ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                      : "border-border/80 focus:ring-primary/25 focus:border-primary"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-[10px] font-semibold text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-destructive/60 focus:ring-destructive/20 focus:border-destructive"
                      : "border-border/80 focus:ring-primary/25 focus:border-primary"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-semibold text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-xs hover:opacity-95 shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security / System notice (Replacing the missing password change endpoint gracefully) */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm text-left space-y-3">
          <div className="flex items-center space-x-2 text-amber-500">
            <Lock className="w-4 h-4" />
            <h4 className="text-sm font-bold text-foreground">Security Console</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your login keys are encrypted using bcrypt hashing protocols. Veritas.AI enforces a strict credential model. Account deletion or security password updates must be triggered via the network system console interface. Contact support or your administrator if password resets are required.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
