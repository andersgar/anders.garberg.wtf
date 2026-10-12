import type { ComponentType } from "react";
import {
  AppWindow,
  Bell,
  Book,
  BookOpen,
  Brain,
  CalendarBlank,
  Camera,
  ChartLine,
  CircleNotch,
  Cloud,
  Code,
  Database,
  DownloadSimple,
  EnvelopeSimple,
  FilmStrip,
  Folder,
  GameController,
  Globe,
  GraduationCap,
  Graph,
  HardDrives,
  Heart,
  House,
  Image,
  Key,
  Lightbulb,
  Link,
  Lock,
  MusicNotes,
  PencilSimpleLine,
  Printer,
  QrCode,
  Robot,
  Shield,
  Star,
  Television,
  Terminal,
  VideoCamera,
  WifiHigh,
  type IconProps,
} from "@phosphor-icons/react";

/**
 * App icons are stored as Font Awesome class strings ("fa-solid fa-qrcode"),
 * both in the app library and in users' profiles, so the data cannot change.
 * This maps the glyph name to the Phosphor equivalent at render time.
 */
const FA_TO_PHOSPHOR: Record<string, ComponentType<IconProps>> = {
  qrcode: QrCode,
  "book-open-reader": BookOpen,
  book: Book,
  cloud: Cloud,
  "graduation-cap": GraduationCap,
  brain: Brain,
  "pen-to-square": PencilSimpleLine,
  "calendar-days": CalendarBlank,
  calendar: CalendarBlank,
  link: Link,
  house: House,
  home: House,
  server: HardDrives,
  film: FilmStrip,
  music: MusicNotes,
  camera: Camera,
  tv: Television,
  gamepad: GameController,
  code: Code,
  terminal: Terminal,
  globe: Globe,
  envelope: EnvelopeSimple,
  folder: Folder,
  database: Database,
  "network-wired": Graph,
  shield: Shield,
  lock: Lock,
  key: Key,
  bell: Bell,
  "chart-line": ChartLine,
  video: VideoCamera,
  image: Image,
  download: DownloadSimple,
  star: Star,
  heart: Heart,
  lightbulb: Lightbulb,
  wifi: WifiHigh,
  print: Printer,
  robot: Robot,
};

function iconFromFaClass(value: string): ComponentType<IconProps> {
  const glyph = value
    .split(/\s+/)
    .map((c) => c.replace(/^fa-/, ""))
    .find((c) => c && !["solid", "regular", "brands", "light", "fa"].includes(c));
  return (glyph && FA_TO_PHOSPHOR[glyph]) || AppWindow;
}

interface AppIconProps extends IconProps {
  /** Image path ("/assets/…", "http…") or a Font Awesome class string. */
  icon: string;
  alt?: string;
}

/** Renders an app's icon: an image when the value is a path, otherwise the
 *  Phosphor glyph mapped from the stored Font Awesome class. */
export function AppIcon({ icon, alt = "", ...rest }: AppIconProps) {
  if (icon.startsWith("/") || icon.startsWith("http")) {
    return <img src={icon} alt={alt} />;
  }
  const Icon = iconFromFaClass(icon);
  return <Icon aria-hidden="true" {...rest} />;
}

/** Loading indicator: a rotating arc, still under reduced motion. */
export function Spinner({ size = 18, ...rest }: IconProps) {
  return (
    <CircleNotch
      className="spin"
      size={size}
      aria-label="Loading"
      role="img"
      {...rest}
    />
  );
}
