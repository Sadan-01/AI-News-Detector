import React, { useState } from "react";
import { BaseLayout } from "../layouts/BaseLayout";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FAQPage: React.FC = () => {
  const categories = [
    {
      title: "Model & Predictions",
      items: [
        {
          q: "How does the DistilBERT model classify text?",
          a: "The backend fine-tunes a DistilBERT sequence classifier. It extracts high-dimensional linguistic and context embeddings from your submitted news paragraph and evaluates the lexical distribution. It then maps the output classes to 'Real' and 'Fake' categories.",
        },
        {
          q: "Why does it require at least 20 characters?",
          a: "Linguistic sequence models need enough contextual structure to analyze grammatical patterns accurately. Short strings like 'Hello world' do not possess enough lexical metrics to parse effectively.",
        },
        {
          q: "What does the confidence score mean?",
          a: "The confidence rating is a softmax probability score mapped between 0% and 100%. It represents the neural network's likelihood rating for the chosen label (e.g., '94% confidence that this article is Fake').",
        },
      ],
    },
    {
      title: "Security & Accounts",
      items: [
        {
          q: "How secure is my profile information?",
          a: "All credentials are encrypted at rest using bcrypt password hashing. Requests are authenticated using JSON Web Tokens (JWT) stored locally on the client and appended automatically to HTTP request headers.",
        },
        {
          q: "Can I purge my verifications logs history?",
          a: "Yes. Stored logs can be deleted individually from the Prediction History page. Deleting a record triggers a CASCADE block that permanently deletes the database tuple.",
        },
      ],
    },
  ];

  const [activeItem, setActiveItem] = useState<{ catIdx: number; itemIdx: number } | null>(null);

  const handleToggle = (catIdx: number, itemIdx: number) => {
    if (activeItem?.catIdx === catIdx && activeItem?.itemIdx === itemIdx) {
      setActiveItem(null);
    } else {
      setActiveItem({ catIdx, itemIdx });
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-left">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-bold text-primary">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Platform FAQ Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Questions & Telemetry
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore how Veritas.AI classifies textual context, uses fallback machine learning mechanisms, and manages your private fact-checking audit logs.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            {categories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest pl-2">
                  {category.title}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIdx) => {
                    const isOpen = activeItem?.catIdx === catIdx && activeItem?.itemIdx === itemIdx;
                    return (
                      <div
                        key={itemIdx}
                        className="glass rounded-2xl border border-border bg-card/45 overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => handleToggle(catIdx, itemIdx)}
                          className="w-full flex justify-between items-center px-6 py-4.5 text-left font-bold text-xs sm:text-sm hover:bg-muted/20 transition-colors text-foreground"
                        >
                          <span>{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 pt-1 border-t border-border/30 text-xs text-muted-foreground leading-relaxed">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
