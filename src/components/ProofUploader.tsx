import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  UploadCloud,
  Image as ImageIcon,
  X,
  Trash2,
  Eye,
  RefreshCw,
  Check,
  SwitchCamera,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface ProofUploaderProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  required?: boolean;
}

export const ProofUploader: React.FC<ProofUploaderProps> = ({
  value,
  onChange,
  label = "Bukti Pembayaran / Struk Transfer",
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Stop camera when unmounting or deactivated
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Silakan upload file foto gambar (JPG, PNG, WEBP) atau PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Start live webcam stream
  const startCamera = async (facing: "environment" | "user" = facingMode) => {
    setCameraError(null);
    setIsCameraActive(true);

    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera langsung.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access issue:", err);
      // Fallback: trigger native camera file input directly
      setCameraError(
        "Kamera web tidak dapat diakses langsung. Anda dapat menggunakan tombol 'Kamera HP' di bawah."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const switchCameraMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onChange(dataUrl);
      stopCamera();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 block text-xs">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" /> Bukti Terpasang
          </span>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf"
        className="hidden"
      />
      {/* Native smartphone camera trigger */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* If Proof exists: Show preview card */}
      {value ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group w-14 h-14 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer shadow-xs">
              <img
                src={value}
                alt="Bukti Transfer"
                className="w-full h-full object-cover group-hover:scale-105 transition"
                onClick={() => setIsPreviewModalOpen(true)}
              />
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
              >
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Foto Struk / Bukti Bayar</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Tersimpan & siap diverifikasi</p>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="text-[11px] text-[#800020] hover:underline font-bold flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" /> Lihat Foto Penuh
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Ganti Foto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold transition cursor-pointer"
              title="Hapus Bukti"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: Choice of File Upload or Camera */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
            isDragOver
              ? "border-[#800020] bg-rose-50/50"
              : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/60"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Upload Bukti Pembayaran / Struk Transfer
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Format JPG, PNG, atau PDF (Maks 10MB)
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            {/* Choose File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#800020]" />
              Pilih File / Galeri
            </button>

            {/* Native Phone Camera Button (Works on mobile browsers seamlessly) */}
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#6b001b] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              Kamera HP
            </button>

            {/* Live Web Camera Button */}
            <button
              type="button"
              onClick={() => startCamera("environment")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Buka Live Camera di Layar"
            >
              <Camera className="w-3.5 h-3.5" />
              Live Cam
            </button>
          </div>
        </div>
      )}

      {/* LIVE CAMERA CAPTURE MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-white">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Ambil Foto Struk / Bukti Bayar</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Video Feed or Fallback */}
            <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      nativeCameraInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#800020] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    Buka Aplikasi Kamera HP
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Guideline viewfinder overlay */}
                  <div className="absolute inset-4 border-2 border-dashed border-amber-400/50 rounded-xl pointer-events-none flex items-end justify-center pb-2">
                    <span className="bg-black/60 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                      Posisikan struk transfer di dalam kotak
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Camera Controls */}
            {!cameraError && (
              <div className="p-4 bg-slate-950 flex items-center justify-around border-t border-slate-800">
                <button
                  type="button"
                  onClick={switchCameraMode}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Ganti Kamera Depan/Belakang"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>

                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border-4 border-white flex items-center justify-center text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Ambil Foto"
                >
                  <Camera className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Batal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL IMAGE PREVIEW MODAL */}
      {isPreviewModalOpen && value && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Bukti Pembayaran / Struk Transfer
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto bg-slate-950/60 max-h-[75vh]">
              <img
                src={value}
                alt="Bukti Transfer Penuh"
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Klik kanan atau tahan gambar untuk mengunduh</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
