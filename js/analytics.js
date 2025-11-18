// Analytics tracking with Supabase backend
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Get Supabase client from auth.js or create new one
let supabase;
try {
  // Try to import from auth.js config
  const SUPABASE_URL = "https://rsbdfrvcxwcaoqwdplys.supabase.co"; // Replace with your URL
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmRmcnZjeHdjYW9xd2RwbHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTYyOTAsImV4cCI6MjA3OTAzMjI5MH0.AEaYHvVU5h1kfBiTjYMTW6bvdlpvwutCb7LA_QSe9G4"; // Replace with your key
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error("Failed to initialize Supabase:", e);
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

// Track page visit
async function trackVisit() {
  if (!supabase) return;

  const sessionId = getSessionId();

  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: "page_visit",
      session_id: sessionId,
      page: window.location.pathname,
      user_agent: navigator.userAgent,
    });

    if (error) console.error("Error tracking visit:", error);
  } catch (e) {
    console.error("Failed to track visit:", e);
  }
}

// Track contact form submission
async function trackContact() {
  if (!supabase) return;

  const sessionId = getSessionId();

  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: "contact_form",
      session_id: sessionId,
      page: window.location.pathname,
      user_agent: navigator.userAgent,
    });

    if (error) console.error("Error tracking contact:", error);
  } catch (e) {
    console.error("Failed to track contact:", e);
  }
}

// Track CV download
async function trackCVDownload() {
  if (!supabase) return;

  const sessionId = getSessionId();

  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: "cv_download",
      session_id: sessionId,
      page: window.location.pathname,
      user_agent: navigator.userAgent,
    });

    if (error) console.error("Error tracking CV download:", error);
  } catch (e) {
    console.error("Failed to track CV download:", e);
  }
}

// Get analytics data for admin dashboard
async function getAnalytics() {
  if (!supabase) {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      contacts: 0,
      cvDownloads: 0,
      lastVisit: null,
      recentVisits: [],
    };
  }

  try {
    // Get all events
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate stats
    const pageVisits = events.filter((e) => e.event_type === "page_visit");
    const contacts = events.filter((e) => e.event_type === "contact_form");
    const cvDownloads = events.filter((e) => e.event_type === "cv_download");

    // Count unique visitors (unique session_ids)
    const uniqueSessions = new Set(events.map((e) => e.session_id));

    // Get recent visits (last 10)
    const recentVisits = pageVisits.slice(0, 10).map((visit) => ({
      timestamp: visit.created_at,
      page: visit.page,
    }));

    // Get last visit time
    const lastVisit = pageVisits.length > 0 ? pageVisits[0].created_at : null;

    return {
      totalVisits: pageVisits.length,
      uniqueVisitors: uniqueSessions.size,
      contacts: contacts.length,
      cvDownloads: cvDownloads.length,
      lastVisit,
      recentVisits,
    };
  } catch (e) {
    console.error("Failed to get analytics:", e);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      contacts: 0,
      cvDownloads: 0,
      lastVisit: null,
      recentVisits: [],
    };
  }
}

// Export functions
window.analytics = {
  trackVisit,
  trackContact,
  trackCVDownload,
  getAnalytics,
};
