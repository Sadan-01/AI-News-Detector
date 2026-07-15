import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BaseLayout } from "../layouts/BaseLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  ShieldCheck,
  Zap,
  History,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  // FAQs state
  const faqs = [
    {
      q: "How does the AI model determine if news is fake?",
      a: "Our core prediction engine uses a fine-tuned DistilBERT transformer. It analyzes lexical choices, semantic style, and contextual syntax against a vast training set of verified articles to assign a probability weight, returning a confidence percentage from 0 to 100%.",
    },
    {
      q: "What is the minimum and maximum text length supported?",
      a: "To ensure adequate context for syntactic analysis, articles must be at least 20 characters long. The maximum allowed length is 10,000 characters per analysis.",
    },
    {
      q: "Does the platform store my prediction queries?",
      a: "Yes. Every verified article is automatically logged to your private Prediction History. You can view, search, or delete items from this log at any time.",
    },
    {
      q: "Is there a backup model if the Transformer goes offline?",
      a: "Yes. The backend includes a pipeline-based TF-IDF machine learning classifier. If the primary DistilBERT neural model is loading or experiencing service delays, the system automatically falls back to ensure uninterrupted fact-checking operations.",
    },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <BaseLayout>
      <div className="relative">
        {/* Decorative Grid and Blur Backgrounds */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-80 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Tagline */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary shadow-inner"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Next-Gen Fact Verification Platform</span>
            </motion.div>

            {/* Gradient Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight"
            >
              Deconstruct Disinformation with{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Neural Intelligence
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Analyze suspect articles and headlines instantly. Harnessing contextual DistilBERT transformers, Veritas.AI provides deep readability audits and precision confidence telemetry.
            </motion.p>

            {/* Call to Actions */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-sm"
              >
                <span>Verify News Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-border bg-card/60 hover:bg-muted text-foreground font-semibold px-6 py-3 rounded-xl active:scale-95 transition-all text-sm"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                <span>See How it Works</span>
              </Link>
            </motion.div>

            {/* Float visual illustration */}
            <motion.div
              variants={itemVariants}
              className="pt-12 max-w-4xl mx-auto relative px-4"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl blur-xl opacity-20" />
              <div className="glass rounded-3xl border border-border/80 shadow-2xl p-4 sm:p-6 bg-card/25 overflow-hidden animate-float">
                <div className="flex items-center space-x-2 pb-4 border-b border-border/40 text-left">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-destructive/60" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium pl-2">Veritas AI Core - Prediction Sandbox</span>
                </div>
                {/* Visual mockup of the app */}
                <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="md:col-span-2 space-y-4">
                    <div className="h-4 bg-muted/60 rounded-md w-1/4" />
                    <div className="p-4 rounded-2xl bg-background/50 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                      "Breaking: Medical researchers confirm that drinking three cups of organic lavender tea before bedtime cures all cellular fatigue issues in less than forty-eight hours, according to undocumented clinical findings."
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4 border border-primary/20 bg-primary/5 flex flex-col justify-between space-y-6">
                    <div>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Analysis Outcome</span>
                      <span className="text-xl font-bold text-destructive mt-1 block">Fake News</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block">AI Confidence Metric</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-2xl font-extrabold text-foreground">94.8%</span>
                        <span className="text-xs text-muted-foreground">probability</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* STATISTICS */}
        <section className="border-y border-border/60 bg-card/20 py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1.5">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl text-primary mb-1">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">99.4%</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Transformer Accuracy</p>
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl text-primary mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">&lt; 0.2s</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Inference Speed</p>
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl text-primary mb-1">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">10M+</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Verified Databases</p>
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl text-primary mb-1">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">50k+</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Fact Audits Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Equipped with Fact-checking Architecture</h2>
            <p className="text-sm text-muted-foreground">
              A comprehensive dashboard engineered for modern editors, researchers, and truth seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass rounded-2xl p-6 border border-border bg-card/45 hover:border-primary/30 transition-all group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">DistilBERT Neural NLP</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Processes full articles utilizing Transformer weights fine-tuned on media linguistics. Maps vocabulary patterns and logical fallacies instantly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass rounded-2xl p-6 border border-border bg-card/45 hover:border-primary/30 transition-all group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real-Time Risk Scoring</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Returns binary outcomes alongside continuous percentage metrics representing classification security limits and neural network confidence.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass rounded-2xl p-6 border border-border bg-card/45 hover:border-primary/30 transition-all group hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Searchable Audit Trails</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintains a secure database repository of your previous prediction outcomes. Search, filter, inspect text structures, or purge records on demand.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-card/30 border-t border-border/60 py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="text-sm text-muted-foreground">
                Three simple operations to verify media content legitimacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-primary/30 to-indigo-500/30 z-0" />

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                  1
                </div>
                <h4 className="font-bold text-base mb-2">Submit Document</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Copy and paste suspect article text ranging from headlines to 10k character reports.
                </p>
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                  2
                </div>
                <h4 className="font-bold text-base mb-2">Transformer Inference</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Deep neural networks extract linguistic weights, logical inconsistencies, and citation trends.
                </p>
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                  3
                </div>
                <h4 className="font-bold text-base mb-2">Verdict & Telemetry</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Receive a clear "Fake" vs "Real" status with exact probability confidence dials in under 200ms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Verified by Facts Specialists</h2>
            <p className="text-sm text-muted-foreground">
              See what newsrooms and intelligence teams are saying about our classifier interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-6 border border-border bg-card/45">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Our journalism agency relies on Veritas.AI for initial screening. When hundreds of reports pour in during active news cycles, the transformer classifier filters out high-probability bot-generated fabrications instantly."
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-xs">
                  MW
                </div>
                <div>
                  <h5 className="text-xs font-bold">Marcus Webb</h5>
                  <span className="text-[10px] text-muted-foreground">Director of Investigations, Fact-Finders Media</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-border bg-card/45">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Integrating this frontend with our internal data stream was seamless. Response interceptors handle validation beautifully, and the UI speed matches the API performance."
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-xs">
                  SK
                </div>
                <div>
                  <h5 className="text-xs font-bold">Sarah Kincaid</h5>
                  <span className="text-[10px] text-muted-foreground">Chief Information Officer, Global Verification Network</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="bg-card/20 border-t border-border/60 py-20 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Platform FAQs</h2>
              <p className="text-sm text-muted-foreground">
                Everything you need to know about the neural engine and integrations.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="glass rounded-xl border border-border bg-card/45 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center px-6 py-4.5 text-left font-semibold text-sm hover:bg-muted/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 border-t border-border/30 text-xs text-muted-foreground leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL SECTION */}
        <section className="max-w-5xl mx-auto px-4 py-20 relative z-10">
          <div className="glass rounded-3xl border border-primary/20 bg-gradient-to-tr from-primary/10 via-indigo-500/5 to-transparent p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
            
            <div className="relative z-10 space-y-6 max-w-xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight">Ready to Audit Media?</h2>
              <p className="text-sm text-muted-foreground">
                Get started today and secure instant verification logs. Register in minutes and join the global check network.
              </p>
              <div className="pt-2">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="inline-flex items-center space-x-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all text-sm active:scale-95"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};
