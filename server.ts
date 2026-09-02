import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Error creating GoogleGenAI client:", err);
    return null;
  }
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "KOSTMANAGER", timestamp: new Date().toISOString() });
});

// AI Chat Endpoint with Kost Business Context
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `Anda adalah "KOSTMANAGER AI", asisten bisnis & operasional cerdas untuk pemilik kost (Pak Gde) dan pengelola kost di platform KOSTMANAGER.
Karakter Anda: Profesional, ramah, berbasis data, solutif, fasih bahasa Indonesia dengan terminologi bisnis properti kost (okupansi, revenue, maintenance, penagihan, kontrak).
Gunakan data ringkasan bisnis kost berikut jika relevan:
- Total Properti: 5 Kost (Kost Harmoni Residence - Jaksel, Kost Melati Syariah - Depok, Kost Permata Executive - Bandung, Kost Graha Mahasiswa - Yogya, Kost Bali Sunset - Denpasar).
- Total Kamar: 120 Kamar (98 Terisi [81.7% okupansi], 18 Kosong, 4 Dalam Pemeliharaan/Maintenance).
- Finansial: Pendapatan Bulan Ini: Rp 245.000.000 (naik 12% MoM), Tagihan Belum Dibayar/Outstanding: Rp 28.500.000, Pendapatan Tahun Ini (YTD): Rp 2.450.000.000.
- Penagihan: Terbayar Rp 215.000.000, Pending Rp 18.000.000, Overdue/Jatuh Tempo: Rp 12.000.000 (3 penyewa berisiko tinggi).
- Properti Paling Menguntungkan: Kost Harmoni Residence (Okupansi 85%, Revenue Rp 82.500.000/bln).
- Prediksi AI: 5 kamar berpotensi kosong 30 hari ke depan karena jatuh tempo kontrak; Disarankan follow-up perpanjangan atau pasang iklan Mamikos/social media. Rekomendasi kenaikan harga 5% untuk tipe kamar Deluxe karena demand tinggi.

Tambahan data kontekstual dari user app saat ini:
${context ? JSON.stringify(context, null, 2) : "Data standar aktif."}

Jawablah pertanyaan Pak Gde / Pengelola secara ringkas, jelas, gunakan format poin jika memberikan rekomendasi langkah aksi atau analisis data, sertakan angka Rupiah dan persentase yang jelas.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
        const text = response.text || "Maaf, AI tidak dapat menghasilkan jawaban.";
        return res.json({ reply: text, source: "gemini-3.7-flash" });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to smart rule engine:", geminiError);
      }
    }

    // Smart Indonesian Fallback Engine when Gemini Key is not supplied or offline
    const query = message.toLowerCase();
    let reply = "";

    if (query.includes("profitable") || query.includes("untung") || query.includes("paling banyak") || query.includes("performa")) {
      reply = `📊 **Properti Paling Profitable:**
**Kost Harmoni Residence (Jakarta Selatan)** saat ini memimpin performa bisnis Anda:
- **Pendapatan Bulan Ini:** Rp 82.500.000
- **Okupansi:** 85.0% (85 dari 100 kamar terisi)
- **Tingkat Pengumpulan Sewa:** 94.2% tepat waktu
- **Rekomendasi AI:** Kamar tipe Executive Studio masih memiliki antrean waiting list 4 calon penyewa. Anda dapat mempertimbangkan kenaikan tarif +5% pada periode perpanjangan berikutnya.`;
    } else if (query.includes("kosong") || query.includes("kamar kosong") || query.includes("vacancy")) {
      reply = `🏠 **Informasi Kamar Kosong:**
Saat ini terdapat total **18 Kamar Kosong** (dari total 120 kamar di 5 properti):
- **Kost Harmoni Residence:** 15 Kamar Kosong (Kategori Standard: 9, Deluxe: 6)
- **Kost Melati Syariah:** 1 Kamar Kosong (Tipe A-102)
- **Kost Permata Executive:** 2 Kamar Kosong (Tipe B-204, B-205)
- **Kost Graha Mahasiswa:** 0 Kamar Kosong (Penuh 100%)
- **Kost Bali Sunset:** 0 Kamar Kosong (Penuh 100%)

💡 *Saran AI:* Jalankan promosi cashback deposit atau aktifkan slot listing untuk 15 kamar di Harmoni Residence menjelang awal bulan depan.`;
    } else if (query.includes("bayar") || query.includes("belum bayar") || query.includes("menunggak") || query.includes("overdue") || query.includes("tagihan")) {
      reply = `💰 **Status Tagihan & Penunggakan:**
Total tagihan belum terbayar: **Rp 28.500.000** (Pending: Rp 18.000.000 | Overdue: Rp 12.000.000).

Penyewa yang berstatus **Overdue (Menunggak >3 hari)**:
1. **Dimas Pratama** (Kost Harmoni, Kamar A-203) - Tagihan: Rp 2.500.000 (Telat 4 hari)
2. **Siti Rahmawati** (Kost Melati, Kamar B-105) - Tagihan: Rp 1.800.000 (Telat 5 hari)
3. **Reza Kurniawan** (Kost Permata, Kamar C-302) - Tagihan: Rp 3.200.000 (Telat 3 hari)

📲 *Tindakan Cepat:* Anda dapat langsung menekan tombol **"Kirim Reminder WhatsApp"** di menu Penagihan untuk mengirim pesan otomatis yang ramah dan sopan.`;
    } else if (query.includes("kontrak") || query.includes("berakhir") || query.includes("habis")) {
      reply = `📅 **Prediksi Kontrak Berakhir (30 Hari ke Depan):**
