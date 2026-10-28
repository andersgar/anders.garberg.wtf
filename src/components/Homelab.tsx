import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

// The homelab dashboard (Homepage on bbot), published with `tailscale serve`: it only answers devices on the
// tailnet. The browser loads it straight from bbot, so nothing passes through this site's hosting.
const HOMELAB_URL = "https://bbot.mulley-smoot.ts.net:8443";

type Status = "checking" | "online" | "offline" | "blocked";

// Chrome and Edge ask before a public site may reach the local network, and Tailscale addresses count as local.
// Browsers without this permission (Firefox, Safari) don't block it, so undefined means "not an obstacle".
async function localNetworkPermission(): Promise<PermissionState | undefined> {
  try {
    const status = await navigator.permissions.query({
      name: "local-network-access" as PermissionName,
    });
    return status.state;
  } catch {
    return undefined;
  }
}

export function Homelab() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("checking");
  const [height, setHeight] = useState<number>();

  // Off the tailnet the name doesn't resolve and the request fails; any answer at all means we're on it.
  // While the browser's local-network question is open the request waits for the answer, so no time limit then.
  useEffect(() => {
    const controller = new AbortController();
    let timeout: number | undefined;
    (async () => {
      if ((await localNetworkPermission()) !== "prompt") {
        timeout = window.setTimeout(() => controller.abort(), 4000);
      }
      try {
        await fetch(`${HOMELAB_URL}/api/healthcheck`, {
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
        setStatus("online");
      } catch {
        setStatus((await localNetworkPermission()) === "denied" ? "blocked" : "offline");
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // The dashboard posts its height (custom.js on bbot), so the frame fits it instead of scrolling inside.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== HOMELAB_URL || event.data?.type !== "homelab-height") return;
      setHeight(Math.ceil(Number(event.data.height)));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const note = {
    checking: t("loading"),
    offline: t("homelabTailnetOnly"),
    blocked: t("homelabBlocked"),
  };

  return (
    <section className="dashboard-section" id="apps">
      <h2>{t("homelab")}</h2>
      {status === "online" ? (
        <iframe
          className="homelab-frame"
          src={HOMELAB_URL}
          title={t("homelab")}
          referrerPolicy="no-referrer"
          style={height ? { height } : undefined}
        />
      ) : (
        <p className="homelab-note">{note[status]}</p>
      )}
    </section>
  );
}
