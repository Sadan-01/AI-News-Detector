import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { BaseLayout } from "../layouts/BaseLayout";
import { motion } from "framer-motion";

export const NotFoundPage: React.FC = () => {
  return (
    <BaseLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full glass rounded-3xl p-8 border border-border text-center shadow-2xl relative bg-card/45 backdrop-blur-xl"
        >
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6 border border-destructive/25 shadow-lg shadow-destructive/10 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">404 - Not Found</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The security console was unable to resolve your requested path. It may have been relocated or restricted.
          </p>
          <Link
            to="/"
            className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-sm transition-all hover:opacity-95 flex items-center justify-center space-x-2 active:scale-95 shadow-md shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
        </motion.div>
      </div>
    </BaseLayout>
  );
};