Terdapat **5 penyewa** yang kontraknya akan berakhir dalam waktu 30 hari ke depan:
1. **Budi Santoso** (Kamar A-101, Harmoni) - Berakhir: 15 September 2026
2. **Anisa Wulandari** (Kamar A-104, Harmoni) - Berakhir: 18 September 2026
3. **Fajar Nugroho** (Kamar B-102, Melati) - Berakhir: 22 September 2026
4. **Maya Indira** (Kamar C-201, Permata) - Berakhir: 28 September 2026
5. **Kevin Sanjaya** (Kamar D-101, Graha) - Berakhir: 30 September 2026

💡 *Tindakan Disarankan:* Sistem otomatisasi telah menjadwalkan notifikasi perpanjangan kontrak H-14. Klik menu **Kontrak** untuk mengirim draft perpanjangan digital.`;
    } else if (query.includes("tren") || query.includes("pendapatan") || query.includes("omset") || query.includes("revenue") || query.includes("keuangan")) {
      reply = `📈 **Analisis Tren Pendapatan Kost:**
- **Bulan Ini (Agustus 2026):** Rp 245.000.000 (↑ 12% dibandingkan Juli Rp 218.750.000)
- **Akumulasi YTD 2026:** Rp 2.450.000.000 (On-track 98% terhadap target tahunan Rp 3.0 Miliar)
- **Proyeksi Bulan Depan (September 2026):** Rp 265.000.000 berdasarkan perpanjangan kontrak terkonfirmasi dan 3 penyewa baru.
- **Margin Operasional Bersih:** Rata-rata 74% setelah dikurangi biaya listrik, air, kebersihan, dan gaji pengelola.`;
    } else {
      reply = `Halo Pak Gde! 👋 Berdasarkan data operasional KOSTMANAGER terkini:
- **Okupansi Global:** 81.7% (98/120 kamar terisi di 5 properti)
- **Pendapatan Bulan Ini:** Rp 245.000.000 (↑ 12% MoM)
- **Outstanding Belum Dibayar:** Rp 28.500.000
- **Tiket Maintenance Aktif:** 4 tiket (2 Sedang Dikerjakan, 2 Tiket Baru)

Anda dapat menanyakan hal spesifik seperti perbandingan properti, daftar kamar kosong, analisis keterlambatan pembayaran, atau proyeksi pendapatan bulan depan.`;
    }

    return res.json({ reply, source: "rule-engine" });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ error: "Gagal memproses permintaan AI" });
  }
});

// AI Generate Business Insights Endpoint
app.get("/api/ai/insights", async (_req, res) => {
  try {
    const insights = [
      {
        id: "ins-1",
        category: "occupancy",
        title: "Occupancy Insight",
        badge: "Peningkatan Positif",
        icon: "TrendingUp",
        description: "Okupansi properti Anda meningkat 8% dibanding bulan lalu, didorong penuhnya Kost Graha Mahasiswa dan Kost Bali Sunset.",
        metric: "81.7% (+8.0%)",
        impact: "positive",
        actionText: "Lihat Detail Okupansi",
        actionTab: "analytics"
      },
      {
        id: "ins-2",
        category: "vacancy",
        title: "Vacancy Prediction",
        badge: "Perlu Tindakan",
        icon: "AlertCircle",
        description: "5 kamar diprediksi akan kosong dalam 30 hari ke depan karena berakhirnya masa sewa tahunan.",
        metric: "5 Kamar Jatuh Tempo",
        impact: "warning",
        actionText: "Kirim Penawaran Perpanjangan",
        actionTab: "contracts"
      },
      {
        id: "ins-3",
        category: "payment",
        title: "Payment Risk Analysis",
        badge: "Risiko Tinggi",
        icon: "DollarSign",
        description: "3 penyewa memiliki risiko keterlambatan pembayaran berdasarkan riwayat bayar 3 bulan terakhir.",
        metric: "Rp 7.500.000 Tertunggak",
        impact: "danger",
        actionText: "Kirim Pengingat Otomatis",
        actionTab: "reminder"
      },
      {
        id: "ins-4",
        category: "revenue",
        title: "Revenue Forecast",
        badge: "Proyeksi Kuartal III",
        icon: "BarChart3",
        description: "Pendapatan bulan depan diprediksi mencapai Rp 265.000.000 dengan tambahan okupansi 4 kamar baru.",
        metric: "Rp 265.000.000 (+8.1%)",
        impact: "positive",
        actionText: "Lihat Proyeksi Finansial",
        actionTab: "analytics"
      },
      {
        id: "ins-5",
        category: "pricing",
        title: "Pricing Recommendation",
        badge: "Optimalisasi Margin",
        icon: "Zap",
        description: "AI merekomendasikan penyesuaian harga 5% untuk kamar tipe Deluxe di Kost Harmoni Residence karena tingginya peminat.",
        metric: "+Rp 125.000 / Kamar",
        impact: "info",
        actionText: "Sesuaikan Harga Kamar",
        actionTab: "rooms"
      }
    ];

    res.json({ insights, generatedAt: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: "Gagal mengambil insight bisnis" });
  }
});

// Vite Middleware & static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KOSTMANAGER Server is running on port ${PORT}`);
  });
}

startServer();
