import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileUp, Loader2, FileText, Image, File, Copy, CheckCircle2,
  LogOut, Sparkles, ArrowRight, X, BarChart3, Users, Calendar, DollarSign
} from "lucide-react";

interface AnalysisResult {
  status: string;
  fileName: string;
  summary: string;
  entities: {
    names: string[];
    dates: string[];
    organizations: string[];
    amounts: string[];
  };
  sentiment: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const entityIcons: Record<string, any> = {
  names: Users,
  dates: Calendar,
  organizations: BarChart3,
  amounts: DollarSign,
};

const entityColors: Record<string, string> = {
  names: "bg-primary/10 text-primary border-primary/20",
  dates: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  organizations: "bg-accent/10 text-accent border-accent/20",
  amounts: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiKey = "sk_track2_987654321";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const getFileType = (f: File): string => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "docx") return "docx";
    if (["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"].includes(ext || "")) return "image";
    return "unknown";
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-5 h-5" />;
    if (type === "image") return <Image className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const analyzeDocument = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fileType = getFileType(file);
      if (fileType === "unknown") {
        toast({ title: "Unsupported file type", description: "Please upload a PDF, DOCX, or image file.", variant: "destructive" });
        setLoading(false);
        return;
      }
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
      }
      const fileBase64 = btoa(binary);
      const response = await fetch(`${SUPABASE_URL}/functions/v1/document-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ fileName: file.name, fileType, fileBase64 }),
      });
      const data = await response.json();
      if (!response.ok || data.status === "error") {
        toast({ title: "Analysis failed", description: data.message || "Unknown error", variant: "destructive" });
      } else {
        setResult(data);
        toast({ title: "Analysis complete", description: `Successfully analyzed ${file.name}` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to analyze document", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const sentimentConfig: Record<string, { color: string; bg: string }> = {
    Positive: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    Negative: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    Neutral: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="orb-delayed absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <FileText className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight font-['Space_Grotesk']">DocAnalyzer</span>
              <span className="text-xs text-muted-foreground ml-2">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`glass rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
              dragOver ? "border-primary bg-primary/5 shadow-glow" : "border-border/50 hover:border-primary/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tiff" onChange={handleFileChange} />
            <div className="p-12 text-center">
              <motion.div
                animate={{ y: dragOver ? -5 : 0 }}
                className="w-16 h-16 rounded-2xl bg-gradient-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <FileUp className="w-7 h-7 text-primary" />
              </motion.div>
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(getFileType(file))}
                  <span className="font-semibold">{file.name}</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{getFileType(file).toUpperCase()}</Badge>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-1 font-medium">Drop a document here or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supports PDF, DOCX, PNG, JPG, JPEG, GIF, BMP, WebP, TIFF</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <Button
            onClick={analyzeDocument}
            disabled={!file || loading}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 shadow-glow text-primary-foreground px-10 h-12 text-base gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analyze Document</>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
                <Button variant="outline" size="sm" onClick={copyJSON} className="glass gap-2">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>}
                </Button>
              </div>

              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Summary</h3>
                </div>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </motion.div>

              {/* Sentiment */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sentiment</h3>
                <Badge className={`text-sm py-1 px-4 ${sentimentConfig[result.sentiment]?.bg || sentimentConfig.Neutral.bg}`}>
                  {result.sentiment}
                </Badge>
              </motion.div>

              {/* Entities */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Extracted Entities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["names", "dates", "organizations", "amounts"] as const).map((key) => {
                    const Icon = entityIcons[key];
                    return (
                      <div key={key} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{key}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.entities[key]?.length > 0 ? (
                            result.entities[key].map((item, i) => (
                              <Badge key={i} className={`text-xs ${entityColors[key]}`}>{item}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None found</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Raw JSON */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Raw Response</h3>
                <pre className="text-xs bg-secondary/50 rounded-xl p-5 overflow-x-auto text-muted-foreground font-mono leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
