import React from "react";
import { Link } from "react-router-dom";
import { Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground bg-grid-pattern relative overflow-hidden">
      {/* Left side: Hero Illustration/Marketing (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white relative items-center justify-center p-12 overflow-hidden border-r border-border/10">
        {/* Colorful glowing blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        
        <div className="max-w-md w-full relative z-10 space-y-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-2xl font-bold tracking-tight text-white hover:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span>Veritas.AI</span>
          </Link>

          {/* Value Prop */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-primary shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>State-of-the-Art DistilBERT Inference</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight leading-tight"
            >
              Verify integrity, safeguard credibility.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-sm leading-relaxed"
            >
              Log in to access your dashboard, analyze suspect articles using our transformer models, track detection history, and manage verification protocols.
            </motion.p>
          </div>

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6 border border-white/10 bg-white/5 shadow-2xl relative"
          >
            <p className="text-sm italic text-slate-200">
              "Veritas.AI is a game changer for fact-checkers. Its instant NLP analyses allow us to prioritize articles that demand thorough human investigation."
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-xs font-bold text-white">
                EL
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white">Evelyn Lindqvist</h5>
                <span className="text-[10px] text-slate-400">Lead Editor, truthcheck.org</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side: Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[300px] h-[300px] radial-glow pointer-events-none z-0" />
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
