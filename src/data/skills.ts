// Skill groups shown in the About section, mirrored from the CV. Used by the
// About component and by the build-time prerender, so the two never drift.
export interface LangText {
  no: string;
  en: string;
}

export interface SkillGroup {
  label: LangText;
  items: LangText[];
}

const same = (s: string): LangText => ({ no: s, en: s });

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: { no: "Språk og rammeverk", en: "Languages and frameworks" },
    items: [
      same("C++"),
      same("Qt 6"),
      same("Python"),
      same("MATLAB/Simulink"),
      { no: "PLS Structured Text", en: "PLC Structured Text" },
      same("TypeScript/React"),
    ],
  },
  {
    label: {
      no: "Robotikk, autonomi og regulering",
      en: "Robotics, autonomy and control",
    },
    items: [
      same("ROS 2"),
      same("NVIDIA Isaac Sim"),
      same("URDF/USD"),
      {
        no: "Ruteplanlegging og guidance (LOS)",
        en: "Route planning and guidance (LOS)",
      },
      { no: "Sensorintegrasjon", en: "Sensor integration" },
      { no: "Reguleringsteknikk", en: "Control engineering" },
      same("MPC"),
      { no: "Systemidentifikasjon", en: "System identification" },
      same("RViz"),
    ],
  },
  {
    label: { no: "Kommunikasjon og systemer", en: "Communication and systems" },
    items: [
      same("ZeroMQ"),
      same("GStreamer"),
      same("Tailscale/VPN"),
      { no: "Linux og systemd", en: "Linux and systemd" },
      same("NVIDIA Jetson"),
      same("Docker Compose"),
      { no: "Nettverk", en: "Networking" },
    ],
  },
  {
    label: { no: "Arbeidsmåte", en: "Ways of working" },
    items: [
      same("Git (GitHub/GitLab)"),
      same("Code review"),
      same("CI (GitHub Actions, GitLab CI)"),
      {
        no: "Smidig og testdrevet utvikling",
        en: "Agile and test-driven development",
      },
    ],
  },
];
