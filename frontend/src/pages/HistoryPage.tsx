import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import type { Prediction, APIResponse } from "../types/api";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const HistoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "real" | "fake">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "confidence">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  // Fetch predictions list
  const { data: predictionsResponse, isLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const response = await api.get<APIResponse<Prediction[]>>("/predictions");
      return response.data;
    },
  });

  // Delete prediction mutation with query invalidation (immediate cache refresh)
  const deleteMutation = useMutation({
    mutationFn: async (predictionId: number) => {
      const response = await api.delete<APIResponse<null>>(`/predictions/${predictionId}`);
      return response.data;
    },
    // Optimistic UI updates
    onMutate: async (predictionId) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ["predictions"] });
      // Snapshot the previous value
      const previousValue = queryClient.getQueryData<APIResponse<Prediction[]>>(["predictions"]);
      
      // Optimistically remove from list
      if (previousValue && previousValue.data) {
        queryClient.setQueryData(["predictions"], {
          ...previousValue,
          data: previousValue.data.filter((p) => p.id !== predictionId),
        });
      }

      return { previousValue };
    },
    onSuccess: () => {
      toast.success("Record deleted from history");
    },
    onError: (err, id, context) => {
      // Rollback to previous state on failure
      if (context?.previousValue) {
        queryClient.setQueryData(["predictions"], context.previousValue);
      }
      toast.error("Failed to delete record");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const predictions = predictionsResponse?.data || [];

  // Filtering predictions
  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch = p.news_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isRealLabel = p.prediction.toLowerCase() === "real" || p.prediction.toLowerCase() === "true";
    const isFakeLabel = p.prediction.toLowerCase() === "fake" || p.prediction.toLowerCase() === "false";
    
    if (filterType === "real") return matchesSearch && isRealLabel;
    if (filterType === "fake") return matchesSearch && isFakeLabel;
    return matchesSearch;
  });

  // Sorting predictions
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortOrder === "confidence") {
      return b.confidence - a.confidence;
    }
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedPredictions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPredictions = sortedPredictions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the details modal
    if (window.confirm("Are you sure you want to permanently delete this verification record?")) {
      deleteMutation.mutate(id);
      // Close details modal if open on deleted item
      if (selectedPrediction?.id === id) {
        setSelectedPrediction(null);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Filter and search bar card */}
        <div className="glass rounded-2xl p-5 border border-border/80 bg-card/45 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search verifications text..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page to 1 on filter change
                }}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/80 flex items-center space-x-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </span>
              <button
                onClick={() => {
                  setFilterType("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "all"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Outcomes
              </button>
              <button
                onClick={() => {
                  setFilterType("real");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "real"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Real
              </button>
              <button
                onClick={() => {
                  setFilterType("fake");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "fake"
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    : "border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Fake
              </button>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center space-x-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-border/40 pt-3 md:pt-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Sort By:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-background border border-border rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 text-foreground"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="confidence">Highest Confidence</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table & Data list */}
        <div className="glass rounded-2xl border border-border/85 bg-card/45 overflow-hidden shadow-md">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-4 text-xs text-muted-foreground">Loading history database...</p>
            </div>
          ) : paginatedPredictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase bg-muted/20">
                    <th className="px-6 py-4">Article Content</th>
                    <th className="px-6 py-4">Verdict</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Date Checked</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {paginatedPredictions.map((prediction) => {
                    const isReal =
                      prediction.prediction.toLowerCase() === "real" ||
                      prediction.prediction.toLowerCase() === "true";
                    return (
                      <tr
                        key={prediction.id}
                        onClick={() => setSelectedPrediction(prediction)}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4.5 max-w-sm truncate font-medium text-foreground">
                          {prediction.news_text}
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                              isReal
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}
                          >
                            {prediction.prediction}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-semibold text-foreground">
                          {prediction.confidence}%
                        </td>
                        <td className="px-6 py-4.5 text-muted-foreground">
                          {new Date(prediction.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPrediction(prediction);
                              }}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              title="Inspect records details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(prediction.id, e)}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="w-10 h-10 text-muted-foreground/45 mx-auto mb-3" />
              <p className="text-xs font-semibold">No records match your filters parameters.</p>
            </div>
          )}

          {/* Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10 text-xs">
              <span className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(startIndex + pageSize, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalItems}</span> verifications
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-foreground px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: View Details Dialog Panel */}
        <AnimatePresence>
          {selectedPrediction && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPrediction(null)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="fixed inset-y-12 right-0 left-0 max-w-2xl mx-auto z-50 p-6 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-card w-full max-h-[85vh] rounded-3xl border border-border shadow-2xl p-6 overflow-y-auto flex flex-col pointer-events-auto relative">
                  
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>

                  <div className="space-y-6">
                    {/* Verdict stats header */}
                    <div className="flex justify-between items-center pb-4 border-b border-border/40 text-left">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Audit Telemetry</span>
                        <h4 className="text-base font-bold mt-1 text-foreground">Record # {selectedPrediction.id}</h4>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          selectedPrediction.prediction.toLowerCase() === "real" ||
                          selectedPrediction.prediction.toLowerCase() === "true"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {selectedPrediction.prediction}
                      </span>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-background/50 border border-border p-4 rounded-2xl text-left">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Verification Date:</span>
                        <span className="font-semibold text-foreground flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          {new Date(selectedPrediction.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">AI Classifier Accuracy:</span>
                        <span className="font-semibold text-foreground flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          {selectedPrediction.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    {/* News text detail */}
                    <div className="space-y-2 text-left">
                      <span className="text-xs font-semibold text-muted-foreground">Audited Content text</span>
                      <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-sm leading-relaxed max-h-60 overflow-y-auto font-medium text-foreground whitespace-pre-wrap">
                        {selectedPrediction.news_text}
                      </div>
                    </div>

                    {/* Actions in details */}
                    <div className="flex space-x-3 border-t border-border/40 pt-4 mt-6">
                      <button
                        onClick={(e) => handleDelete(selectedPrediction.id, e)}
                        className="flex-1 inline-flex justify-center items-center space-x-2 bg-destructive/10 hover:bg-destructive/15 text-destructive font-bold text-xs h-11 border border-destructive/25 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Purge from Database</span>
                      </button>
                      <button
                        onClick={() => setSelectedPrediction(null)}
                        className="flex-1 inline-flex justify-center items-center bg-foreground text-background dark:bg-white dark:text-black font-semibold text-xs h-11 rounded-xl transition-opacity hover:opacity-95"
                      >
                        <span>Close Details</span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
