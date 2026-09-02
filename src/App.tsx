import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/DashboardView";
import { PropertyView } from "./components/PropertyView";
import { RoomView } from "./components/RoomView";
import { TenantView } from "./components/TenantView";
import { FinanceView } from "./components/FinanceView";
import { ReminderView } from "./components/ReminderView";
import { MaintenanceView } from "./components/MaintenanceView";
import { ContractView } from "./components/ContractView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AiAssistantView } from "./components/AiAssistantView";
import { NotificationView } from "./components/NotificationView";
import { SettingsView } from "./components/SettingsView";
import { ReceiptModal } from "./components/ReceiptModal";
import { ContractDocModal } from "./components/ContractDocModal";
import { LoginView } from "./components/LoginView";

import {
  MOCK_USER,
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_PAYMENTS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_CONTRACTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_INSIGHTS,
  DEMO_ACCOUNTS,
  SAMPLE_PROPERTY_IDS,
  SAMPLE_PROPERTY_NAMES,
} from "./data/mockData";
import {
  ActiveTab,
  UserRole,
  UserProfile,
  Property,
  Room,
  Tenant,
  PaymentRecord,
  MaintenanceTicket,
  Contract,
  AppNotification,
  AIInsight,
  AuthAccount,
} from "./types";
import {
  saveToCloud,
  deleteFromCloud,
  batchSaveToCloud,
  clearCloudCollection,
  subscribeToCollection,
} from "./lib/firebase";

// Storage Fallback
const STORAGE_PREFIX = "gdekost_v3_";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn(`Error reading localStorage for ${key}:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing localStorage for ${key}:`, error);
  }
}

