import React from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ArrowRight,
  Sliders,
  DollarSign
} from "lucide-react";
import { AIInsight, AIChatMessage, Property, ActiveTab } from "../types";

interface AiAssistantViewProps {
  insights: AIInsight[];
  properties: Property[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  insights,
  properties,
  setActiveTab,
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<"chat" | "insights">("chat");

  // Chat conversation state
  const [messages, setMessages] = React.useState<AIChatMessage[]>([
    {
      id: "msg-0",
      sender: "ai",
      text: `Halo Pak Gde! 👋 Saya **Abiantimbul AI**, asisten cerdas manajemen operasional properti Anda. 

Saya siap membantu menganalisis:
- 📈 **Okupansi & Prediksi Kekosongan Kamar / Unit**
- 💰 **Monitoring Arus Kas & Tagihan Menunggak**
- 🏷️ **Rekomendasi Tarif Sewa Optimal**
- 🔧 **Evaluasi Efisiensi Maintenance**

Apa yang ingin Anda tanyakan atau analisis hari ini?`,
      timestamp: "Baru saja",
    },
  ]);

  const [inputQuery, setInputQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const quickPrompts = [
    "Properti mana yang paling profitable bulan ini?",
    "Berapa kamar kosong yang siap disewa?",
    "Siapa saja penyewa yang belum membayar sewa?",
    "Berapa estimasi pendapatan kost bulan depan?",
    "Apakah ada rekomendasi kenaikan tarif kamar?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      // Call backend API /api/ai/chat
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const aiReply = data.reply || "Maaf, terjadi kesalahan saat menghubungi asisten AI.";

      const aiMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: "Saat ini server sedang offline, namun secara umum performa 5 properti kost Pak Gde berada di angka 81.7% okupansi dengan pendapatan Rp 245.000.000 bulan ini.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#800020] to-amber-600 flex items-center justify-center text-amber-300 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Abiantimbul AI Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase">
                  Powered by Gemini
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Pusat kecerdasan bisnis otomatis: analisis okupansi, proyeksi omset, dan asisten interaktif.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === "chat" ? "bg-[#800020] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            💬 Chat Asisten AI
          </button>
          <button
            onClick={() => setActiveSubTab("insights")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === "insights" ? "bg-[#800020] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            💡 Insight & Prediksi Bisnis
          </button>
        </div>
      </div>

      {activeSubTab === "chat" ? (
        /* CHAT VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages Log */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50"
          >
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAi
                        ? "bg-gradient-to-br from-[#800020] to-rose-900 text-amber-300 shadow-sm ring-1 ring-amber-400"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs relative group ${
                      isAi
                        ? "bg-white border border-slate-200 text-slate-800"
                        : "bg-[#800020] text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className={`font-bold ${isAi ? "text-[#800020]" : "text-amber-300"}`}>
                        {isAi ? "KOSTMANAGER AI" : "Pak Gde"}
                      </span>
                      <span className={`text-[10px] ${isAi ? "text-slate-400" : "text-rose-200"}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className="whitespace-pre-line prose-sm">{msg.text}</div>

                    {isAi && (
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition"
                        title="Salin Pesan"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#800020] text-amber-300 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Sedang menganalisis data 5 properti kost Anda...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-2">
              💡 Rekomendasi Pertanyaan:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-[#800020] text-slate-600 text-[11px] font-medium transition border border-slate-200 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Tanyakan analisis keuangan, okupansi, saran harga sewa, atau data penyewa..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#800020] disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="p-3 rounded-xl bg-[#800020] hover:bg-[#66001a] disabled:bg-slate-300 text-white font-bold transition flex items-center justify-center shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* BUSINESS INSIGHTS CARDS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 transition shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.impact === "positive"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.impact === "warning"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kunci Metrik:</span>
                    <strong className="text-sm font-black text-slate-900">{item.metric}</strong>
                  </div>

                  <button
                    onClick={() => setActiveTab(item.actionTab as ActiveTab)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-[#800020] hover:text-white text-[#800020] font-bold text-xs transition flex items-center gap-1 border border-rose-200"
                  >
                    {item.actionText} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Strategy Advice Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-amber-300">
                  Saran Optimalisasi Bisnis KOSTMANAGER
                </h3>
                <p className="text-xs text-slate-300">Rekomendasi strategis untuk meningkatkan profitabilitas Pak Gde</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-amber-300 mb-1">1. Pasang Iklan Digital Kamar VIP</div>
                <p className="text-slate-300 leading-relaxed">
                  5 kamar VIP di Permata Executive kosong. Potensi omset hilang Rp 17.500.000/bulan jika tidak segera terisi.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-emerald-400 mb-1">2. Diskon Perpanjangan Tahunan</div>
                <p className="text-slate-300 leading-relaxed">
                  Tawarkan diskon 5% untuk 5 penyewa yang kontraknya berakhir bulan depan jika membayar 1 tahun di muka.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-cyan-300 mb-1">3. Otomasi Reminder WhatsApp</div>
                <p className="text-slate-300 leading-relaxed">
                  Aktifkan auto-reminder H-3 untuk menurunkan tingkat keterlambatan bayar sewa dari 4.9% ke bawah 1.5%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
