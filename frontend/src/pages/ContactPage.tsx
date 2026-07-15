import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BaseLayout } from "../layouts/BaseLayout";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFields = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactFields) => {
    setIsSubmitting(true);
    // Simulate contact submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success("Message received! Our team will contact you shortly.");
    reset();
  };

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          
          {/* Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Contact Veritas</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Have questions about API limits, server deployments, or custom classifier model training? Get in touch with our technical team.
              </p>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <span>support@veritas.ai</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <span>+1 (555) 019-2831</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <span>San Francisco, CA Corporate HQ</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 md:p-8 border border-border bg-card/45 shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Marcus Webb"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                  {errors.name && <p className="text-[10px] font-semibold text-destructive">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="marcus@factfinders.org"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                  {errors.email && <p className="text-[10px] font-semibold text-destructive">{errors.email.message}</p>}
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    {...register("subject")}
                    placeholder="API Integration Limits"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  />
                  {errors.subject && <p className="text-[10px] font-semibold text-destructive">{errors.subject.message}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    {...register("message")}
                    placeholder="Enter your message details here..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
                  />
                  {errors.message && <p className="text-[10px] font-semibold text-destructive">{errors.message.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-xs transition-all hover:opacity-95 flex items-center justify-center space-x-2 shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </BaseLayout>
  );
};