export function App() {
  // Cloud Connection Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"connected" | "syncing" | "offline">("connected");
  const [isCloudInitialized, setIsCloudInitialized] = useState<boolean>(false);

  // Global Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage("is_authenticated", false)
  );
  const [user, setUser] = useState<UserProfile>(() =>
    loadFromStorage("user", MOCK_USER)
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);

  // Helpers to identify and cleanly purge sample / demo data from cloud & local state
  const isSampleProp = (p: Property) =>
    SAMPLE_PROPERTY_IDS.includes(p.id) ||
    SAMPLE_PROPERTY_NAMES.some((name) => p.name?.toLowerCase().trim() === name.toLowerCase().trim());

  const isSampleRm = (r: Room) =>
    SAMPLE_PROPERTY_IDS.includes(r.propertyId) ||
    SAMPLE_PROPERTY_NAMES.some((name) => r.propertyName?.toLowerCase().trim() === name.toLowerCase().trim()) ||
    [
      "rm-101", "rm-102", "rm-103", "rm-104",
      "rm-201", "rm-202",
      "rm-301", "rm-302", "rm-303", "rm-304", "rm-305", "rm-306",
      "rm-401", "rm-402", "rm-403",
      "rm-501", "rm-502",
    ].includes(r.id);

  const isSampleTen = (t: Tenant) =>
    (t.propertyId && SAMPLE_PROPERTY_IDS.includes(t.propertyId)) ||
    (t.propertyName && SAMPLE_PROPERTY_NAMES.some((name) => t.propertyName?.toLowerCase().trim() === name.toLowerCase().trim())) ||
    ["ten-1", "ten-2", "ten-3", "ten-4", "ten-5", "ten-6", "ten-7", "ten-8", "ten-9", "ten-10"].includes(t.id);

  const isSamplePay = (p: PaymentRecord) =>
    (p.propertyId && SAMPLE_PROPERTY_IDS.includes(p.propertyId)) ||
    (p.propertyName && SAMPLE_PROPERTY_NAMES.some((name) => p.propertyName?.toLowerCase().trim() === name.toLowerCase().trim())) ||
    ["pay-101", "pay-102", "pay-103", "pay-104", "pay-105", "pay-106", "pay-107", "pay-108", "pay-109", "pay-110", "pay-111", "pay-112", "pay-201", "pay-301", "pay-302"].includes(p.id);

  const isSampleMaint = (m: MaintenanceTicket) =>
    (m.propertyId && SAMPLE_PROPERTY_IDS.includes(m.propertyId)) ||
    (m.propertyName && SAMPLE_PROPERTY_NAMES.some((name) => m.propertyName?.toLowerCase().trim() === name.toLowerCase().trim())) ||
    ["mnt-101", "mnt-102", "mnt-103", "mnt-104", "mnt-105", "maint-1", "maint-2"].includes(m.id);

  const isSampleCnt = (c: Contract) =>
    (c.propertyId && SAMPLE_PROPERTY_IDS.includes(c.propertyId)) ||
    (c.propertyName && SAMPLE_PROPERTY_NAMES.some((name) => c.propertyName?.toLowerCase().trim() === name.toLowerCase().trim())) ||
    ["cnt-101", "cnt-102", "cnt-201", "cnt-301"].includes(c.id);

  // Domain Entities State initialized from persistent storage & synchronized with Firebase Firestore
  const [properties, setProperties] = useState<Property[]>(() =>
    loadFromStorage("properties", INITIAL_PROPERTIES).filter((p: Property) => !isSampleProp(p))
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    loadFromStorage("rooms", INITIAL_ROOMS).filter((r: Room) => !isSampleRm(r))
  );
  const [tenants, setTenants] = useState<Tenant[]>(() =>
    loadFromStorage("tenants", INITIAL_TENANTS).filter((t: Tenant) => !isSampleTen(t))
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadFromStorage("payments", INITIAL_PAYMENTS).filter((p: PaymentRecord) => !isSamplePay(p))
  );
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() =>
    loadFromStorage("maintenance", INITIAL_MAINTENANCE_TICKETS).filter((m: MaintenanceTicket) => !isSampleMaint(m))
  );
  const [contracts, setContracts] = useState<Contract[]>(() =>
    loadFromStorage("contracts", INITIAL_CONTRACTS).filter((c: Contract) => !isSampleCnt(c))
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage("notifications", INITIAL_NOTIFICATIONS)
  );
  const [accounts, setAccounts] = useState<AuthAccount[]>(() =>
    loadFromStorage("accounts", DEMO_ACCOUNTS)
  );
  const [insights, setInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);

  // Modals state
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);
  const [activeContractDoc, setActiveContractDoc] = useState<Contract | null>(null);

  // --- Real-Time Firebase Firestore Subscriptions & Auto-Migration ---
  useEffect(() => {
    // 1. Subscribe to Properties
    const unsubProperties = subscribeToCollection<Property>(
      "properties",
      (cloudProperties) => {
        if (cloudProperties && cloudProperties.length > 0) {
          const userProps = cloudProperties.filter((p) => !isSampleProp(p));
          setProperties(userProps);
          saveToStorage("properties", userProps);
        }
        setCloudSyncStatus("connected");
      },
      () => setCloudSyncStatus("offline")
    );

    // 2. Subscribe to Rooms
    const unsubRooms = subscribeToCollection<Room>(
      "rooms",
      (cloudRooms) => {
        if (cloudRooms && cloudRooms.length > 0) {
          const userRooms = cloudRooms.filter((r) => !isSampleRm(r));
          setRooms(userRooms);
          saveToStorage("rooms", userRooms);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 3. Subscribe to Tenants
    const unsubTenants = subscribeToCollection<Tenant>(
      "tenants",
      (cloudTenants) => {
        if (cloudTenants && cloudTenants.length > 0) {
          const userTenants = cloudTenants.filter((t) => !isSampleTen(t));
          setTenants(userTenants);
          saveToStorage("tenants", userTenants);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 4. Subscribe to Payments
    const unsubPayments = subscribeToCollection<PaymentRecord>(
      "payments",
      (cloudPayments) => {
        if (cloudPayments && cloudPayments.length > 0) {
          const userPayments = cloudPayments.filter((p) => !isSamplePay(p));
          setPayments(userPayments);
          saveToStorage("payments", userPayments);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 5. Subscribe to Maintenance Tickets
    const unsubMaintenance = subscribeToCollection<MaintenanceTicket>(
      "maintenance",
      (cloudTickets) => {
        if (cloudTickets && cloudTickets.length > 0) {
          const userTickets = cloudTickets.filter((m) => !isSampleMaint(m));
          setMaintenanceTickets(userTickets);
          saveToStorage("maintenance", userTickets);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 6. Subscribe to Contracts
    const unsubContracts = subscribeToCollection<Contract>(
      "contracts",
      (cloudContracts) => {
        if (cloudContracts && cloudContracts.length > 0) {
          const userContracts = cloudContracts.filter((c) => !isSampleCnt(c));
          setContracts(userContracts);
          saveToStorage("contracts", userContracts);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 7. Subscribe to Accounts
    const unsubAccounts = subscribeToCollection<AuthAccount>(
      "accounts",
      (cloudAccounts) => {
        if (cloudAccounts && cloudAccounts.length > 0) {
          setAccounts(cloudAccounts);
          saveToStorage("accounts", cloudAccounts);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    // 8. Subscribe to Notifications
    const unsubNotifications = subscribeToCollection<AppNotification>(
      "notifications",
      (cloudNotifs) => {
        if (cloudNotifs && cloudNotifs.length > 0) {
          setNotifications(cloudNotifs);
          saveToStorage("notifications", cloudNotifs);
        }
      },
      () => setCloudSyncStatus("offline")
    );

    setIsCloudInitialized(true);

    return () => {
      unsubProperties?.();
      unsubRooms?.();
      unsubTenants?.();
      unsubPayments?.();
      unsubMaintenance?.();
      unsubContracts?.();
      unsubAccounts?.();
      unsubNotifications?.();
    };
  }, []);

  // Synchronize state changes to localStorage for instant offline access
  useEffect(() => {
    saveToStorage("user", user);
  }, [user]);

  // Keep properties counts (totalRooms, occupiedRooms, availableRooms, occupancyRate) accurately synchronized with actual rooms
  useEffect(() => {
    if (properties.length === 0 || rooms.length === 0) return;

    let hasChanges = false;
    const updatedProperties = properties.map((p) => {
      const propRooms = rooms.filter((r) => r.propertyId === p.id);
      if (propRooms.length === 0) return p;

      const total = propRooms.length;
      const occupied = propRooms.filter((r) => r.status === "occupied").length;
      const available = propRooms.filter((r) => r.status === "available").length;
      const maintenance = propRooms.filter((r) => r.status === "maintenance").length;
      const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      if (
        p.totalRooms !== total ||
        p.occupiedRooms !== occupied ||
        p.availableRooms !== available ||
        p.maintenanceRooms !== maintenance ||
        p.occupancyRate !== rate
      ) {
        hasChanges = true;
        const updated = {
          ...p,
          totalRooms: total,
          occupiedRooms: occupied,
          availableRooms: available,
          maintenanceRooms: maintenance,
          occupancyRate: rate,
        };
        saveToCloud("properties", updated);
        return updated;
      }
      return p;
    });

    if (hasChanges) {
      setProperties(updatedProperties);
      saveToStorage("properties", updatedProperties);
    }
  }, [rooms]);

  // Ensure selectedPropertyId resets if currently selected property was deleted or is not found
  useEffect(() => {
    if (selectedPropertyId !== "all" && properties.length > 0) {
      const exists = properties.some((p) => p.id === selectedPropertyId);
      if (!exists) {
        setSelectedPropertyId("all");
      }
    }
  }, [properties, selectedPropertyId]);

  // Export Full Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: "KostManager Pro Firebase",
      version: "3.5",
      exportDate: new Date().toISOString(),
      data: {
        properties,
        rooms,
        tenants,
        payments,
        maintenanceTickets,
        contracts,
        accounts,
        user,
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kostmanager-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Cadangan Berhasil Diunduh",
      message: `File backup data properti (${properties.length} properti, ${rooms.length} unit) berhasil disimpan ke komputer/perangkat Anda.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "settings",
    };
    saveToCloud("notifications", notif);
    setNotifications((prev) => [notif, ...prev]);
  };

  // Import / Restore Full Backup JSON
  const handleImportBackup = (backupJson: any): boolean => {
    try {
      if (!backupJson || !backupJson.data) {
        throw new Error("Format file cadangan tidak valid");
      }
      const { data } = backupJson;
      if (Array.isArray(data.properties)) {
        setProperties(data.properties);
        batchSaveToCloud("properties", data.properties);
      }
      if (Array.isArray(data.rooms)) {
        setRooms(data.rooms);
        batchSaveToCloud("rooms", data.rooms);
      }
      if (Array.isArray(data.tenants)) {
        setTenants(data.tenants);
        batchSaveToCloud("tenants", data.tenants);
      }
      if (Array.isArray(data.payments)) {
        setPayments(data.payments);
        batchSaveToCloud("payments", data.payments);
      }
      if (Array.isArray(data.maintenanceTickets)) {
        setMaintenanceTickets(data.maintenanceTickets);
        batchSaveToCloud("maintenance", data.maintenanceTickets);
      }
      if (Array.isArray(data.contracts)) {
        setContracts(data.contracts);
        batchSaveToCloud("contracts", data.contracts);
      }
      if (Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
        batchSaveToCloud("accounts", data.accounts);
      }
      if (data.user) setUser(data.user);

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: "Pemulihan Cloud Berhasil",
        message: `Berhasil memulihkan ${data.properties?.length || 0} properti dan ${data.rooms?.length || 0} unit kamar ke Firebase Cloud.`,
        time: "Baru saja",
        type: "system",
        read: false,
        actionUrl: "properties",
      };
      saveToCloud("notifications", notif);
      setNotifications((prev) => [notif, ...prev]);
      return true;
    } catch (err) {
      console.error("Failed to import backup:", err);
      return false;
    }
  };

  // Role Switcher Handler
  const handleSetUserRole = (role: UserRole) => {
    let roleTitle = "Pemilik Kost";
    if (role === "property_manager") roleTitle = "Property Manager";
    if (role === "admin") roleTitle = "Admin Kost";
    if (role === "finance") roleTitle = "Staf Keuangan";
    if (role === "technician") roleTitle = "Teknisi Lapangan";

    setUser((prev) => ({
      ...prev,
      role,
      roleTitle,
    }));
  };

  // Property Handlers
  const handleAddProperty = async (newProp: Property, createStarterRooms = true) => {
    setProperties((prev) => [newProp, ...prev]);
    await saveToCloud("properties", newProp);

    // Create starter units/rooms/slots for this property if requested
    if (createStarterRooms && newProp.totalRooms > 0) {
      const starterRooms: Room[] = [];
      const roomCount = Math.min(newProp.totalRooms, 30);
      const category = newProp.category || "kost";

      for (let i = 1; i <= roomCount; i++) {
        if (category === "rumah") {
          starterRooms.push({
            id: `unit-${newProp.id}-${i}`,
            propertyId: newProp.id,
            propertyName: newProp.name,
            roomNumber: `Unit Rumah ${i < 10 ? `0${i}` : i}`,
            floor: i % 2 === 0 ? 2 : 1,
            type: i % 2 === 0 ? "Rumah 2 Lantai" : "Rumah 1 Lantai",
            price: 4000000 + ((i % 3) * 500000),
            status: "available",
            size: i % 2 === 0 ? "70 / 120 m²" : "45 / 90 m²",
            facilities: ["2-3 Kamar Tidur", "Carport Mobil", "Dapur Pribadi", "Taman Belakang", "Listrik PLN", "Air Bersih PDAM"],
            electricityMeter: `PLN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            lastCleanedDate: "2026-08-25",
          });
        } else if (category === "parkir") {
          const isCarSlot = i <= Math.ceil(roomCount * 0.6);
          const slotNum = isCarSlot ? `Slot Mobil P-${i < 10 ? `0${i}` : i}` : `Slot Motor M-${(i - Math.ceil(roomCount * 0.6)) < 10 ? `0${i - Math.ceil(roomCount * 0.6)}` : (i - Math.ceil(roomCount * 0.6))}`;
          starterRooms.push({
            id: `slot-${newProp.id}-${i}`,
            propertyId: newProp.id,
            propertyName: newProp.name,
            roomNumber: slotNum,
            floor: 1,
            type: isCarSlot ? "Slot Mobil" : "Slot Motor",
            price: isCarSlot ? 1500000 : 400000,
            status: "available",
            size: isCarSlot ? "2.5 x 5.0 m" : "1.2 x 2.2 m",
            facilities: ["Kanopi Atap Baja", "Akses Kartu RFID 24 Jam", "CCTV Pengawas", "Penerangan LED"],
            electricityMeter: "N/A (Fasilitas Parkir)",
            lastCleanedDate: "2026-08-30",
          });
        } else if (category === "ruko") {
          starterRooms.push({
            id: `unit-${newProp.id}-${i}`,
            propertyId: newProp.id,
            propertyName: newProp.name,
            roomNumber: `Ruko Blok A-0${i}`,
            floor: i % 2 === 0 ? 2 : 1,
            type: i % 2 === 0 ? "Ruko 2 Lantai" : "Ruko 1 Lantai",
            price: 5000000 + ((i % 3) * 1000000),
            status: "available",
            size: "5 x 15 m (2 Lt)",
            facilities: ["Daya Listrik 3500W", "Rolling Door Besi", "Toilet di Setiap Lantai", "Area Parkir Depan", "Air PDAM"],
            electricityMeter: `PLN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            lastCleanedDate: "2026-08-28",
          });
        } else if (category === "tanah") {
          starterRooms.push({
            id: `slot-${newProp.id}-${i}`,
            propertyId: newProp.id,
            propertyName: newProp.name,
            roomNumber: `Kavling T-0${i}`,
            floor: 1,
            type: i % 2 === 0 ? "Lahan Komersial / Usaha" : "Kavling Siap Bangun",
            price: 2500000 + ((i % 3) * 1000000),
            status: "available",
            size: "10 x 25 m (250 m²)",
            facilities: ["Akses Jalan Truk/Tronton", "Pagar Keliling Lahan", "Dekat Jalur Listrik PLN", "Tanah Padat/Keras", "Bebas Banjir"],
            electricityMeter: "N/A (Lahan Terbuka)",
            lastCleanedDate: "2026-08-30",
          });
        } else {
          // Kost Default
          const floor = Math.floor((i - 1) / 10) + 1;
          const numInFloor = ((i - 1) % 10) + 1;
          const floorLetter = String.fromCharCode(64 + floor);
          const roomNumStr = `${floorLetter}-${floor}0${numInFloor}`;
          starterRooms.push({
            id: `room-${newProp.id}-${i}`,
            propertyId: newProp.id,
            propertyName: newProp.name,
            roomNumber: roomNumStr,
            floor: floor,
            type: i % 3 === 0 ? "VIP Suite" : i % 2 === 0 ? "Deluxe" : "Standard",
            price: 2000000 + ((i % 3) * 500000),
            status: "available",
            size: i % 3 === 0 ? "5 x 5 m" : "4 x 4 m",
            facilities: ["AC", "WiFi Cepat", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari Pakaian", "Meja Belajar"],
            electricityMeter: `88${Math.floor(10000000 + Math.random() * 90000000)}`,
            lastCleanedDate: "2026-08-15",
          });
        }
      }
      setRooms((prev) => [...starterRooms, ...prev]);
      await batchSaveToCloud("rooms", starterRooms);
    }

    // Add notification
    const typeLabel =
      newProp.category === "rumah"
        ? "Sewa Rumah"
        : newProp.category === "parkir"
        ? "Sewa Lot Parkir"
        : newProp.category === "ruko"
        ? "Ruko Komersial"
        : newProp.category === "tanah"
        ? "Sewa Tanah"
        : "Kost";
    const unitTerm =
      newProp.category === "rumah"
        ? "unit rumah"
        : newProp.category === "parkir"
        ? "slot parkir"
        : newProp.category === "ruko"
        ? "unit ruko"
        : newProp.category === "tanah"
        ? "kavling tanah"
        : "kamar";
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${typeLabel} Baru Ditambahkan`,
      message: `${newProp.name} (${newProp.location}) dengan ${newProp.totalRooms} ${unitTerm} berhasil didaftarkan ke Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const propToDelete = properties.find((p) => p.id === propertyId);
    const propName = propToDelete?.name || "Properti";

    // Delete from Firestore
    await deleteFromCloud("properties", propertyId);

    // Delete associated rooms from Firestore
    const relatedRooms = rooms.filter((r) => r.propertyId === propertyId);
    for (const r of relatedRooms) {
      deleteFromCloud("rooms", r.id);
    }

    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setRooms((prev) => prev.filter((r) => r.propertyId !== propertyId));
    setTenants((prev) => prev.filter((t) => t.propertyId !== propertyId));
    setContracts((prev) => prev.filter((c) => c.propertyId !== propertyId));
    setPayments((prev) => prev.filter((p) => p.propertyId !== propertyId));
    setMaintenanceTickets((prev) => prev.filter((m) => m.propertyId !== propertyId));

    if (selectedPropertyId === propertyId) {
      setSelectedPropertyId("all");
    }

    // Add notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Properti Berhasil Dihapus",
      message: `Unit ${propName} beserta data kamar terkait telah dihapus dari Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleUpdateProperty = async (updatedProp: Property) => {
    const oldProp = properties.find((p) => p.id === updatedProp.id);
    const oldName = oldProp?.name;

    setProperties((prev) =>
      prev.map((p) => (p.id === updatedProp.id ? updatedProp : p))
    );
    await saveToCloud("properties", updatedProp);

    // If property name changed, keep related records synchronized
    if (oldName && oldName !== updatedProp.name) {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.propertyId === updatedProp.id) {
            const updated = { ...r, propertyName: updatedProp.name };
            saveToCloud("rooms", updated);
            return updated;
          }
          return r;
        })
      );
      setTenants((prev) =>
        prev.map((t) => {
          if (t.propertyId === updatedProp.id) {
            const updated = { ...t, propertyName: updatedProp.name };
            saveToCloud("tenants", updated);
            return updated;
          }
          return t;
        })
      );
      setPayments((prev) =>
        prev.map((p) => {
          if (p.propertyId === updatedProp.id) {
            const updated = { ...p, propertyName: updatedProp.name };
            saveToCloud("payments", updated);
            return updated;
          }
          return p;
        })
      );
      setContracts((prev) =>
        prev.map((c) => {
          if (c.propertyId === updatedProp.id) {
            const updated = { ...c, propertyName: updatedProp.name };
            saveToCloud("contracts", updated);
            return updated;
          }
          return c;
        })
      );
      setMaintenanceTickets((prev) =>
        prev.map((m) => {
          if (m.propertyId === updatedProp.id) {
            const updated = { ...m, propertyName: updatedProp.name };
            saveToCloud("maintenance", updated);
            return updated;
          }
          return m;
        })
      );
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Detail Properti Diperbarui",
      message: `Informasi untuk ${updatedProp.name} (${updatedProp.location}) berhasil disimpan di Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Clear All Data Handler (Mulai dari Nol)
  const handleClearAllData = async () => {
    setProperties([]);
    setRooms([]);
    setTenants([]);
    setPayments([]);
    setMaintenanceTickets([]);
    setContracts([]);
    setSelectedPropertyId("all");

    await clearCloudCollection("properties");
    await clearCloudCollection("rooms");
    await clearCloudCollection("tenants");
    await clearCloudCollection("payments");
    await clearCloudCollection("maintenance");
    await clearCloudCollection("contracts");

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Database Dibersihkan",
      message: "Seluruh data telah dikosongkan dari Cloud Firebase. Anda kini dapat mulai mendaftarkan data properti asli Anda.",
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Reset to Minimal Demo Data Handler
  const handleResetMinimalData = async () => {
    setProperties(INITIAL_PROPERTIES);
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setPayments(INITIAL_PAYMENTS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setContracts(INITIAL_CONTRACTS);
    setSelectedPropertyId("all");

    await batchSaveToCloud("properties", INITIAL_PROPERTIES);
    await batchSaveToCloud("rooms", INITIAL_ROOMS);
    await batchSaveToCloud("tenants", INITIAL_TENANTS);
    await batchSaveToCloud("payments", INITIAL_PAYMENTS);
    await batchSaveToCloud("maintenance", INITIAL_MAINTENANCE_TICKETS);
    await batchSaveToCloud("contracts", INITIAL_CONTRACTS);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Data Contoh Dimuat ke Cloud",
      message: "Data contoh minimal (1 Properti Kost) telah disimpan ke Cloud Firebase.",
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Reset to Full Multi-Property Portfolio (Kost, Rumah, Lot Parkir) & Seed to Cloud
  const handleResetToFullUpdatedData = async () => {
    setCloudSyncStatus("syncing");
    setProperties(INITIAL_PROPERTIES);
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setPayments(INITIAL_PAYMENTS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setContracts(INITIAL_CONTRACTS);
    setAccounts(DEMO_ACCOUNTS);
    setNotifications(INITIAL_NOTIFICATIONS);

    saveToStorage("properties", INITIAL_PROPERTIES);
    saveToStorage("rooms", INITIAL_ROOMS);
    saveToStorage("tenants", INITIAL_TENANTS);
    saveToStorage("payments", INITIAL_PAYMENTS);
    saveToStorage("maintenance", INITIAL_MAINTENANCE_TICKETS);
    saveToStorage("contracts", INITIAL_CONTRACTS);
    saveToStorage("accounts", DEMO_ACCOUNTS);
    saveToStorage("notifications", INITIAL_NOTIFICATIONS);

    try {
      await batchSaveToCloud("properties", INITIAL_PROPERTIES);
      await batchSaveToCloud("rooms", INITIAL_ROOMS);
      await batchSaveToCloud("tenants", INITIAL_TENANTS);
      await batchSaveToCloud("payments", INITIAL_PAYMENTS);
      await batchSaveToCloud("maintenance", INITIAL_MAINTENANCE_TICKETS);
      await batchSaveToCloud("contracts", INITIAL_CONTRACTS);
      await batchSaveToCloud("accounts", DEMO_ACCOUNTS);
      await batchSaveToCloud("notifications", INITIAL_NOTIFICATIONS);
      setCloudSyncStatus("connected");
    } catch (e) {
      console.error("Error updating cloud:", e);
      setCloudSyncStatus("offline");
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Portfolio Properti Diperbarui",
      message: `Berhasil memuat dan menyinkronkan 3 kategori properti lengkap (Kost, Rumah, Lot Parkir) ke Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "properties",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Force Synchronize All Current Local Data to Cloud Firestore
  const handleForceSyncToCloud = async (): Promise<boolean> => {
    setCloudSyncStatus("syncing");
    try {
      await batchSaveToCloud("properties", properties);
      await batchSaveToCloud("rooms", rooms);
      await batchSaveToCloud("tenants", tenants);
      await batchSaveToCloud("payments", payments);
      await batchSaveToCloud("maintenance", maintenanceTickets);
      await batchSaveToCloud("contracts", contracts);
      await batchSaveToCloud("accounts", accounts);
      await batchSaveToCloud("notifications", notifications);
      setCloudSyncStatus("connected");
      return true;
    } catch (err) {
      console.error("Error force syncing to cloud:", err);
      setCloudSyncStatus("offline");
      return false;
    }
  };

  // Room Handlers
  const handleAddRoom = async (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
    await saveToCloud("rooms", newRoom);

    // Update property counters
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === newRoom.propertyId) {
          const total = p.totalRooms + 1;
          const available = p.availableRooms + 1;
          const rate = Math.round((p.occupiedRooms / total) * 100);
          const updated = { ...p, totalRooms: total, availableRooms: available, occupancyRate: rate };
          saveToCloud("properties", updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleUpdateRoom = async (updatedRoom: Room) => {
    const oldRoom = rooms.find((r) => r.id === updatedRoom.id);
    const oldRoomNumber = oldRoom?.roomNumber;

    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    await saveToCloud("rooms", updatedRoom);

    // If unit/room code changed, keep related tenant, contract, payment, and maintenance tickets in sync
    if (oldRoomNumber && oldRoomNumber !== updatedRoom.roomNumber) {
      setTenants((prev) =>
        prev.map((t) => {
          if (t.propertyId === updatedRoom.propertyId && t.roomNumber === oldRoomNumber) {
            const updated = { ...t, roomNumber: updatedRoom.roomNumber };
            saveToCloud("tenants", updated);
            return updated;
          }
          return t;
        })
      );
      setContracts((prev) =>
        prev.map((c) => {
          if (c.propertyId === updatedRoom.propertyId && c.roomNumber === oldRoomNumber) {
            const updated = { ...c, roomNumber: updatedRoom.roomNumber };
            saveToCloud("contracts", updated);
            return updated;
          }
          return c;
        })
      );
      setPayments((prev) =>
        prev.map((p) => {
          if (p.propertyId === updatedRoom.propertyId && p.roomNumber === oldRoomNumber) {
            const updated = { ...p, roomNumber: updatedRoom.roomNumber };
            saveToCloud("payments", updated);
            return updated;
          }
          return p;
        })
      );
      setMaintenanceTickets((prev) =>
        prev.map((m) => {
          if (m.propertyId === updatedRoom.propertyId && m.roomNumber === oldRoomNumber) {
            const updated = { ...m, roomNumber: updatedRoom.roomNumber };
            saveToCloud("maintenance", updated);
            return updated;
          }
          return m;
        })
      );
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const roomToDelete = rooms.find((r) => r.id === roomId);
    if (!roomToDelete) return;

    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    await deleteFromCloud("rooms", roomId);

    // Update property counts
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === roomToDelete.propertyId) {
          const updated = {
            ...p,
            totalRooms: Math.max(0, p.totalRooms - 1),
            availableRooms: roomToDelete.status === "available" ? Math.max(0, p.availableRooms - 1) : p.availableRooms,
            occupiedRooms: roomToDelete.status === "occupied" ? Math.max(0, p.occupiedRooms - 1) : p.occupiedRooms,
          };
          saveToCloud("properties", updated);
          return updated;
        }
        return p;
      })
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Unit / Kamar Dihapus",
      message: `Unit ${roomToDelete.roomNumber} (${roomToDelete.propertyName}) berhasil dihapus dari Cloud Firebase.`,
      time: "Baru saja",
      type: "room",
      read: false,
      actionUrl: "rooms",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Tenant Handlers
  const handleAddTenant = async (newTenant: Tenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    await saveToCloud("tenants", newTenant);

    // Update room status to occupied
    setRooms((prev) =>
      prev.map((r) => {
        if (r.propertyId === newTenant.propertyId && r.roomNumber === newTenant.roomNumber) {
          const updated: Room = {
            ...r,
            status: "occupied",
            tenantId: newTenant.id,
            tenantName: newTenant.name,
          };
          saveToCloud("rooms", updated);
          return updated;
        }
        return r;
      })
    );

    // Create automatic contract
    const newContract: Contract = {
      id: `con-${Date.now()}`,
      contractNumber: `KTR-2026-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      propertyId: newTenant.propertyId,
      propertyName: newTenant.propertyName,
      roomNumber: newTenant.roomNumber,
      startDate: newTenant.checkInDate,
      endDate: newTenant.contractEndDate,
      monthlyRent: newTenant.monthlyPrice,
      deposit: newTenant.depositAmount,
      status: "active",
    };
    setContracts((prev) => [newContract, ...prev]);
    await saveToCloud("contracts", newContract);

    // Create initial invoice
    const newInvoice: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceNumber: `INV-2026-08-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      propertyId: newTenant.propertyId,
      propertyName: newTenant.propertyName,
      roomNumber: newTenant.roomNumber,
      amount: newTenant.monthlyPrice,
      dueDate: "2026-08-05",
      status: "pending",
      category: "Sewa Kamar",
    };
    setPayments((prev) => [newInvoice, ...prev]);
    await saveToCloud("payments", newInvoice);

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Penyewa Baru Check-in",
      message: `${newTenant.name} telah masuk ke Kamar ${newTenant.roomNumber} (${newTenant.propertyName}). Data tersimpan di Cloud Firebase.`,
      time: "Baru saja",
      type: "tenant",
      read: false,
      actionUrl: "tenants",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleUpdateTenant = async (updatedTenant: Tenant) => {
    const oldTenant = tenants.find((t) => t.id === updatedTenant.id);

    setTenants((prev) => prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
    await saveToCloud("tenants", updatedTenant);

    // Sync room assignments & tenant names
    setRooms((prev) =>
      prev.map((r) => {
        // If room or property changed, vacate the old room
        if (
          oldTenant &&
          (oldTenant.propertyId !== updatedTenant.propertyId ||
            oldTenant.roomNumber !== updatedTenant.roomNumber)
        ) {
          if (r.propertyId === oldTenant.propertyId && r.roomNumber === oldTenant.roomNumber) {
            const vacated: Room = {
              ...r,
              status: "available",
              tenantId: undefined,
              tenantName: undefined,
            };
            saveToCloud("rooms", vacated);
            return vacated;
          }
        }

        // Assign to new room
        if (
          r.propertyId === updatedTenant.propertyId &&
          r.roomNumber === updatedTenant.roomNumber
        ) {
          const updated: Room = {
            ...r,
            status: updatedTenant.paymentStatus === "checkout" ? "available" : "occupied",
            tenantId: updatedTenant.paymentStatus === "checkout" ? undefined : updatedTenant.id,
            tenantName: updatedTenant.paymentStatus === "checkout" ? undefined : updatedTenant.name,
          };
          saveToCloud("rooms", updated);
          return updated;
        }

        // If same room but tenant name updated
        if (r.tenantId === updatedTenant.id) {
          const updated: Room = {
            ...r,
            tenantName: updatedTenant.name,
          };
          saveToCloud("rooms", updated);
          return updated;
        }

        return r;
      })
    );

    // Sync contracts
    setContracts((prev) =>
      prev.map((c) => {
        if (c.tenantId === updatedTenant.id) {
          const updated: Contract = {
            ...c,
            tenantName: updatedTenant.name,
            propertyId: updatedTenant.propertyId,
            propertyName: updatedTenant.propertyName,
            roomNumber: updatedTenant.roomNumber,
            monthlyRent: updatedTenant.monthlyPrice,
            deposit: updatedTenant.depositAmount,
            startDate: updatedTenant.checkInDate,
            endDate: updatedTenant.contractEndDate,
            status: updatedTenant.paymentStatus === "checkout" ? "terminated" : c.status,
          };
          saveToCloud("contracts", updated);
          return updated;
        }
        return c;
      })
    );

    // Sync payments
    setPayments((prev) =>
      prev.map((p) => {
        if (p.tenantId === updatedTenant.id) {
          const updated: PaymentRecord = {
            ...p,
            tenantName: updatedTenant.name,
            propertyId: updatedTenant.propertyId,
            propertyName: updatedTenant.propertyName,
            roomNumber: updatedTenant.roomNumber,
          };
          saveToCloud("payments", updated);
          return updated;
        }
        return p;
      })
    );

    // Sync maintenance tickets
    setMaintenanceTickets((prev) =>
      prev.map((m) => {
        if (m.tenantName === oldTenant?.name && m.propertyId === oldTenant?.propertyId) {
          const updated: MaintenanceTicket = {
            ...m,
            tenantName: updatedTenant.name,
            propertyId: updatedTenant.propertyId,
            roomNumber: updatedTenant.roomNumber,
          };
          saveToCloud("maintenance", updated);
          return updated;
        }
        return m;
      })
    );
  };

  const handleDeleteTenant = async (tenantId: string) => {
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    if (!tenantToDelete) return;

    // Remove tenant from state and delete from Cloud Firebase
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    await deleteFromCloud("tenants", tenantId);

    // Vacate the occupied room
    setRooms((prev) =>
      prev.map((r) => {
        if (
          r.tenantId === tenantId ||
          (r.propertyId === tenantToDelete.propertyId && r.roomNumber === tenantToDelete.roomNumber)
        ) {
          const vacated: Room = {
            ...r,
            status: "available",
            tenantId: undefined,
            tenantName: undefined,
          };
          saveToCloud("rooms", vacated);
          return vacated;
        }
        return r;
      })
    );

    // Update property counters
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === tenantToDelete.propertyId) {
          const updated = {
            ...p,
            availableRooms: p.availableRooms + 1,
            occupiedRooms: Math.max(0, p.occupiedRooms - 1),
          };
          saveToCloud("properties", updated);
          return updated;
        }
        return p;
      })
    );

    // IMPORTANT: Payment transaction records (payments) ARE KEPT 100% INTACT.
    // Invoices and financial bookkeeping are preserved with historical tenant info.

    // Update contracts to terminated if any
    setContracts((prev) =>
      prev.map((c) => {
        if (c.tenantId === tenantId) {
          const updated: Contract = {
            ...c,
            status: "terminated",
          };
          saveToCloud("contracts", updated);
          return updated;
        }
        return c;
      })
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Penyewa Dihapus",
      message: `Penyewa ${tenantToDelete.name} (Unit ${tenantToDelete.roomNumber}) berhasil dihapus. Seluruh transaksi pembayaran tetap tersimpan aman di pembukuan.`,
      time: "Baru saja",
      type: "tenant",
      read: false,
      actionUrl: "tenants",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Payment Handlers
  const handleRecordPayment = async (newPayment: PaymentRecord) => {
    setPayments((prev) => [newPayment, ...prev]);
    await saveToCloud("payments", newPayment);

    // Update tenant status to active if overdue
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === newPayment.tenantId && newPayment.status === "paid") {
          const updated = { ...t, paymentStatus: "active" as const };
          saveToCloud("tenants", updated);
          return updated;
        }
        return t;
      })
    );

    // Open receipt modal immediately
    setActiveReceiptPayment(newPayment);

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Pembayaran Sewa Diterima",
      message: `Pembayaran Rp ${newPayment.amount.toLocaleString("id-ID")} dari ${newPayment.tenantName} telah dicatat ke Cloud Firebase.`,
      time: "Baru saja",
      type: "payment",
      read: false,
      actionUrl: "finance",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleUpdatePayment = async (updatedPayment: PaymentRecord) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
    await saveToCloud("payments", updatedPayment);

    // Sync tenant payment status if marked as paid
    if (updatedPayment.status === "paid") {
      setTenants((prev) =>
        prev.map((t) => {
          if (t.id === updatedPayment.tenantId) {
            const updated = { ...t, paymentStatus: "active" as const };
            saveToCloud("tenants", updated);
            return updated;
          }
          return t;
        })
      );
    } else if (updatedPayment.status === "overdue") {
      setTenants((prev) =>
        prev.map((t) => {
          if (t.id === updatedPayment.tenantId) {
            const updated = { ...t, paymentStatus: "overdue" as const };
            saveToCloud("tenants", updated);
            return updated;
          }
          return t;
        })
      );
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Data Pembayaran Diperbarui",
      message: `Invoice ${updatedPayment.invoiceNumber} (${updatedPayment.tenantName}) berhasil diperbarui di Cloud Firebase.`,
      time: "Baru saja",
      type: "payment",
      read: false,
      actionUrl: "finance",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const p = payments.find((item) => item.id === paymentId);
    setPayments((prev) => prev.filter((item) => item.id !== paymentId));
    await deleteFromCloud("payments", paymentId);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Data Pembayaran Dihapus",
      message: `Invoice ${p?.invoiceNumber || paymentId} berhasil dihapus dari Cloud Firebase.`,
      time: "Baru saja",
      type: "payment",
      read: false,
      actionUrl: "finance",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Maintenance Handlers
  const handleAddTicket = async (newTicket: MaintenanceTicket) => {
    setMaintenanceTickets((prev) => [newTicket, ...prev]);
    await saveToCloud("maintenance", newTicket);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Tiket Perbaikan Baru",
      message: `Kamar ${newTicket.roomNumber}: ${newTicket.description}`,
      time: "Baru saja",
      type: "maintenance",
      read: false,
      actionUrl: "maintenance",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleUpdateTicket = async (updatedTicket: MaintenanceTicket) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    await saveToCloud("maintenance", updatedTicket);
  };

  // User Account Handlers
  const handleAddUser = async (newAccount: AuthAccount) => {
    setAccounts((prev) => {
      const exists = prev.some(
        (acc) => acc.email.toLowerCase() === newAccount.email.toLowerCase()
      );
      if (exists) {
        return prev.map((acc) =>
          acc.email.toLowerCase() === newAccount.email.toLowerCase() ? newAccount : acc
        );
      }
      return [newAccount, ...prev];
    });
    await saveToCloud("accounts", newAccount);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "User Login Ditambahkan",
      message: `Akun baru ${newAccount.profile.name} (${newAccount.profile.roleTitle}) berhasil didaftarkan ke Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "settings",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleUpdateUser = async (updatedAccount: AuthAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
    await saveToCloud("accounts", updatedAccount);

    // If updating current active user session, update state and persistent user profile
    if (
      user.id === updatedAccount.id ||
      user.email.toLowerCase() === updatedAccount.email.toLowerCase()
    ) {
      setUser(updatedAccount.profile);
      saveToStorage("user", updatedAccount.profile);
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Data User Diperbarui",
      message: `Data & kredensial akun ${updatedAccount.profile.name} berhasil diperbarui di Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "settings",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  const handleDeleteUser = async (accountId: string) => {
    const accToDelete = accounts.find((a) => a.id === accountId);
    if (!accToDelete) return;

    if (accToDelete.email.toLowerCase() === "gdeasbawaputra@gmail.com") {
      alert("Akun Super Administrator Utama tidak dapat dihapus!");
      return;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    await deleteFromCloud("accounts", accountId);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "User Login Dihapus",
      message: `Akun login ${accToDelete.profile.name} (${accToDelete.email}) telah dihapus dari Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "settings",
    };
    setNotifications((prev) => [notif, ...prev]);
    saveToCloud("notifications", notif);
  };

  // Notification actions
  const handleMarkAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (target) {
      const updated = { ...target, read: true };
      saveToCloud("notifications", updated);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      batchSaveToCloud("notifications", updated);
      return updated;
    });
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    await clearCloudCollection("notifications");
  };

  const handleLoginSuccess = (loggedInUser: UserProfile, _remember: boolean) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    saveToStorage("is_authenticated", true);
    saveToStorage("user", loggedInUser);

    const loginNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Login Berhasil",
      message: `Selamat datang kembali, ${loggedInUser.name} (${loggedInUser.roleTitle}). Terhubung ke Cloud Firebase.`,
      time: "Baru saja",
      type: "system",
      read: false,
      actionUrl: "dashboard",
    };
    saveToCloud("notifications", loginNotif);
    setNotifications((prev) => [loginNotif, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    saveToStorage("is_authenticated", false);
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        defaultEmail={user.email}
        accounts={accounts}
      />
    );
  }

  return (
    <div
      className={`h-screen w-full bg-[#f8f9fa] font-sans text-gray-800 flex flex-col overflow-hidden antialiased ${
        isMobilePreview ? "max-w-md mx-auto my-4 h-[92vh] shadow-2xl rounded-3xl border-8 border-slate-900 overflow-hidden" : ""
      }`}
    >
      {/* Top Main Navigation Header */}
      <Header
        user={user}
        setUserRole={handleSetUserRole}
        properties={properties}
        rooms={rooms}
        selectedPropertyId={selectedPropertyId}
        setSelectedPropertyId={setSelectedPropertyId}
        notifications={notifications}
        onOpenNotifications={() => setActiveTab("notifications")}
        isMobilePreview={isMobilePreview}
        setIsMobilePreview={setIsMobilePreview}
        onOpenProfile={() => setActiveTab("settings")}
        onLogout={handleLogout}
        cloudSyncStatus={cloudSyncStatus}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={user.role}
            unreadNotifications={notifications.filter((n) => !n.read).length}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Scrollable Viewport Container - Mobile Safe Padding pb-24 */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView
                user={user}
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                payments={payments}
                maintenanceTickets={maintenanceTickets}
                insights={insights}
                selectedPropertyId={selectedPropertyId}
                setActiveTab={setActiveTab}
                onOpenAddRoom={() => setActiveTab("rooms")}
                onOpenRecordPayment={() => setActiveTab("finance")}
                onOpenCreateTicket={() => setActiveTab("maintenance")}
              />
            )}

            {activeTab === "properties" && (
              <PropertyView
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                onAddProperty={handleAddProperty}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                onClearAllData={handleClearAllData}
                onResetMinimalData={handleResetMinimalData}
                selectedPropertyId={selectedPropertyId}
                setSelectedPropertyId={setSelectedPropertyId}
                onSelectPropertyToManage={(id) => {
                  setSelectedPropertyId(id);
                  setActiveTab("rooms");
                }}
              />
            )}

            {activeTab === "rooms" && (
              <RoomView
                rooms={rooms}
                properties={properties}
                tenants={tenants}
                selectedPropertyId={selectedPropertyId}
                onAddRoom={handleAddRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onSelectTenant={(tenantId) => {
                  setActiveTab("tenants");
                }}
              />
            )}

            {activeTab === "tenants" && (
              <TenantView
                tenants={tenants}
                rooms={rooms}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onAddTenant={handleAddTenant}
                onUpdateTenant={handleUpdateTenant}
                onDeleteTenant={handleDeleteTenant}
                onOpenContract={(tenantId) => {
                  const contract = contracts.find((c) => c.tenantId === tenantId);
                  if (contract) {
                    setActiveContractDoc(contract);
                  } else {
                    setActiveTab("contracts");
                  }
                }}
                onOpenPayment={(tenantId) => {
                  setActiveTab("finance");
                }}
              />
            )}

            {activeTab === "finance" && (
              <FinanceView
                payments={payments}
                tenants={tenants}
                properties={properties}
                rooms={rooms}
                selectedPropertyId={selectedPropertyId}
                onRecordPayment={handleRecordPayment}
                onUpdatePayment={handleUpdatePayment}
                onDeletePayment={handleDeletePayment}
                onViewReceipt={(p) => setActiveReceiptPayment(p)}
              />
            )}

            {activeTab === "reminders" && (
              <ReminderView
                tenants={tenants}
                payments={payments}
                contracts={contracts}
                selectedPropertyId={selectedPropertyId}
                onMarkPaymentPaid={(tenantId) => {
                  const pendingPay = payments.find((p) => p.tenantId === tenantId && p.status !== "paid");
                  if (pendingPay) {
                    handleRecordPayment({
                      ...pendingPay,
                      status: "paid",
                      paymentDate: new Date().toISOString().split("T")[0],
                    });
                  }
                }}
              />
            )}

            {activeTab === "maintenance" && (
              <MaintenanceView
                tickets={maintenanceTickets}
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                selectedPropertyId={selectedPropertyId}
                userRole={user.role}
                onAddTicket={handleAddTicket}
                onUpdateTicket={handleUpdateTicket}
              />
            )}

            {activeTab === "contracts" && (
              <ContractView
                contracts={contracts}
                tenants={tenants}
                rooms={rooms}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onViewContractDoc={(c) => setActiveContractDoc(c)}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsView
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                payments={payments}
                maintenanceTickets={maintenanceTickets}
                selectedPropertyId={selectedPropertyId}
              />
            )}

            {activeTab === "ai_assistant" && (
              <AiAssistantView
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                payments={payments}
                maintenanceTickets={maintenanceTickets}
                contracts={contracts}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationView
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearNotifications}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                user={user}
                setUserRole={handleSetUserRole}
                properties={properties}
                accounts={accounts}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onClearAllData={handleClearAllData}
                onResetMinimalData={handleResetMinimalData}
                onResetToFullUpdatedData={handleResetToFullUpdatedData}
                onForceSyncToCloud={handleForceSyncToCloud}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onLogout={handleLogout}
                cloudSyncStatus={cloudSyncStatus}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        user={user}
      />

      {/* Kwitansi / Struk Modal */}
      {activeReceiptPayment && (
        <ReceiptModal
          payment={activeReceiptPayment}
          properties={properties}
          onClose={() => setActiveReceiptPayment(null)}
        />
      )}

      {/* Dokumen Perjanjian Sewa / Kontrak Modal */}
      {activeContractDoc && (
        <ContractDocModal
          contract={activeContractDoc}
          properties={properties}
          rooms={rooms}
          tenants={tenants}
          onClose={() => setActiveContractDoc(null)}
        />
      )}
    </div>
  );
}

export default App;
