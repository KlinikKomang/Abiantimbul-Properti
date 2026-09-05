import React from "react";
import {
  Building2,
  MapPin,
  DoorOpen,
  Users,
  TrendingUp,
  Plus,
  Phone,
  CreditCard,
  CheckCircle2,
  X,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Award,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  Home,
  Car,
  Filter,
  Warehouse,
  Edit3,
  Save,
  Upload,
  Camera,
  FileImage,
  RefreshCw,
  Store,
  Trees,
  ShieldAlert,
} from "lucide-react";
import { Property, PropertyCategory, Room, ActiveTab, UserRole } from "../types";
import { formatRupiah } from "../data/mockData";

interface PropertyViewProps {
  properties: Property[];
  rooms: Room[];
  userRole?: UserRole;
  onSelectProperty: (propertyId: string) => void;
  onAddProperty: (newProp: Property, createStarterRooms?: boolean) => void;
  onUpdateProperty?: (updatedProp: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  onClearAllData?: () => void;
  onResetMinimalData?: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

const PROPERTY_IMAGE_PRESETS: Record<PropertyCategory, { id: string; label: string; url: string }[]> = {
  kost: [
    {
      id: "img-k1",
      label: "Modern Kost Eksekutif",
      url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-k2",
      label: "Cozy Studio Kost",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-k3",
      label: "Urban Loft Kost",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-k4",
      label: "Resort Style Kost",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
    },
  ],
  rumah: [
    {
      id: "img-r1",
      label: "Cluster Modern Minimalis",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-r2",
      label: "Rumah 2 Lantai Asri",
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-r3",
      label: "Townhouse Exclusive",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-r4",
      label: "Villa & Kontrakan Keluarga",
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    },
  ],
  parkir: [
    {
      id: "img-p1",
      label: "Lot Parkir Kanopi Mobil",
      url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-p2",
      label: "Area Parkir Khusus RFID",
      url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-p3",
      label: "Lot Parkir Motor & Komuter",
      url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    },
  ],
  ruko: [
    {
      id: "img-rk1",
      label: "Ruko Komersial 2 Lantai",
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-rk2",
      label: "Komplek Ruko Modern",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-rk3",
      label: "Ruko Pinggir Jalan Raya",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    },
  ],
  tanah: [
    {
      id: "img-t1",
      label: "Kavling Tanah Siap Bangun",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-t2",
      label: "Lahan Komersial Strategis",
      url: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "img-t3",
      label: "Lahan Terbuka / Gudang",
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80",
    },
  ],
};

const CATEGORY_FACILITIES: Record<PropertyCategory, string[]> = {
  kost: [
    "AC Dingin",
    "WiFi High-Speed",
    "Kamar Mandi Dalam",
    "Water Heater",
    "Kasur Springbed",
    "Lemari & Meja Kerja",
    "Dapur Bersama",
    "Kulkas Bersama",
    "Security 24 Jam",
    "CCTV 24 Jam",
    "Parkir Motor Luas",
    "Parkir Mobil",
    "Token Listrik Mandiri",
    "Area Jemur & Cuci",
    "Balkon / Rooftop",
    "Layanan Housekeeping",
  ],
  rumah: [
    "Carport Mobil",
    "Carport 2 Mobil Kanopi",
    "2-3 Kamar Tidur",
    "2 Kamar Mandi",
    "Dapur Pribadi",
    "Taman Belakang & Depan",
    "One Gate System Security 24 Jam",
    "CCTV Lingkungan Komplek",
    "Listrik PLN 2200 VA / 3500 VA",
    "Air PDAM Bersih / Jetpump",
    "Row Jalan Depan Lebar (2 Mobil)",
    "Dekat Tol & Stasiun",
    "Fasilitas Club House / Lapangan",
  ],
  parkir: [
    "Kanopi / Atap Lindung Baja",
    "Akses Barrier Gate RFID 24 Jam",
    "CCTV Depan Tiap Slot 24 Jam",
    "Security Patrol 24 Jam",
    "Penerangan LED Terang",
    "Kran Air Cuci Kendaraan",
    "Loker Helm Khusus Motor",
    "Akses Keluar Masuk 24/7",
    "Slot Lebar (Innova / Fortuner / Alphard)",
    "Dekat Halte Busway & Stasiun MRT",
  ],
  ruko: [
    "Rolling Door Besi",
    "Parkir Pengunjung Luas",
    "Listrik PLN Daya Industri / Komersial",
    "Air PDAM Bersih",
    "Kamar Mandi Tiap Lantai",
    "Dekat Jalan Raya Utama",
    "Papan Reklame / Neon Box Siap Pasang",
    "Security & CCTV 24 Jam",
    "Akses Truk / Bongkar Muat Barang",
    "Jaringan Internet Fiber Optic Bisnis",
  ],
  tanah: [
    "Akses Jalan Aspal Masuk Truk / Kontainer",
    "Sertifikat Hak Milik (SHM) / HGB Bersih",
    "Sudah Dipagar Keliling",
    "Jaringan Listrik PLN & Air Siap Sambung",
    "Bebas Banjir",
    "Tanah Rata Padat Siap Bangun / Digunakan",
    "Izin Usaha / Zona Komersial",
    "Dekat Gerbang Tol & Jalur Logistik",
  ],
};

// Helper to compress and optimize uploaded images for fast loading and persistent local storage
const compressImageFile = (file: File, maxWidth = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const PropertyView: React.FC<PropertyViewProps> = ({
  properties,
  rooms,
  userRole,
  onSelectProperty,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onClearAllData,
  onResetMinimalData,
  setActiveTab,
}) => {
  // Role Admin cannot add, edit, or delete properties
  const canManageProperty = userRole !== "admin" && userRole !== "finance" && userRole !== "technician";

  const [selectedDetailProperty, setSelectedDetailProperty] = React.useState<Property | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = React.useState(false);
  const [propertyToDelete, setPropertyToDelete] = React.useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | PropertyCategory>("all");

  // New property form state
  const [newPropCategory, setNewPropCategory] = React.useState<PropertyCategory>("kost");
  const [newPropName, setNewPropName] = React.useState("");
  const [newPropLocation, setNewPropLocation] = React.useState("");
  const [newPropAddress, setNewPropAddress] = React.useState("");
  const [newPropType, setNewPropType] = React.useState<string>("Campur");
  const [newPropTotalRooms, setNewPropTotalRooms] = React.useState(8);
  const [createStarterRooms, setCreateStarterRooms] = React.useState(true);
  const [newPropPriceRange, setNewPropPriceRange] = React.useState("Rp 2.000.000 - Rp 3.500.000");
  const [selectedImage, setSelectedImage] = React.useState(PROPERTY_IMAGE_PRESETS.kost[0].url);
  const [customImageUrl, setCustomImageUrl] = React.useState("");
  const [imageSourceMode, setImageSourceMode] = React.useState<"upload" | "preset" | "url">("upload");
  const [uploadedImagePreview, setUploadedImagePreview] = React.useState<string | null>(null);
  const [uploadedImageFileName, setUploadedImageFileName] = React.useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isDraggingAdd, setIsDraggingAdd] = React.useState(false);
  const addFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([
    "AC Dingin",
    "WiFi High-Speed",
    "Kamar Mandi Dalam",
    "Kasur Springbed",
    "Security 24 Jam",
    "Parkir Motor Luas",
  ]);
  const [newPropManager, setNewPropManager] = React.useState("Gde Asbawa");
  const [newPropPhone, setNewPropPhone] = React.useState("+62 812-3456-7890");
  const [newPropBank, setNewPropBank] = React.useState("BCA");
  const [newPropAccountNum, setNewPropAccountNum] = React.useState("8830-9988-11");
  const [newPropAccountHolder, setNewPropAccountHolder] = React.useState("GDE ASBAWA PUTRA");

  // Edit property form state
  const [propertyToEdit, setPropertyToEdit] = React.useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<PropertyCategory>("kost");
  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState("");
  const [editLocation, setEditLocation] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editTotalRooms, setEditTotalRooms] = React.useState(8);
  const [editPriceRange, setEditPriceRange] = React.useState("");
  const [editSelectedImage, setEditSelectedImage] = React.useState("");
  const [editCustomImageUrl, setEditCustomImageUrl] = React.useState("");
  const [editImageSourceMode, setEditImageSourceMode] = React.useState<"upload" | "preset" | "url">("upload");
  const [editUploadedImagePreview, setEditUploadedImagePreview] = React.useState<string | null>(null);
  const [editUploadedImageFileName, setEditUploadedImageFileName] = React.useState<string>("");
  const [isEditUploadingImage, setIsEditUploadingImage] = React.useState(false);
  const [isDraggingEdit, setIsDraggingEdit] = React.useState(false);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [editFacilities, setEditFacilities] = React.useState<string[]>([]);
  const [editManagerName, setEditManagerName] = React.useState("");
  const [editManagerPhone, setEditManagerPhone] = React.useState("");
  const [editBank, setEditBank] = React.useState("BCA");
  const [editAccountNumber, setEditAccountNumber] = React.useState("");
  const [editAccountHolder, setEditAccountHolder] = React.useState("");

  const handleProcessImageFile = async (
    file: File,
    isEditMode = false
  ) => {
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar yang valid (JPG, PNG, WEBP).");
      return;
    }

    try {
      if (isEditMode) {
        setIsEditUploadingImage(true);
      } else {
        setIsUploadingImage(true);
      }

      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);

      if (isEditMode) {
        setEditUploadedImagePreview(compressedDataUrl);
        setEditUploadedImageFileName(file.name);
        setEditCustomImageUrl(compressedDataUrl);
        setEditImageSourceMode("upload");
      } else {
        setUploadedImagePreview(compressedDataUrl);
        setUploadedImageFileName(file.name);
        setCustomImageUrl(compressedDataUrl);
        setImageSourceMode("upload");
      }
    } catch (err) {
      console.error("Error compressing image:", err);
      alert("Gagal memproses gambar. Silakan coba file lain.");
    } finally {
      if (isEditMode) {
        setIsEditUploadingImage(false);
      } else {
        setIsUploadingImage(false);
      }
    }
  };

  const handleOpenEditModal = (prop: Property) => {
    if (!canManageProperty) {
      alert("Akses Dibatasi: Role Admin tidak memiliki izin untuk mengedit data properti.");
      return;
    }
    setPropertyToEdit(prop);
    const cat = prop.category || "kost";
    setEditCategory(cat);
    setEditName(prop.name);
    setEditType(prop.type);
    setEditLocation(prop.location);
    setEditAddress(prop.address);
    setEditTotalRooms(prop.totalRooms);
    setEditPriceRange(prop.priceRange);
    setEditSelectedImage(prop.image);
    const isPreset = PROPERTY_IMAGE_PRESETS[cat]?.some((p) => p.url === prop.image);
    if (isPreset) {
      setEditCustomImageUrl("");
      setEditUploadedImagePreview(null);
      setEditUploadedImageFileName("");
      setEditImageSourceMode("preset");
    } else {
      setEditCustomImageUrl(prop.image);
      setEditUploadedImagePreview(prop.image);
      setEditUploadedImageFileName("Foto Properti Saat Ini");
      setEditImageSourceMode("upload");
    }
    setEditFacilities(prop.facilities || []);
    setEditManagerName(prop.managerName || "Gde Asbawa");
    setEditManagerPhone(prop.managerPhone || "+62 812-3456-7890");
    setEditBank(prop.bankAccount?.bank || "BCA");
    setEditAccountNumber(prop.bankAccount?.accountNumber || "");
    setEditAccountHolder(prop.bankAccount?.accountHolder || "GDE ASBAWA PUTRA");
    setIsEditModalOpen(true);
  };

  const handleEditCategoryChange = (cat: PropertyCategory) => {
    setEditCategory(cat);
    if (!editCustomImageUrl) {
      setEditSelectedImage(PROPERTY_IMAGE_PRESETS[cat][0].url);
    }
    if (cat === "kost") {
      setEditType("Campur");
    } else if (cat === "rumah") {
      setEditType("Rumah Cluster & Kontrakan");
    } else if (cat === "parkir") {
      setEditType("Lot Parkir Mobil & Motor");
    } else if (cat === "ruko") {
      setEditType("Ruko 2 Lantai");
    } else if (cat === "tanah") {
      setEditType("Lahan Komersial / Usaha");
    }
  };

  const toggleEditFacility = (facility: string) => {
    setEditFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleSaveEditProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageProperty) {
      alert("Akses Dibatasi: Role Admin tidak memiliki izin untuk mengedit data properti.");
      return;
    }
    if (!propertyToEdit || !editName.trim() || !editLocation.trim()) return;

    const finalImage = editCustomImageUrl.trim() || editSelectedImage || propertyToEdit.image;
    const totalRoomsCount = Math.max(1, Number(editTotalRooms));
    const occupiedCount = Math.min(propertyToEdit.occupiedRooms, totalRoomsCount);
    const availableCount = Math.max(0, totalRoomsCount - occupiedCount - (propertyToEdit.maintenanceRooms || 0));
    const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

    const updatedProp: Property = {
      ...propertyToEdit,
      name: editName.trim(),
      category: editCategory,
      type: editType.trim() || propertyToEdit.type,
      location: editLocation.trim(),
      address: editAddress.trim() || `${editLocation.trim()}, Indonesia`,
      city: editLocation.trim(),
      totalRooms: totalRoomsCount,
      occupiedRooms: occupiedCount,
      availableRooms: availableCount,
      occupancyRate,
      image: finalImage,
      priceRange: editPriceRange.trim() || propertyToEdit.priceRange,
      facilities:
        editFacilities.length > 0
          ? editFacilities
          : CATEGORY_FACILITIES[editCategory].slice(0, 4),
      managerName: editManagerName.trim() || propertyToEdit.managerName,
      managerPhone: editManagerPhone.trim() || propertyToEdit.managerPhone,
      bankAccount: {
        bank: editBank.trim() || "BCA",
        accountNumber: editAccountNumber.trim() || propertyToEdit.bankAccount?.accountNumber || "",
        accountHolder: editAccountHolder.trim() || propertyToEdit.bankAccount?.accountHolder || "GDE ASBAWA PUTRA",
      },
    };

    if (onUpdateProperty) {
      onUpdateProperty(updatedProp);
    }

    if (selectedDetailProperty?.id === propertyToEdit.id) {
      setSelectedDetailProperty(updatedProp);
    }

    setIsEditModalOpen(false);
    setPropertyToEdit(null);
  };

  // Synchronize defaults when category in modal changes
  const handleCategoryChange = (cat: PropertyCategory) => {
    setNewPropCategory(cat);
    setSelectedImage(PROPERTY_IMAGE_PRESETS[cat][0].url);
    if (cat === "kost") {
      setNewPropType("Campur");
      setNewPropTotalRooms(8);
      setNewPropPriceRange("Rp 2.000.000 - Rp 3.500.000");
      setSelectedFacilities([
        "AC Dingin",
        "WiFi High-Speed",
        "Kamar Mandi Dalam",
        "Kasur Springbed",
        "Security 24 Jam",
      ]);
    } else if (cat === "rumah") {
      setNewPropType("Rumah Cluster & Kontrakan");
      setNewPropTotalRooms(3);
      setNewPropPriceRange("Rp 4.000.000 - Rp 5.000.000");
      setSelectedFacilities([
        "Carport Mobil",
        "2-3 Kamar Tidur",
        "2 Kamar Mandi",
        "Dapur Pribadi",
        "One Gate System Security 24 Jam",
        "Listrik PLN 2200 VA / 3500 VA",
        "Air PDAM Bersih / Jetpump",
      ]);
    } else if (cat === "parkir") {
      setNewPropType("Lot Parkir Mobil & Motor");
      setNewPropTotalRooms(6);
      setNewPropPriceRange("Rp 400.000 - Rp 1.500.000");
      setSelectedFacilities([
        "Kanopi / Atap Lindung Baja",
        "Akses Barrier Gate RFID 24 Jam",
        "CCTV Depan Tiap Slot 24 Jam",
        "Security Patrol 24 Jam",
        "Penerangan LED Terang",
      ]);
    } else if (cat === "ruko") {
      setNewPropType("Ruko 2 Lantai");
      setNewPropTotalRooms(4);
      setNewPropPriceRange("Rp 5.000.000 - Rp 9.000.000");
      setSelectedFacilities([
        "Rolling Door Besi",
        "Parkir Pengunjung Luas",
        "Listrik PLN Daya Industri / Komersial",
        "Air PDAM Bersih",
        "Kamar Mandi Tiap Lantai",
        "Dekat Jalan Raya Utama",
      ]);
    } else if (cat === "tanah") {
      setNewPropType("Lahan Komersial / Usaha");
      setNewPropTotalRooms(2);
      setNewPropPriceRange("Rp 2.500.000 - Rp 8.000.000");
      setSelectedFacilities([
        "Akses Jalan Aspal Masuk Truk / Kontainer",
        "Sertifikat Hak Milik (SHM) / HGB Bersih",
        "Sudah Dipagar Keliling",
        "Jaringan Listrik PLN & Air Siap Sambung",
        "Bebas Banjir",
        "Tanah Rata Padat Siap Bangun / Digunakan",
      ]);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());

    const pCategory = p.category || "kost";
    const matchesCategory = categoryFilter === "all" || pCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageProperty) {
      alert("Akses Dibatasi: Role Admin tidak memiliki izin untuk menambah properti baru.");
      return;
    }
    if (!newPropName.trim() || !newPropLocation.trim()) return;

    const totalRoomsCount = Math.max(1, Number(newPropTotalRooms));
    const finalImage = customImageUrl.trim() || selectedImage;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      category: newPropCategory,
      type: newPropType,
      location: newPropLocation.trim(),
      address: newPropAddress.trim() || `${newPropLocation.trim()}, Indonesia`,
      city: newPropLocation.trim(),
      totalRooms: totalRoomsCount,
      occupiedRooms: 0,
      availableRooms: totalRoomsCount,
      maintenanceRooms: 0,
      occupancyRate: 0,
      image: finalImage,
      priceRange: newPropPriceRange.trim() || "Rp 1.500.000 - Rp 4.500.000",
      facilities:
        selectedFacilities.length > 0
          ? selectedFacilities
          : CATEGORY_FACILITIES[newPropCategory].slice(0, 4),
      managerName: newPropManager.trim() || "Admin Pengelola",
      managerPhone: newPropPhone.trim() || "+62 812-3456-7890",
      bankAccount: {
        bank: newPropBank.trim() || "BCA",
        accountNumber: newPropAccountNum.trim() || "8830-9988-11",
        accountHolder: newPropAccountHolder.trim() || "GDE ASBAWA PUTRA",
      },
      monthlyRevenue: 0,
    };

    onAddProperty(newProp, createStarterRooms);
    setIsAddModalOpen(false);

    // Reset form fields
    setNewPropName("");
    setNewPropLocation("");
    setNewPropAddress("");
    setCustomImageUrl("");
  };

  const handleConfirmDelete = () => {
    if (!canManageProperty) {
      alert("Akses Dibatasi: Role Admin tidak memiliki izin untuk menghapus properti.");
      return;
    }
    if (!propertyToDelete) return;
    if (onDeleteProperty) {
      onDeleteProperty(propertyToDelete.id);
    }
    if (selectedDetailProperty?.id === propertyToDelete.id) {
      setSelectedDetailProperty(null);
    }
    setPropertyToDelete(null);
  };

  // Stats calculation
  const totalUnits = properties.length;
  const totalRoomsCount = properties.reduce((acc, p) => acc + (p.totalRooms || 0), 0);
  const totalOccupiedCount = properties.reduce((acc, p) => acc + (p.occupiedRooms || 0), 0);
  const avgOccupancy = totalRoomsCount > 0 ? Math.round((totalOccupiedCount / totalRoomsCount) * 100) : 0;

  const kostCount = properties.filter((p) => (p.category || "kost") === "kost").length;
  const rumahCount = properties.filter((p) => p.category === "rumah").length;
  const parkirCount = properties.filter((p) => p.category === "parkir").length;
  const rukoCount = properties.filter((p) => p.category === "ruko").length;
  const tanahCount = properties.filter((p) => p.category === "tanah").length;

  const getCategoryBadge = (cat?: PropertyCategory) => {
    switch (cat) {
      case "rumah":
        return {
          label: "Sewa Rumah",
          icon: <Home className="w-3 h-3 text-indigo-200" />,
          bgColor: "bg-indigo-900/90 text-indigo-100 border-indigo-500/40",
          tagColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
          unitTerm: "Unit Rumah",
        };
      case "parkir":
        return {
          label: "Sewa Lot Parkir",
          icon: <Car className="w-3 h-3 text-emerald-200" />,
          bgColor: "bg-emerald-900/90 text-emerald-100 border-emerald-500/40",
          tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
          unitTerm: "Slot Parkir",
        };
      case "ruko":
        return {
          label: "Ruko",
          icon: <Store className="w-3 h-3 text-amber-300" />,
          bgColor: "bg-amber-950/90 text-amber-100 border-amber-500/40",
          tagColor: "bg-amber-50 text-amber-900 border-amber-200",
          unitTerm: "Unit Ruko",
        };
      case "tanah":
        return {
          label: "Sewa Tanah",
          icon: <Trees className="w-3 h-3 text-teal-300" />,
          bgColor: "bg-teal-950/90 text-teal-100 border-teal-500/40",
          tagColor: "bg-teal-50 text-teal-900 border-teal-200",
          unitTerm: "Kavling / Lahan",
        };
      case "kost":
      default:
        return {
          label: "Kost",
          icon: <Building2 className="w-3 h-3 text-amber-300" />,
          bgColor: "bg-[#7b1113] text-[#facc15] border-[#facc15]/30",
          tagColor: "bg-rose-50 text-[#7b1113] border-rose-200",
          unitTerm: "Kamar",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7b1113]" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Manajemen Properti & Unit Sewa
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#7b1113] border border-rose-200">
              {totalUnits} Properti Terdaftar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola properti kost, rumah kontrakan, lot parkir, ruko komersial, dan sewa lahan tanah Anda dalam satu sistem terintegrasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!canManageProperty && (
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Akses Admin: Hanya Melihat Data Properti</span>
            </div>
          )}

          {canManageProperty && userRole === "owner" && properties.length > 0 && onClearAllData && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-gray-200 hover:border-red-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Bersihkan seluruh data contoh untuk mulai menginput data properti Anda sendiri"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              Bersihkan Data Contoh
            </button>
          )}

          {canManageProperty && properties.length === 0 && onResetMinimalData && (
            <button
              onClick={onResetMinimalData}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7b1113]" />
              Muat 1 Contoh Demo
            </button>
          )}

          {canManageProperty && (
            <button
              onClick={() => {
                handleCategoryChange("kost");
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#facc15]" />
              Tambah Properti Baru
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "all"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Semua Kategori ({properties.length})
        </button>
        <button
          onClick={() => setCategoryFilter("kost")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "kost"
              ? "bg-[#7b1113] text-[#facc15] shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#7b1113]" />
          Kost ({kostCount})
        </button>
        <button
          onClick={() => setCategoryFilter("rumah")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "rumah"
              ? "bg-indigo-900 text-white shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Home className="w-3.5 h-3.5 text-indigo-600" />
          Sewa Rumah ({rumahCount})
        </button>
        <button
          onClick={() => setCategoryFilter("parkir")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "parkir"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Car className="w-3.5 h-3.5 text-emerald-600" />
          Sewa Lot Parkir ({parkirCount})
        </button>
        <button
          onClick={() => setCategoryFilter("ruko")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "ruko"
              ? "bg-amber-900 text-amber-200 shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Store className="w-3.5 h-3.5 text-amber-600" />
          Ruko ({rukoCount})
        </button>
        <button
          onClick={() => setCategoryFilter("tanah")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            categoryFilter === "tanah"
              ? "bg-teal-900 text-teal-200 shadow-xs"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Trees className="w-3.5 h-3.5 text-teal-600" />
          Sewa Tanah ({tanahCount})
        </button>
      </div>

      {/* Filter / Search Bar & Summary Stats */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari properti, lokasi, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7b1113] text-gray-800"
          />
          <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600 w-full md:w-auto justify-between md:justify-end">
          <span className="font-semibold text-gray-700">
            Total Ditampilkan: <strong className="text-gray-900">{filteredProperties.length} Properti</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="font-semibold text-gray-700">
            Kapasitas: <strong className="text-gray-900">{totalRoomsCount} Unit/Slot/Kamar</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="font-semibold text-emerald-700">
            Rata-rata Okupansi: <strong className="text-emerald-700">{avgOccupancy}%</strong>
          </span>
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#7b1113] flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Tidak ada properti ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada hasil untuk pencarian "${searchQuery}".`
              : "Belum ada properti terdaftar pada kategori ini."}
          </p>
          {canManageProperty && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7b1113] text-[#facc15] text-xs font-bold shadow-xs hover:bg-[#630d0f] transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Properti Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => {
            const isTopPerformer = prop.occupancyRate >= 65;
            const propRooms = rooms.filter((r) => r.propertyId === prop.id);
            const occupiedRoomsCount =
              propRooms.length > 0
                ? propRooms.filter((r) => r.status === "occupied").length
                : prop.occupiedRooms;
            const totalRooms = propRooms.length > 0 ? propRooms.length : prop.totalRooms;
            const vacantRooms = totalRooms - occupiedRoomsCount;
            const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 0;
            const catBadge = getCategoryBadge(prop.category);

            return (
              <div
                key={prop.id}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group hover:border-[#7b1113]/40 relative"
              >
                {/* Top Image & Badge */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={prop.image}
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm border ${catBadge.bgColor}`}
                    >
                      {catBadge.icon}
                      {catBadge.label} • {prop.type}
                    </span>
                    {isTopPerformer && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#facc15] text-[#7b1113] flex items-center gap-1 shadow-sm">
                        <Award className="w-3 h-3" /> Okupansi Tinggi
                      </span>
                    )}
                  </div>

                  {/* Top Right Quick Actions */}
                  {canManageProperty && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(prop);
                        }}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-[#7b1113] text-white backdrop-blur-xs transition shadow-sm cursor-pointer"
                        title="Edit Detail Properti Ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertyToDelete(prop);
                        }}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-red-600 text-white backdrop-blur-xs transition shadow-sm cursor-pointer"
                        title="Hapus Properti Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Bottom title on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base leading-tight drop-shadow-xs">{prop.name}</h3>
                    <p className="text-xs text-gray-200 flex items-center gap-1 mt-0.5 drop-shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Room/Unit/Slot Statistics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Status {catBadge.unitTerm}</span>
                      <strong className="text-gray-900 font-bold">
                        {occupiedRoomsCount} / {totalRooms} {catBadge.unitTerm.toLowerCase()} terisi
                      </strong>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyRate >= 70
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            : occupancyRate >= 40
                            ? "bg-gradient-to-r from-amber-500 to-amber-600"
                            : "bg-gradient-to-r from-rose-500 to-rose-600"
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5 text-amber-600" />
                        Tersedia / Kosong: <strong className="text-gray-700">{vacantRooms}</strong>
                      </span>
                      <span className="font-extrabold text-emerald-600 text-xs">
                        {occupancyRate}% Okupansi
                      </span>
                    </div>
                  </div>

                  {/* Price range & Facilities chips */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Tarif Sewa:</span>
                      <strong className="text-[#7b1113] font-bold">{prop.priceRange}</strong>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {prop.facilities.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
                        >
                          {f}
                        </span>
                      ))}
                      {prop.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-medium">
                          +{prop.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDetailProperty(prop)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-[#7b1113] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Detail <ChevronRight className="w-3.5 h-3.5 text-[#facc15]" />
                    </button>
                    {canManageProperty && (
                      <button
                        onClick={() => handleOpenEditModal(prop)}
                        className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#7b1113] border border-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Edit Detail Properti Ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#7b1113]" /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectProperty(prop.id);
                        setActiveTab("rooms");
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#7b1113] border border-rose-200 text-xs font-bold transition cursor-pointer whitespace-nowrap"
                      title="Buka Daftar Kamar/Unit/Slot"
                    >
                      {catBadge.unitTerm}
                    </button>
                    {canManageProperty && (
                      <button
                        onClick={() => setPropertyToDelete(prop)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 transition cursor-pointer"
                        title="Hapus Properti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Comparison Table & Performance Ranking */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-[#7b1113]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Peringkat & Ringkasan Seluruh Properti Sewa
              </h3>
              <p className="text-xs text-gray-400">Daftar komparasi unit kost, rumah sewa, dan lot parkir</p>
            </div>
          </div>
          {canManageProperty && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-[#7b1113] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Properti
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Nama Properti</th>
                <th className="pb-3 px-3">Kategori</th>
                <th className="pb-3 px-3">Lokasi</th>
                <th className="pb-3 px-3">Kapasitas</th>
                <th className="pb-3 px-3">Okupansi</th>
                <th className="pb-3 px-3">PIC Pengelola</th>
                <th className="pb-3 px-3">Tarif Sewa</th>
                <th className="pb-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredProperties.map((p) => {
                const badge = getCategoryBadge(p.category);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-7 h-7 rounded-lg object-cover border border-gray-200"
                        />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.tagColor}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{p.location}</td>
                    <td className="py-3 px-3 font-medium">
                      {p.occupiedRooms} / {p.totalRooms} {badge.unitTerm.toLowerCase()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {p.occupancyRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{p.managerName}</td>
                    <td className="py-3 px-3 font-bold text-[#7b1113]">{p.priceRange}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDetailProperty(p)}
                          className="text-xs font-bold text-[#7b1113] hover:underline cursor-pointer"
                        >
                          Detail
                        </button>
                        {canManageProperty && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => {
                            onSelectProperty(p.id);
                            setActiveTab("rooms");
                          }}
                          className="text-xs font-bold text-gray-700 hover:text-gray-900 hover:underline cursor-pointer"
                        >
                          {badge.unitTerm}
                        </button>
                        {canManageProperty && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setPropertyToDelete(p)}
                              className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DETAIL PROPERTI */}
      {selectedDetailProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#7b1113]" />
                <h3 className="font-extrabold text-base text-gray-900">
                  Detail Properti: {selectedDetailProperty.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailProperty(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="h-48 w-full rounded-xl overflow-hidden relative">
                <img
                  src={selectedDetailProperty.image}
                  alt={selectedDetailProperty.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 text-[#facc15] font-bold backdrop-blur">
                  Okupansi {selectedDetailProperty.occupancyRate}%
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#7b1113] text-[#facc15] font-bold">
                  {getCategoryBadge(selectedDetailProperty.category).label} • {selectedDetailProperty.type}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[11px] block">Alamat Lengkap</span>
                  <strong className="text-gray-800">{selectedDetailProperty.address}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[11px] block">
                    Kapasitas {getCategoryBadge(selectedDetailProperty.category).unitTerm}
                  </span>
                  <strong className="text-gray-800">
                    {selectedDetailProperty.totalRooms} Total ({selectedDetailProperty.occupiedRooms} Terisi)
                  </strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[11px] block">Pengelola / PIC</span>
                  <strong className="text-gray-800">{selectedDetailProperty.managerName}</strong>
                  <div className="text-gray-500 text-[10px] mt-0.5">{selectedDetailProperty.managerPhone}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[11px] block">Rekening Pembayaran Sewa</span>
                  <strong className="text-gray-800">
                    {selectedDetailProperty.bankAccount.bank} - {selectedDetailProperty.bankAccount.accountNumber}
                  </strong>
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    a.n {selectedDetailProperty.bankAccount.accountHolder}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Fasilitas Properti</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetailProperty.facilities.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-[#7b1113] border border-rose-200 font-semibold text-[11px]"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {canManageProperty && (
                    <button
                      onClick={() => {
                        setPropertyToDelete(selectedDetailProperty);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Properti Ini
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {canManageProperty && (
                    <button
                      onClick={() => {
                        handleOpenEditModal(selectedDetailProperty);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#7b1113] font-bold border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Detail
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDetailProperty(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      onSelectProperty(selectedDetailProperty.id);
                      setSelectedDetailProperty(null);
                      setActiveTab("rooms");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold cursor-pointer"
                  >
                    Buka {getCategoryBadge(selectedDetailProperty.category).unitTerm} Properti Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PROPERTI BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7b1113] text-[#facc15] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Tambah Properti Sewa Baru</h3>
                  <p className="text-[11px] text-gray-400">
                    Daftarkan unit kost, sewa rumah kontrakan, atau sewa lot parkir
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="mt-4 space-y-4 text-xs">
              {/* Category Selector Buttons */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5">Pilih Jenis / Kategori Properti *</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("kost")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      newPropCategory === "kost"
                        ? "bg-[#7b1113] text-[#facc15] border-[#7b1113] shadow-sm ring-2 ring-[#facc15]/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-bold text-xs">Kost</span>
                    <span className="text-[10px] opacity-80">Kamar Sewa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("rumah")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      newPropCategory === "rumah"
                        ? "bg-indigo-900 text-white border-indigo-900 shadow-sm ring-2 ring-indigo-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-bold text-xs">Sewa Rumah</span>
                    <span className="text-[10px] opacity-80">Kontrakan/Cluster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("parkir")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      newPropCategory === "parkir"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span className="font-bold text-xs">Lot Parkir</span>
                    <span className="text-[10px] opacity-80">Mobil & Motor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("ruko")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      newPropCategory === "ruko"
                        ? "bg-amber-900 text-amber-200 border-amber-900 shadow-sm ring-2 ring-amber-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span className="font-bold text-xs">Ruko</span>
                    <span className="text-[10px] opacity-80">Komersial/Bisnis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("tanah")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                      newPropCategory === "tanah"
                        ? "bg-teal-900 text-teal-200 border-teal-900 shadow-sm ring-2 ring-teal-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Trees className="w-5 h-5" />
                    <span className="font-bold text-xs">Sewa Tanah</span>
                    <span className="text-[10px] opacity-80">Lahan/Kavling</span>
                  </button>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">
                    {newPropCategory === "rumah"
                      ? "Nama Properti Rumah / Perumahan *"
                      : newPropCategory === "parkir"
                      ? "Nama Lokasi Lot Parkir *"
                      : newPropCategory === "ruko"
                      ? "Nama Ruko / Komplek Ruko *"
                      : newPropCategory === "tanah"
                      ? "Nama Lahan / Kavling Sewa Tanah *"
                      : "Nama Properti Kost *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      newPropCategory === "rumah"
                        ? "Contoh: Graha Asri Residence BSD"
                        : newPropCategory === "parkir"
                        ? "Contoh: Grand Central Parking SCBD"
                        : newPropCategory === "ruko"
                        ? "Contoh: Ruko Golden Niaga Boulevard"
                        : newPropCategory === "tanah"
                        ? "Contoh: Lahan Komersial Sunset Road"
                        : "Contoh: Kost Harmoni Kemanggisan"
                    }
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lokasi / Kota *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Selatan"
                    value={newPropLocation}
                    onChange={(e) => setNewPropLocation(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tipe / Klasifikasi</label>
                  {newPropCategory === "kost" ? (
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Campur">Campur</option>
                      <option value="Putra">Putra</option>
                      <option value="Putri">Putri</option>
                      <option value="Eksekutif">Eksekutif</option>
                      <option value="Pasutri">Pasutri</option>
                    </select>
                  ) : newPropCategory === "rumah" ? (
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Rumah Kontrakan & Cluster">Rumah Kontrakan & Cluster</option>
                      <option value="Rumah 1 Lantai">Rumah 1 Lantai</option>
                      <option value="Rumah 2 Lantai">Rumah 2 Lantai</option>
                      <option value="Townhouse / Villa">Townhouse / Villa</option>
                    </select>
                  ) : newPropCategory === "parkir" ? (
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Lot Parkir Mobil & Motor">Lot Parkir Mobil & Motor</option>
                      <option value="Parkir Khusus Mobil">Parkir Khusus Mobil</option>
                      <option value="Parkir Khusus Motor">Parkir Khusus Motor</option>
                      <option value="Gedung Parkir Terpadu">Gedung Parkir Terpadu</option>
                    </select>
                  ) : newPropCategory === "ruko" ? (
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Ruko 2 Lantai">Ruko 2 Lantai</option>
                      <option value="Ruko 1 Lantai">Ruko 1 Lantai</option>
                      <option value="Ruko 3 Lantai">Ruko 3 Lantai</option>
                      <option value="Ruko Gandeng / Sudut">Ruko Gandeng / Sudut</option>
                      <option value="Kios Komersial">Kios Komersial</option>
                    </select>
                  ) : (
                    <select
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Lahan Komersial / Usaha">Lahan Komersial / Usaha</option>
                      <option value="Kavling Siap Bangun">Kavling Siap Bangun</option>
                      <option value="Lahan Terbuka / Gudang">Lahan Terbuka / Gudang</option>
                      <option value="Lahan Pertanian / Kebun">Lahan Pertanian / Kebun</option>
                      <option value="Lahan Parkir / Pool">Lahan Parkir / Pool</option>
                    </select>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Boulevard Timur Blok C No. 12, Tangerang Selatan"
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo & Upload Section */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#7b1113]" />
                    Foto Properti *
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex bg-gray-200 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("upload")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageSourceMode === "upload"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Upload className="w-3 h-3" /> Upload Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("preset")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageSourceMode === "preset"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" /> Galeri Pilihan
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("url")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageSourceMode === "url"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" /> URL Link
                    </button>
                  </div>
                </div>

                {/* Upload File Mode */}
                {imageSourceMode === "upload" && (
                  <div>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessImageFile(file, false);
                      }}
                      className="hidden"
                    />

                    {uploadedImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#7b1113] bg-black/5 aspect-video sm:aspect-21/9 max-h-52 flex items-center justify-center group">
                        <img
                          src={uploadedImagePreview}
                          alt="Uploaded Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Foto Kustom Aktif
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => addFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImagePreview(null);
                              setUploadedImageFileName("");
                              setCustomImageUrl("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                        {uploadedImageFileName && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] py-1 px-3 truncate text-center">
                            {uploadedImageFileName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingAdd(true);
                        }}
                        onDragLeave={() => setIsDraggingAdd(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingAdd(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleProcessImageFile(file, false);
                        }}
                        onClick={() => addFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          isDraggingAdd
                            ? "border-[#7b1113] bg-amber-50/50"
                            : "border-gray-300 hover:border-[#7b1113] hover:bg-white bg-gray-50/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-[#7b1113] flex items-center justify-center shadow-xs">
                          {isUploadingImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-[#7b1113]" />
                          ) : (
                            <Upload className="w-6 h-6 text-[#7b1113]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">
                            {isUploadingImage
                              ? "Mengompres & Mengunggah Gambar..."
                              : "Klik untuk pilih foto dari galeri / seret foto ke sini"}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Mendukung JPG, PNG, WEBP (Otomatis dioptimalkan untuk performa tinggi)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-3 py-1 rounded-lg bg-[#7b1113] text-[#facc15] font-bold text-[11px] shadow-xs hover:bg-[#630d0f] transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Pilih Foto dari Galeri / File
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Preset Gallery Mode */}
                {imageSourceMode === "preset" && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Pilih foto representatif sesuai jenis {getCategoryBadge(newPropCategory).label}:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROPERTY_IMAGE_PRESETS[newPropCategory].map((preset) => {
                        const isSelected = selectedImage === preset.url && !customImageUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedImage(preset.url);
                              setCustomImageUrl("");
                              setUploadedImagePreview(null);
                            }}
                            className={`relative rounded-xl overflow-hidden border-2 aspect-video group text-left cursor-pointer transition ${
                              isSelected
                                ? "border-[#7b1113] ring-2 ring-[#facc15]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7b1113] text-[#facc15] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-0.5 text-center truncate">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* URL Input Mode */}
                {imageSourceMode === "url" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500">
                      Masukkan tautan langsung URL foto gambar dari internet:
                    </p>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        setUploadedImagePreview(null);
                      }}
                      className="w-full p-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                    {customImageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-36">
                        <img
                          src={customImageUrl}
                          alt="Preview URL"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Capacity and Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {newPropCategory === "rumah"
                      ? "Jumlah Unit Rumah Awal"
                      : newPropCategory === "parkir"
                      ? "Jumlah Slot Parkir Awal"
                      : newPropCategory === "ruko"
                      ? "Jumlah Unit Ruko Awal"
                      : newPropCategory === "tanah"
                      ? "Jumlah Kavling / Petak Lahan Awal"
                      : "Jumlah Kamar Awal"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPropTotalRooms}
                    onChange={(e) => setNewPropTotalRooms(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                  <label className="flex items-center gap-2 mt-2 text-[11px] text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createStarterRooms}
                      onChange={(e) => setCreateStarterRooms(e.target.checked)}
                      className="rounded text-[#7b1113] focus:ring-[#7b1113]"
                    />
                    <span>
                      {newPropCategory === "rumah"
                        ? "Otomatis buat data unit rumah awal (Unit 01, 02, dst.)"
                        : newPropCategory === "parkir"
                        ? "Otomatis buat slot parkir (Slot Mobil P-01, Motor M-01)"
                        : newPropCategory === "ruko"
                        ? "Otomatis buat data unit ruko awal (Ruko Blok A-01, A-02, dst.)"
                        : newPropCategory === "tanah"
                        ? "Otomatis buat kavling sewa tanah awal (Kavling T-01, T-02, dst.)"
                        : "Otomatis buat data kamar awal (A-101, A-102, dst.)"}
                    </span>
                  </label>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Rentang Tarif Sewa</label>
                  <input
                    type="text"
                    value={newPropPriceRange}
                    onChange={(e) => setNewPropPriceRange(e.target.value)}
                    placeholder="Rp 2.000.000 - Rp 3.500.000"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">Ditampilkan di ringkasan properti</p>
                </div>
              </div>

              {/* Facilities Selector */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  Fasilitas {getCategoryBadge(newPropCategory).label}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {CATEGORY_FACILITIES[newPropCategory].map((facility) => {
                    const isChecked = selectedFacilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                          isChecked
                            ? "bg-[#7b1113] text-[#facc15] shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isChecked ? "✓" : "+"} {facility}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIC & Bank Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nama PIC / Pengelola</label>
                  <input
                    type="text"
                    value={newPropManager}
                    onChange={(e) => setNewPropManager(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">No. WhatsApp PIC</label>
                  <input
                    type="text"
                    value={newPropPhone}
                    onChange={(e) => setNewPropPhone(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Rekening Bank</label>
                  <input
                    type="text"
                    value={newPropBank}
                    onChange={(e) => setNewPropBank(e.target.value)}
                    placeholder="BCA / Mandiri / BRI"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={newPropAccountNum}
                    onChange={(e) => setNewPropAccountNum(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm transition cursor-pointer"
                >
                  Simpan & Daftarkan Properti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DETAIL PROPERTI */}
      {isEditModalOpen && propertyToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#7b1113] flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-[#7b1113]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Edit Detail Properti</h3>
                  <p className="text-[11px] text-gray-400">
                    Perbarui informasi properti: <strong className="text-gray-700">{propertyToEdit.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setPropertyToEdit(null);
                }}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProperty} className="mt-4 space-y-4 text-xs">
              {/* Category Selector Buttons */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5">Jenis / Kategori Properti *</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange("kost")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      editCategory === "kost"
                        ? "bg-[#7b1113] text-[#facc15] border-[#7b1113] shadow-sm ring-2 ring-[#facc15]/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-bold text-xs">Kost</span>
                    <span className="text-[10px] opacity-80">Kamar Sewa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange("rumah")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      editCategory === "rumah"
                        ? "bg-indigo-900 text-white border-indigo-900 shadow-sm ring-2 ring-indigo-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-bold text-xs">Sewa Rumah</span>
                    <span className="text-[10px] opacity-80">Kontrakan/Cluster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange("parkir")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      editCategory === "parkir"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span className="font-bold text-xs">Lot Parkir</span>
                    <span className="text-[10px] opacity-80">Mobil & Motor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange("ruko")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      editCategory === "ruko"
                        ? "bg-amber-900 text-amber-200 border-amber-900 shadow-sm ring-2 ring-amber-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span className="font-bold text-xs">Ruko</span>
                    <span className="text-[10px] opacity-80">Komersial/Bisnis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditCategoryChange("tanah")}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                      editCategory === "tanah"
                        ? "bg-teal-900 text-teal-200 border-teal-900 shadow-sm ring-2 ring-teal-400/50"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Trees className="w-5 h-5" />
                    <span className="font-bold text-xs">Sewa Tanah</span>
                    <span className="text-[10px] opacity-80">Lahan/Kavling</span>
                  </button>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">
                    {editCategory === "rumah"
                      ? "Nama Properti Rumah / Perumahan *"
                      : editCategory === "parkir"
                      ? "Nama Lokasi Lot Parkir *"
                      : editCategory === "ruko"
                      ? "Nama Ruko / Komplek Ruko *"
                      : editCategory === "tanah"
                      ? "Nama Lahan / Kavling Sewa Tanah *"
                      : "Nama Properti Kost *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      editCategory === "rumah"
                        ? "Contoh: Graha Asri Residence BSD"
                        : editCategory === "parkir"
                        ? "Contoh: Grand Central Parking SCBD"
                        : editCategory === "ruko"
                        ? "Contoh: Ruko Golden Niaga Boulevard"
                        : editCategory === "tanah"
                        ? "Contoh: Lahan Komersial Sunset Road"
                        : "Contoh: Kost Harmoni Kemanggisan"
                    }
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lokasi / Kota *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Barat"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tipe / Klasifikasi</label>
                  {editCategory === "kost" ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Campur">Campur</option>
                      <option value="Putra">Putra</option>
                      <option value="Putri">Putri</option>
                      <option value="Eksekutif">Eksekutif</option>
                      <option value="Pasutri">Pasutri</option>
                    </select>
                  ) : editCategory === "rumah" ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Rumah Kontrakan & Cluster">Rumah Kontrakan & Cluster</option>
                      <option value="Rumah 1 Lantai">Rumah 1 Lantai</option>
                      <option value="Rumah 2 Lantai">Rumah 2 Lantai</option>
                      <option value="Townhouse / Villa">Townhouse / Villa</option>
                      <option value="Paviliun Keluarga">Paviliun Keluarga</option>
                    </select>
                  ) : editCategory === "parkir" ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Lot Parkir Mobil & Motor">Lot Parkir Mobil & Motor</option>
                      <option value="Parkir Khusus Mobil">Parkir Khusus Mobil</option>
                      <option value="Parkir Khusus Motor">Parkir Khusus Motor</option>
                      <option value="Gedung Parkir Terpadu">Gedung Parkir Terpadu</option>
                    </select>
                  ) : editCategory === "ruko" ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Ruko 2 Lantai">Ruko 2 Lantai</option>
                      <option value="Ruko 1 Lantai">Ruko 1 Lantai</option>
                      <option value="Ruko 3 Lantai">Ruko 3 Lantai</option>
                      <option value="Ruko Gandeng / Sudut">Ruko Gandeng / Sudut</option>
                      <option value="Kios Komersial">Kios Komersial</option>
                    </select>
                  ) : (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    >
                      <option value="Lahan Komersial / Usaha">Lahan Komersial / Usaha</option>
                      <option value="Kavling Siap Bangun">Kavling Siap Bangun</option>
                      <option value="Lahan Terbuka / Gudang">Lahan Terbuka / Gudang</option>
                      <option value="Lahan Pertanian / Kebun">Lahan Pertanian / Kebun</option>
                      <option value="Lahan Parkir / Pool">Lahan Parkir / Pool</option>
                    </select>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Anggrek Cakra No. 21, Kebon Jeruk"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo & Upload Section */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#7b1113]" />
                    Foto Properti *
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex bg-gray-200 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setEditImageSourceMode("upload")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        editImageSourceMode === "upload"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Upload className="w-3 h-3" /> Upload Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageSourceMode("preset")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        editImageSourceMode === "preset"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" /> Galeri Pilihan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageSourceMode("url")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                        editImageSourceMode === "url"
                          ? "bg-white text-[#7b1113] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" /> URL Link
                    </button>
                  </div>
                </div>

                {/* Upload File Mode */}
                {editImageSourceMode === "upload" && (
                  <div>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessImageFile(file, true);
                      }}
                      className="hidden"
                    />

                    {editUploadedImagePreview || editCustomImageUrl ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#7b1113] bg-black/5 aspect-video sm:aspect-21/9 max-h-52 flex items-center justify-center group">
                        <img
                          src={editUploadedImagePreview || editCustomImageUrl}
                          alt="Uploaded Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Foto Kustom Aktif
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-900 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditUploadedImagePreview(null);
                              setEditUploadedImageFileName("");
                              setEditCustomImageUrl("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                        {editUploadedImageFileName && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] py-1 px-3 truncate text-center">
                            {editUploadedImageFileName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingEdit(true);
                        }}
                        onDragLeave={() => setIsDraggingEdit(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingEdit(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleProcessImageFile(file, true);
                        }}
                        onClick={() => editFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          isDraggingEdit
                            ? "border-[#7b1113] bg-amber-50/50"
                            : "border-gray-300 hover:border-[#7b1113] hover:bg-white bg-gray-50/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-[#7b1113] flex items-center justify-center shadow-xs">
                          {isEditUploadingImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-[#7b1113]" />
                          ) : (
                            <Upload className="w-6 h-6 text-[#7b1113]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">
                            {isEditUploadingImage
                              ? "Mengompres & Mengunggah Gambar..."
                              : "Klik untuk pilih foto dari galeri / seret foto ke sini"}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Mendukung JPG, PNG, WEBP (Otomatis dioptimalkan untuk performa tinggi)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-3 py-1 rounded-lg bg-[#7b1113] text-[#facc15] font-bold text-[11px] shadow-xs hover:bg-[#630d0f] transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Pilih Foto dari Galeri / File
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Preset Gallery Mode */}
                {editImageSourceMode === "preset" && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-2">
                      Pilih foto representatif sesuai jenis {getCategoryBadge(editCategory).label}:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROPERTY_IMAGE_PRESETS[editCategory]?.map((preset) => {
                        const isSelected = editSelectedImage === preset.url && !editCustomImageUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setEditSelectedImage(preset.url);
                              setEditCustomImageUrl("");
                              setEditUploadedImagePreview(null);
                            }}
                            className={`relative rounded-xl overflow-hidden border-2 aspect-video group text-left cursor-pointer transition ${
                              isSelected
                                ? "border-[#7b1113] ring-2 ring-[#facc15]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7b1113] text-[#facc15] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-0.5 text-center truncate">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* URL Input Mode */}
                {editImageSourceMode === "url" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500">
                      Masukkan tautan langsung URL foto gambar dari internet:
                    </p>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={editCustomImageUrl}
                      onChange={(e) => {
                        setEditCustomImageUrl(e.target.value);
                        setEditUploadedImagePreview(null);
                      }}
                      className="w-full p-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                    />
                    {editCustomImageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-36">
                        <img
                          src={editCustomImageUrl}
                          alt="Preview URL"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Capacity and Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {editCategory === "rumah"
                      ? "Jumlah Unit Rumah"
                      : editCategory === "parkir"
                      ? "Jumlah Slot Parkir"
                      : editCategory === "ruko"
                      ? "Jumlah Unit Ruko"
                      : editCategory === "tanah"
                      ? "Jumlah Kavling / Petak Lahan"
                      : "Jumlah Total Kamar"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editTotalRooms}
                    onChange={(e) => setEditTotalRooms(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Terisi saat ini: {propertyToEdit.occupiedRooms} {getCategoryBadge(propertyToEdit.category).unitTerm}
                  </p>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Rentang Tarif Sewa</label>
                  <input
                    type="text"
                    value={editPriceRange}
                    onChange={(e) => setEditPriceRange(e.target.value)}
                    placeholder="Rp 2.000.000 - Rp 3.500.000"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Ditampilkan di ringkasan properti</p>
                </div>
              </div>

              {/* Facilities Selector */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  Fasilitas {getCategoryBadge(editCategory).label}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {CATEGORY_FACILITIES[editCategory]?.map((facility) => {
                    const isChecked = editFacilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleEditFacility(facility)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                          isChecked
                            ? "bg-[#7b1113] text-[#facc15] shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isChecked ? "✓" : "+"} {facility}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIC & Bank Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nama PIC / Pengelola</label>
                  <input
                    type="text"
                    value={editManagerName}
                    onChange={(e) => setEditManagerName(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">No. WhatsApp PIC</label>
                  <input
                    type="text"
                    value={editManagerPhone}
                    onChange={(e) => setEditManagerPhone(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Rekening Bank</label>
                  <input
                    type="text"
                    value={editBank}
                    onChange={(e) => setEditBank(e.target.value)}
                    placeholder="BCA / Mandiri / BRI"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={editAccountNumber}
                    onChange={(e) => setEditAccountNumber(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    value={editAccountHolder}
                    onChange={(e) => setEditAccountHolder(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7b1113] focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setPropertyToEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7b1113] hover:bg-[#630d0f] text-[#facc15] font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS PROPERTI */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Hapus {getCategoryBadge(propertyToDelete.category).label}?
                </h3>
                <p className="text-[11px] text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#7b1113]" />
                {propertyToDelete.name} ({propertyToDelete.location})
              </div>
              <p className="text-gray-600 leading-relaxed">
                Anda akan menghapus properti ini beserta seluruh data{" "}
                {getCategoryBadge(propertyToDelete.category).unitTerm.toLowerCase()} ({propertyToDelete.totalRooms}{" "}
                {getCategoryBadge(propertyToDelete.category).unitTerm.toLowerCase()}) dan riwayat terkait dari sistem.
              </p>
              {propertyToDelete.occupiedRooms > 0 && (
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 font-semibold text-[11px]">
                  ⚠️ Perhatian: Terdapat {propertyToDelete.occupiedRooms} penyewa aktif pada properti ini.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Properti
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: KONFIRMASI HAPUS SEMUA DATA CONTOH */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Bersihkan Semua Data Contoh?
                </h3>
                <p className="text-[11px] text-gray-500">Mulai database kosong untuk properti Anda</p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-2">
              <p className="text-gray-700 leading-relaxed font-medium">
                Semua data properti contoh, unit/kamar, penyewa demo, dan catatan tagihan contoh akan dihapus dari aplikasi.
              </p>
              <p className="text-gray-500 text-[11px]">
                Setelah dibersihkan, Anda dapat mulai mendaftarkan properti asli Anda melalui tombol <strong>Tambah Properti Baru</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllData) onClearAllData();
                  setIsClearAllModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Bersihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
