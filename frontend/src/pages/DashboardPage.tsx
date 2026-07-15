import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import type { Prediction, APIResponse } from "../types/api";
import axios from "axios";
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Database,
  Brain,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Cell,
  Pie
} from "recharts";

export const DashboardPage: React.FC = () => {
  // Fetch Predictions History
  const { data: predictionsResponse, isLoading: predictionsLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const response = await api.get<APIResponse<Prediction[]>>("/predictions");
      return response.data;
    },
  });

  // Fetch API Uptime/Health check
  const { data: healthResponse } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: async () => {
      try {
        const rootUrl = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace("/api", "");
        const response = await axios.get(rootUrl || "http://127.0.0.1:8000/");
        return response.data;
      } catch (e) {
        return { success: false, status: "offline", service: "AI Fake News Detection System" };
      }
    },
    refetchInterval: 15000, // Poll health status every 15s
  });

  const predictions = predictionsResponse?.data || [];
  const systemStatus = healthResponse?.status === "ok" ? "Online" : "Offline";

  // Calculations from predictions data
  const totalPredictions = predictions.length;
  
  // Real news count (case-insensitive classification match)
  const realNewsCount = predictions.filter(
    (p) => p.prediction.toLowerCase() === "real" || p.prediction.toLowerCase() === "true"
  ).length;

  // Fake news count
  const fakeNewsCount = predictions.filter(
    (p) => p.prediction.toLowerCase() === "fake" || p.prediction.toLowerCase() === "false"
  ).length;

  // Others/Unclassified labels count
  const unclassifiedCount = totalPredictions - realNewsCount - fakeNewsCount;

  // Average confidence calculation
  const averageConfidence =
    totalPredictions > 0
      ? parseFloat(
          (predictions.reduce((acc, curr) => acc + curr.confidence, 0) / totalPredictions).toFixed(1)
        )
      : 0;

  // Pie chart structure
  const pieData = [
    { name: "Verified Real", value: realNewsCount, color: "#10b981" }, // emerald-500
    { name: "Detected Fake", value: fakeNewsCount, color: "#f43f5e" }, // rose-500
  ];
  
  // Add unclassified items if any exist
  if (unclassifiedCount > 0) {
    pieData.push({ name: "Unclassified", value: unclassifiedCount, color: "#6366f1" }); // indigo-500
  }

  // Line chart formatting (aggregate verifications by date)
  const getLineData = () => {
    if (predictions.length === 0) return [];
    
    const datesMap: { [key: string]: number } = {};
    
    // Fill last 7 days with 0s to guarantee continuous chart axis
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      datesMap[dateString] = 0;
    }

    // Accumulate predictions
    predictions.forEach((p) => {
      const dateString = new Date(p.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      // Only record in chart if it fits in the 7 days window
      if (datesMap[dateString] !== undefined) {
        datesMap[dateString] += 1;
      } else {
        datesMap[dateString] = 1;
      }
    });

    return Object.keys(datesMap).map((date) => ({
      date,
      Verifications: datesMap[date],
    }));
  };

  const lineData = getLineData();

  if (predictionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="mt-4 text-xs text-muted-foreground animate-pulse">Loading dashboard telemetry...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Quick Predict Callout Bar */}
        <div className="glass rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Launch New Article verification</h4>
              <p className="text-xs text-muted-foreground">Submit a copy of any suspect article text for immediate NLP parsing.</p>
            </div>
          </div>
          <Link
            to="/predict"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all shrink-0 active:scale-95"
          >
            <span>Verify Article</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dashboard Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total verifications */}
          <div className="glass rounded-2xl p-5 border border-border/80 bg-card/45 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 text-muted-foreground/5 font-extrabold pointer-events-none">
              <Database className="w-full h-full" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Total Audited</p>
            <h3 className="text-2xl font-bold tracking-tight mt-2 text-foreground">{totalPredictions}</h3>
            <span className="text-[10px] text-muted-foreground mt-1.5 block">Stored verifications logs</span>
          </div>

          {/* Card 2: Real Count */}
          <div className="glass rounded-2xl p-5 border border-border/80 bg-card/45 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 text-muted-foreground/5 pointer-events-none">
              <ShieldCheck className="w-full h-full" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Verified Real</p>
            <h3 className="text-2xl font-bold tracking-tight text-emerald-500 mt-2">{realNewsCount}</h3>
            <span className="text-[10px] text-muted-foreground mt-1.5 block">
              {totalPredictions > 0 ? `${((realNewsCount / totalPredictions) * 100).toFixed(0)}%` : "0%"} of audits
            </span>
          </div>

          {/* Card 3: Fake Count */}
          <div className="glass rounded-2xl p-5 border border-border/80 bg-card/45 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 text-muted-foreground/5 pointer-events-none">
              <ShieldAlert className="w-full h-full" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Detected Fake</p>
            <h3 className="text-2xl font-bold tracking-tight text-rose-500 mt-2">{fakeNewsCount}</h3>
            <span className="text-[10px] text-muted-foreground mt-1.5 block">
              {totalPredictions > 0 ? `${((fakeNewsCount / totalPredictions) * 100).toFixed(0)}%` : "0%"} of audits
            </span>
          </div>

          {/* Card 4: Avg Confidence */}
          <div className="glass rounded-2xl p-5 border border-border/80 bg-card/45 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 text-muted-foreground/5 pointer-events-none">
              <Activity className="w-full h-full" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Average Confidence</p>
            <h3 className="text-2xl font-bold tracking-tight mt-2 text-foreground">
              {averageConfidence}%
            </h3>
            <span className="text-[10px] text-muted-foreground mt-1.5 block">AI classification strength</span>
          </div>
        </div>

        {/* Charts & Status Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border/80 bg-card/45 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold text-foreground">Analysis Over Time</h4>
                <p className="text-xs text-muted-foreground">Verifications logged during the last 7 days.</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="h-60 w-full">
              {totalPredictions > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 15, 20, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Verifications"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1, fill: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-border/60 rounded-xl">
                  <p className="text-xs text-muted-foreground">No verifications trends available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart & System Status */}
          <div className="space-y-6">
            {/* System Status Panel */}
            <div className="glass rounded-2xl p-6 border border-border/80 bg-card/45 space-y-4">
              <h4 className="text-sm font-bold text-foreground">System telemetry</h4>
              
              {/* API status row */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">API Connection</span>
                </div>
                <div className="flex items-center space-x-1.5 font-bold">
                  {systemStatus === "Online" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-500">Offline</span>
                    </>
                  )}
                </div>
              </div>

              {/* Neural Net status row */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50 text-xs">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4.5 h-4.5 text-primary" />
                  <span className="font-medium text-foreground">Classifier Net</span>
                </div>
                <div className="font-bold text-primary">DistilBERT</div>
              </div>
            </div>

            {/* Classification Ratio Pie Chart */}
            <div className="glass rounded-2xl p-6 border border-border/80 bg-card/45 flex flex-col justify-between">
              <h4 className="text-sm font-bold text-foreground mb-4">Verification Distribution</h4>
              
              <div className="h-44 w-full relative flex items-center justify-center">
                {totalPredictions > 0 && (realNewsCount > 0 || fakeNewsCount > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(15, 15, 20, 0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "8px",
                            fontSize: "11px",
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-foreground">{totalPredictions}</span>
                      <span className="text-[10px] text-muted-foreground">Total Audits</span>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center border border-dashed border-border/60 rounded-xl">
                    <p className="text-xs text-muted-foreground">No outcomes ratio to display.</p>
                  </div>
                )}
              </div>

              {/* Legends */}
              {totalPredictions > 0 && (realNewsCount > 0 || fakeNewsCount > 0) && (
                <div className="flex justify-center space-x-6 text-[10px] mt-4">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground font-medium">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass rounded-2xl p-6 border border-border/80 bg-card/45 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-foreground">Recent Audits Log</h4>
              <p className="text-xs text-muted-foreground">Your last verifications activities.</p>
            </div>
            <Link
              to="/history"
              className="text-xs text-primary font-bold hover:underline inline-flex items-center space-x-1"
            >
              <span>View Full History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {predictions.length > 0 ? (
              predictions.slice(0, 5).map((prediction) => {
                const isReal =
                  prediction.prediction.toLowerCase() === "real" ||
                  prediction.prediction.toLowerCase() === "true";
                return (
                  <div
                    key={prediction.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border bg-background/30 rounded-xl gap-3 text-xs"
                  >
                    <div className="space-y-1.5 text-left max-w-xl">
                      <p className="text-foreground font-semibold line-clamp-1">
                        {prediction.news_text}
                      </p>
                      <span className="text-[10px] text-muted-foreground/70 block">
                        Verified on {new Date(prediction.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">AI Confidence</span>
                        <span className="font-bold text-foreground block">{prediction.confidence}%</span>
                      </div>
                      
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase ${
                          isReal
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {prediction.prediction}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl space-y-3">
                <p className="text-xs text-muted-foreground">You have not analyzed any news articles yet.</p>
                <Link
                  to="/predict"
                  className="inline-flex items-center justify-center space-x-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs hover:opacity-95 shadow-md shadow-primary/10 transition-all"
                >
                  <span>Analyze Your First Text</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
