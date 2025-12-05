import { supabase } from "../lib/supabase";

export interface VisitData {
  page_url: string;
  referrer?: string;
  user_agent?: string;
}

export interface ContactData {
  name: string;
  email: string;
  message?: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  totalContacts: number;
  totalCVDownloads: number;
  recentVisits: VisitData[];
}

export async function trackVisit(): Promise<void> {
  try {
    await supabase.from("visits").insert({
      page_url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
}

export async function trackContact(data: ContactData): Promise<void> {
  try {
    await supabase.from("contacts").insert({
      name: data.name,
      email: data.email,
      message: data.message || null,
    });
  } catch (error) {
    console.error("Failed to track contact:", error);
  }
}

export async function trackCVDownload(): Promise<void> {
  try {
    await supabase.from("cv_downloads").insert({
      downloaded_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to track CV download:", error);
  }
}

export async function getAnalytics(): Promise<AnalyticsStats> {
  try {
    const [visitsResult, contactsResult, downloadsResult, recentVisitsResult] =
      await Promise.all([
        supabase.from("visits").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase
          .from("cv_downloads")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("visits")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

    return {
      totalVisits: visitsResult.count || 0,
      totalContacts: contactsResult.count || 0,
      totalCVDownloads: downloadsResult.count || 0,
      recentVisits: recentVisitsResult.data || [],
    };
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return {
      totalVisits: 0,
      totalContacts: 0,
      totalCVDownloads: 0,
      recentVisits: [],
    };
  }
}
