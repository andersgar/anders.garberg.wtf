// Predefined app library for homelab services
export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // Path to logo or FontAwesome class for custom
  color: string;
  description: string;
  defaultPort?: number;
  isCustom?: boolean;
  requiresUrl?: boolean;
  featured?: boolean; // Shown before homelab apps in the picker
  category?: "ntnu" | "homelab";
  defaultUrl?: string;
}

export interface UserApp {
  id: string; // Unique ID for this user's app instance
  appId: string; // References AppDefinition.id or 'custom'
  url: string;
  customName?: string; // Only for custom apps
  customIcon?: string; // Only for custom apps (FontAwesome class)
  visible: boolean;
  order: number;
}

// Predefined apps library
export const APP_LIBRARY: AppDefinition[] = [
  {
    id: "qr_app",
    name: "QR Generator",
    icon: "fa-solid fa-qrcode",
    color: "var(--brand)",
    description: "Create QR codes for links and text",
    featured: true,
    requiresUrl: false,
  },
  {
    id: "info_screens",
    name: "Informize",
    icon: "/assets/apps/informize.svg",
    color: "#FF8C1A",
    description: "Information screen creator and manager",
    featured: true,
    requiresUrl: false,
    defaultUrl: "https://screens.garberg.wtf",
  },
  {
    id: "blackboard",
    name: "Blackboard",
    icon: "fa-solid fa-book-open-reader",
    color: "#0ea5e9",
    description: "NTNU Blackboard portal",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl: "https://innsida.ntnu.no/blackboard",
  },
  {
    id: "onedrive_ntnu",
    name: "Onedrive",
    icon: "fa-solid fa-cloud",
    color: "#2563eb",
    description: "NTNU OneDrive",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl: "https://m365.cloud.microsoft/onedrive/",
  },
  {
    id: "studentweb",
    name: "Studentweb",
    icon: "fa-solid fa-graduation-cap",
    color: "#7c3aed",
    description: "Course registration & exams",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl: "https://www.ntnu.no/studentweb",
  },
  {
    id: "remnote",
    name: "Remnote",
    icon: "fa-solid fa-brain",
    color: "#10b981",
    description: "Notes and spaced repetition",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl: "https://www.remnote.com/",
  },
  {
    id: "inspera",
    name: "Inspera",
    icon: "fa-solid fa-pen-to-square",
    color: "#f59e0b",
    description: "Digital exams",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl: "https://ntnu.inspera.no/",
  },
  {
    id: "tp-timeplan",
    name: "TP Timeplan",
    icon: "fa-solid fa-calendar-days",
    color: "#3b82f6",
    description: "Course schedules",
    category: "ntnu",
    requiresUrl: false,
    defaultUrl:
      "https://tp.uio.no/ntnu/timeplan/timeplan.php?type=courseact",
  },
  {
    id: "homeassistant",
    name: "Home Assistant",
    icon: "/assets/apps/homeassistant.svg",
    color: "#41BDF5",
    description: "Open source home automation",
    defaultPort: 8123,
  },
  {
    id: "jellyfin",
    name: "Jellyfin",
    icon: "/assets/apps/jellyfin.svg",
    color: "#00A4DC",
    description: "Free software media system",
    defaultPort: 8096,
  },
  {
    id: "jellyseerr",
    name: "Jellyseerr",
    icon: "/assets/apps/jellyseerr.svg",
    color: "#805EED",
    description: "Media request manager for Jellyfin",
    defaultPort: 5055,
  },
  {
    id: "plex",
    name: "Plex",
    icon: "/assets/apps/plex.svg",
    color: "#E5A00D",
    description: "Stream movies & TV",
    defaultPort: 32400,
  },
  {
    id: "radarr",
    name: "Radarr",
    icon: "/assets/apps/radarr.svg",
    color: "#FFC230",
    description: "Movie collection manager",
    defaultPort: 7878,
  },
  {
    id: "sonarr",
    name: "Sonarr",
    icon: "/assets/apps/sonarr.svg",
    color: "#2EBBF0",
    description: "TV series collection manager",
    defaultPort: 8989,
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    icon: "/assets/apps/qbittorrent.svg",
    color: "#2E7DC5",
    description: "BitTorrent client",
    defaultPort: 8080,
  },
  {
    id: "prowlarr",
    name: "Prowlarr",
    icon: "/assets/apps/prowlarr.svg",
    color: "#C79553",
    description: "Indexer manager for *arr apps",
    defaultPort: 9696,
  },
  {
    id: "overseerr",
    name: "Overseerr",
    icon: "/assets/apps/overseerr.svg",
    color: "#805EED",
    description: "Media request manager for Plex",
    defaultPort: 5055,
  },
  {
    id: "portainer",
    name: "Portainer",
    icon: "/assets/apps/portainer.svg",
    color: "#13BEF9",
    description: "Container management",
    defaultPort: 9000,
  },
  {
    id: "proxmox",
    name: "Proxmox",
    icon: "/assets/apps/proxmox.svg",
    color: "#E57000",
    description: "Virtualization platform",
    defaultPort: 8006,
  },
  {
    id: "pihole",
    name: "Pi-hole",
    icon: "/assets/apps/pihole.svg",
    color: "#F60D1A",
    description: "Network-wide ad blocking",
    defaultPort: 80,
  },
  {
    id: "adguard",
    name: "AdGuard Home",
    icon: "/assets/apps/adguard.svg",
    color: "#68BC71",
    description: "Network-wide ad blocking",
    defaultPort: 3000,
  },
  {
    id: "nextcloud",
    name: "Nextcloud",
    icon: "/assets/apps/nextcloud.svg",
    color: "#0082C9",
    description: "Self-hosted cloud storage",
    defaultPort: 443,
  },
  {
    id: "syncthing",
    name: "Syncthing",
    icon: "/assets/apps/syncthing.svg",
    color: "#0891D1",
    description: "Continuous file synchronization",
    defaultPort: 8384,
  },
  {
    id: "custom",
    name: "Custom Link",
    icon: "fa-solid fa-link",
    color: "var(--brand)",
    description: "Add a custom link to any service",
    isCustom: true,
  },
];

// Get app definition by ID
export function getAppById(id: string): AppDefinition | undefined {
  return APP_LIBRARY.find((app) => app.id === id);
}

// Validate URL format (supports IP:port, domain, localhost)
export function validateUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;

  // Add protocol if missing for validation
  let urlToValidate = url.trim();
  if (
    !urlToValidate.startsWith("http://") &&
    !urlToValidate.startsWith("https://")
  ) {
    urlToValidate = "http://" + urlToValidate;
  }

  try {
    const parsed = new URL(urlToValidate);
    // Must have a valid hostname
    return parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

// Format URL for display (without protocol)
export function formatUrlForDisplay(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

// Ensure URL has protocol
export function ensureProtocol(url: string): string {
  if (!url) return url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "http://" + url;
  }
  return url;
}

// Generate unique app instance ID
export function generateAppId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
