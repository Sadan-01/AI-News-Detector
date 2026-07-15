import React from "react";
import { BaseLayout } from "../layouts/BaseLayout";
import {
  Brain,
  Shield,
  Cpu,
  Terminal
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-left">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-bold text-primary">
              <Brain className="w-3.5 h-3.5" />
              <span>Technology & Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Deep Learning for Digital News Integrity
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Veritas.AI operates a production-grade FastAPI neural endpoint optimized for sentence embeddings and token classification. We believe fact-checkers deserve the same deep learning tools utilized by digital publishers to preserve objectivity online.
            </p>
          </div>

          {/* Model details section */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-border bg-card/45 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-foreground">
              <Cpu className="w-5 h-5 text-primary shrink-0" />
              <span>Core Classifier: Fine-Tuned DistilBERT</span>
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our primary analysis pathway processes news feeds through a fine-tuned <strong>DistilBERT</strong> transformer model (available under <code>model/transformer_news</code>). DistilBERT is a distilled version of BERT that retains 97% of BERT's language understanding capabilities while being 40% smaller and 60% faster.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border border-border/80 bg-background/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Semantic Parsing</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Processes words in relation to all other words in a sentence, capturing context rather than relying solely on dictionary keywords match.
                </p>
              </div>
              <div className="p-4 border border-border/80 bg-background/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Linguistic Biases</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Detects hyperbolic grammar, sensational punctuation distributions, and typical propaganda vocabulary weights.
                </p>
              </div>
            </div>
          </div>

          {/* Model Backup */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-border bg-card/45 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-foreground">
              <Terminal className="w-5 h-5 text-primary shrink-0" />
              <span>Fallback Layer: TF-IDF Machine Learning Pipeline</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              To guarantee high availability, the backend prediction boundary in <code>AIService</code> automatically checks model availability. If PyTorch model artifacts are loading, the engine falls back to a joblib-serialised TF-IDF pipeline. This pipeline computes vocabulary term frequencies and applies linear decision boundary coefficients to classify text.
            </p>

            {/* Architecture Steps mockup */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Pydantic Sanitization</h5>
                  <p className="text-muted-foreground mt-0.5">Cleans multiple whitespaces and normalizes string inputs (minimum 20 characters, maximum 10k characters).</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Transformer Inference check</h5>
                  <p className="text-muted-foreground mt-0.5">Leverages local hardware acceleration if available (CUDA) to yield classification coefficients in milliseconds.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Audit Log Persistence</h5>
                  <p className="text-muted-foreground mt-0.5">Commits prediction reports to SQLite (via SQLAlchemy) referencing the authenticated user id for audit trail access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ethics statement */}
          <div className="p-6 border border-primary/25 bg-primary/5 rounded-3xl space-y-3">
            <h4 className="text-sm font-bold flex items-center space-x-2 text-primary">
              <Shield className="w-4.5 h-4.5" />
              <span>AI Classification Notice</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Veritas.AI tools are designed to identify syntactic, structural, and semantic styles typical of synthetic or fabricated articles. These metrics do not replace the critical, investigative review of experienced journalists. Our classifiers provide starting indicators to prioritize human verification resources.
            </p>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
