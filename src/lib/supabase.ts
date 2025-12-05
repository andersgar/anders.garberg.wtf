import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsbdfrvcxwcaoqwdplys.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmRmcnZjeHdjYW9xd2RwbHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjA3NzEsImV4cCI6MjA1ODMzNjc3MX0.SrLnZMhUvK1L_4kvQdEDv4_1fHYfUGmP_MVNL5hKBOs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
