import { supabase } from "../lib/supabase";

export interface VisitData {
  page_url: string;
  referrer?: string;
  user_agent?: string;
  user_id?: string | null;
  created_at?: string;
}

export interface ContactData {
  name: string;
  email: string;
  message?: string;
  user_id?: string | null;
  created_at?: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  totalContacts: number;
  totalCVDownloads: number;
  recentVisits: VisitData[];
  recentContacts: ContactData[];
  recentDownloads: { downloaded_at?: string; user_id?: string | null }[];
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function trackVisit(): Promise<void> {
  try {
    const user_id = await getCurrentUserId();
    await supabase.from("visits").insert({
      page_url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      user_id,
    });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
}

export async function trackContact(data: ContactData): Promise<void> {
  try {
    const user_id = await getCurrentUserId();
    await supabase.from("contacts").insert({
      name: data.name,
      email: data.email,
      message: data.message || null,
      user_id,
    });
  } catch (error) {
    console.error("Failed to track contact:", error);
  }
}

export async function trackCVDownload(): Promise<void> {
  try {
    const user_id = await getCurrentUserId();
    await supabase.from("cv_downloads").insert({
      downloaded_at: new Date().toISOString(),
      user_id,
    });
  } catch (error) {
    console.error("Failed to track CV download:", error);
  }
}

export async function getAnalytics(): Promise<AnalyticsStats> {
  try {
    const [
      { count: visitsCount, error: visitsError },
      { count: contactsCount, error: contactsError },
      { count: downloadsCount, error: downloadsError },
      { data: recentVisitsData, error: recentVisitsError },
      { data: recentContactsData, error: recentContactsError },
      { data: recentDownloadsData, error: recentDownloadsError },
    ] = await Promise.all([
      supabase.from("visits").select("id", { count: "exact" }),
      supabase.from("contacts").select("id", { count: "exact" }),
      supabase.from("cv_downloads").select("id", { count: "exact" }),
      supabase
        .from("visits")
        .select("page_url, referrer, user_agent, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("contacts")
        .select("name, email, message, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("cv_downloads")
        .select("downloaded_at, user_id")
        .order("downloaded_at", { ascending: false })
        .limit(10),
    ]);

    if (
      visitsError ||
      contactsError ||
      downloadsError ||
      recentVisitsError ||
      recentContactsError ||
      recentDownloadsError
    ) {
      console.error("Analytics errors:", {
        visitsError,
        contactsError,
        downloadsError,
        recentVisitsError,
        recentContactsError,
        recentDownloadsError,
      });
    }

    return {
      totalVisits: visitsCount || 0,
      totalContacts: contactsCount || 0,
      totalCVDownloads: downloadsCount || 0,
      recentVisits: recentVisitsData || [],
      recentContacts: recentContactsData || [],
      recentDownloads: recentDownloadsData || [],
    };
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return {
      totalVisits: 0,
      totalContacts: 0,
      totalCVDownloads: 0,
      recentVisits: [],
      recentContacts: [],
      recentDownloads: [],
    };
  }
}
