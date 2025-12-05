import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsbdfrvcxwcaoqwdplys.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmRmcnZjeHdjYW9xd2RwbHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTYyOTAsImV4cCI6MjA3OTAzMjI5MH0.AEaYHvVU5h1kfBiTjYMTW6bvdlpvwutCb7LA_QSe9G4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
