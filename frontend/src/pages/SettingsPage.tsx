import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { DashboardLayout } from "../layouts/DashboardLayout";
import {
  Sun,
  Moon,
  Bell,
  Languages,
  Shield,
  Eye,
  Sliders,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Settings states (Local UI mockups as they do not exist on the backend)
  const [lang, setLang] = useState("en");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [shareData, setShareData] = useState(false);
  const [inferenceSensitivity, setInferenceSensitivity] = useState(75);

  const handleSave = () => {
    toast.success("Settings saved locally!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto relative text-left">
        
        {/* Core preferences: Theme */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/40">
            <Sliders className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Visual Preferences</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <h4 className="text-xs font-bold text-foreground">Application Theme</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toggle between dark mode (recommended) and light mode visual systems.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-semibold border border-border transition-all w-full sm:w-auto"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mock Notifications config */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/40">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Telemetry & Notifications</h3>
          </div>

          <div className="space-y-4">
            {/* Email reports checkbox */}
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background"
              />
              <div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">Weekly News Digests</span>
                <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">Receive summary logs of all verifications checked on the Veritas network.</span>
              </div>
            </label>

            {/* Neural anomalies checkbox */}
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={anomalyAlerts}
                onChange={(e) => setAnomalyAlerts(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background"
              />
              <div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">Low-Confidence Flags</span>
                <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">Alert when classification confidence of an article drops under 60%.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Mock Language settings */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/40">
            <Languages className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Language & Regionalization</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <h4 className="text-xs font-bold text-foreground">Display Language</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Select preferred localized terminology settings.</p>
            </div>
            
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-background border border-border rounded-xl text-xs px-3 py-2 w-full sm:w-48 text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="sv">Svenska (SE)</option>
            </select>
          </div>
        </div>

        {/* Privacy config */}
        <div className="glass rounded-3xl p-6 border border-border/80 bg-card/45 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/40">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Privacy & Telemetry</h3>
          </div>

          <div className="space-y-6">
            {/* Share data check */}
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={shareData}
                onChange={(e) => setShareData(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background"
              />
              <div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">Anonymous Telemetry Share</span>
                <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">Allow sharing of lexical token distributions to improve DistilBERT retraining cycles. Stored texts remain confidential.</span>
              </div>
            </label>

            {/* Inference slider */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Inference Threshold Limit</span>
                <span className="text-primary">{inferenceSensitivity}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={inferenceSensitivity}
                onChange={(e) => setInferenceSensitivity(parseInt(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[9px] text-muted-foreground block">Determines the threshold at which verification confidence flags trigger high-risk security highlights.</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-xs hover:opacity-95 shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Config Preferences</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};
