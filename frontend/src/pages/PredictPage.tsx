import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import type { Prediction, APIResponse } from "../types/api";
import {
  FileText,
  Clipboard,
  Trash2,
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  Database,
  Cpu,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const PredictPage: React.FC = () => {
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);

  const queryClient = useQueryClient();

  // Character and word counters
  useEffect(() => {
    // Trim multiple spaces to reflect actual Pydantic validator cleanup
    const cleanedText = text.trim().replace(/\s+/g, " ");
    setCharCount(cleanedText.length);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  }, [text]);

  // Loading animation phrases
  const loadingPhrases = [
    "Initializing neural parser...",
    "Tokenizing lexical segments...",
    "Mapping context embeddings via DistilBERT...",
    "Measuring confidence coefficients...",
    "Finalizing classification verdict..."
  ];

  useEffect(() => {
    let interval: any;
    if (loadingStage > 0) {
      interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev >= loadingPhrases.length - 1) {
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loadingStage]);

  // Predict Mutation
  const predictMutation = useMutation({
    mutationFn: async (newsText: string) => {
      setLoadingStage(1);
      const response = await api.post<APIResponse<Prediction>>("/predict", {
        news_text: newsText,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLoadingStage(0);
      toast.success("Analysis complete!");
      // Invalidate queries so history and dashboard update instantly
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (error: any) => {
      setLoadingStage(0);
      // Errors are handled by interceptor
    },
  });

  const handleAnalyze = () => {
    const cleaned = text.trim().replace(/\s+/g, " ");
    if (cleaned.length < 20) {
      toast.error("News text must contain at least 20 meaningful characters");
      return;
    }
    if (cleaned.length > 10000) {
      toast.error("Text exceeds maximum limit of 10,000 characters");
      return;
    }
    predictMutation.mutate(cleaned);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        toast.success("Text pasted from clipboard");
      } else {
        toast.error("Clipboard is empty");
      }
    } catch (err) {
      toast.error("Could not read clipboard. Please paste manually.");
    }
  };

  const handleClear = () => {
    setText("");
    predictMutation.reset();
    toast.success("Editor cleared");
  };

  // Extract result details
  const result = predictMutation.data?.data;
  const isReal = result
    ? result.prediction.toLowerCase() === "real" || result.prediction.toLowerCase() === "true"
    : false;

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Text Editor Card */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-lg relative flex flex-col justify-between h-[520px]">
              <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <div className="flex items-center space-x-2 text-left">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Document verification Area</h3>
                    <p className="text-[10px] text-muted-foreground">Min 20 characters • Max 10,000 characters</p>
                  </div>
                </div>

                {/* Editor Quick Commands */}
                <div className="flex space-x-2">
                  <button
                    onClick={handlePaste}
                    className="p-2 rounded-xl border border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!text}
                    className="p-2 rounded-xl border border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                    title="Clear editor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="flex-1 py-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste article headlines, full news reports, or social media statements here to run artificial intelligence credentials audit..."
                  className="w-full h-full bg-transparent border-0 resize-none outline-none focus:ring-0 text-sm leading-relaxed placeholder:text-muted-foreground/50 scrollbar-thin"
                  maxLength={11000}
                />
              </div>

              {/* Counter and Submit Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-border/40 gap-4">
                <div className="flex space-x-4 text-[10px] font-semibold text-muted-foreground">
                  <span>
                    Characters:{" "}
                    <span className={charCount >= 20 && charCount <= 10000 ? "text-primary font-bold" : "text-destructive"}>
                      {charCount}
                    </span>
                    /10,000
                  </span>
                  <span>
                    Words: <span className="text-foreground">{wordCount}</span>
                  </span>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={predictMutation.isPending || charCount < 20 || charCount > 10000}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-95 text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
                >
                  {predictMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Verdict...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Document</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results and Animation Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STAGE 1: Idle state */}
              {!predictMutation.isPending && !result && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-3xl p-8 border border-border/80 bg-card/45 h-[520px] flex flex-col items-center justify-center text-center shadow-lg"
                >
                  <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse-slow">
                    <Brain className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">Waiting for news submission</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mt-2 leading-relaxed">
                    Paste suspect copy into the Verification Area and launch audits to retrieve transformer weight reports.
                  </p>
                </motion.div>
              )}

              {/* STAGE 2: Scanning & Processing Animations */}
              {predictMutation.isPending && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-3xl p-8 border border-border/80 bg-card/45 h-[520px] flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden"
                >
                  {/* Glowing backdrop blobs */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/25 rounded-full blur-2xl animate-spin-slow" />

                  {/* Scanning Laser Line */}
                  <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent top-0 animate-[float_3s_ease-in-out_infinite]" />

                  {/* Dynamic SVG Brain Graphic */}
                  <div className="w-24 h-24 mb-8 text-primary relative">
                    <Brain className="w-full h-full animate-pulse-slow" />
                    <Sparkles className="w-6 h-6 text-indigo-400 absolute -top-1 -right-1 animate-spin-slow" />
                  </div>

                  <h4 className="text-base font-bold text-foreground animate-pulse">Running Neural Audits</h4>
                  <p className="text-xs text-primary font-medium mt-3 bg-primary/15 border border-primary/25 px-4 py-1.5 rounded-full shadow-inner animate-bounce">
                    {loadingPhrases[loadingStage]}
                  </p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mt-4 leading-relaxed">
                    Analyzing readability metrics and mapping context matrices against the DistilBERT model weights.
                  </p>
                </motion.div>
              )}

              {/* STAGE 3: Show Outcomes Panel */}
              {!predictMutation.isPending && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="glass rounded-3xl p-6 border border-border/80 bg-card/45 h-[520px] flex flex-col justify-between shadow-lg"
                >
                  {/* Results Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-border/40">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inference Verdict</span>

                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isReal
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                    >
                      {isReal ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verified Real</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Detected Fake</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Confidence Circle (Dial) */}
                  <div className="flex flex-col items-center justify-center py-6 relative">
                    <svg className="w-36 h-36 transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                        fill="transparent"
                      />
                      {/* Foreground Circle Progress */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={isReal ? "text-emerald-500" : "text-rose-500"}
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - result.confidence / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center mt-1">
                      <span className="text-3xl font-extrabold text-foreground">{result.confidence}%</span>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Confidence</span>
                    </div>
                  </div>

                  {/* Progress Bar representation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                      <span>Inference Weight</span>
                      <span className={isReal ? "text-emerald-500" : "text-rose-500"}>
                        {result.prediction}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                      <div
                        className={`h-full transition-all duration-1000 ${isReal ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata telemetry card */}
                  <div className="p-4 border border-border bg-background/50 rounded-2xl space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center space-x-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        <span>AI Inference Model:</span>
                      </span>
                      <span className="font-semibold text-foreground">DistilBERT Neural Net</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Verification Time:</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(result.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center space-x-1.5">
                        <Database className="w-3.5 h-3.5 text-primary" />
                        <span>Record Hash ID:</span>
                      </span>
                      <span className="font-semibold text-foreground"># {result.id}</span>
                    </div>
                  </div>

                  {/* Audit again button */}
                  <button
                    onClick={() => predictMutation.reset()}
                    className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-sm transition-all hover:opacity-95 flex items-center justify-center space-x-2 shadow-md shadow-primary/20 active:scale-[0.98]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Another Document</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
