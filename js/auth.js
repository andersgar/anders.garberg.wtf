// Supabase Authentication
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://rsbdfrvcxwcaoqwdplys.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmRmcnZjeHdjYW9xd2RwbHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTYyOTAsImV4cCI6MjA3OTAzMjI5MH0.AEaYHvVU5h1kfBiTjYMTW6bvdlpvwutCb7LA_QSe9G4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if user is authenticated
async function isAuthenticated() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
}

// Login function
async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
}

// Logout function
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Logout error:", error);
}

// Get current user
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Handle login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const errorMessage = document.getElementById("errorMessage");

      const result = await login(email, password);

      if (result.success) {
        // Redirect to main page instead of admin dashboard
        window.location.href = "index.html";
      } else {
        errorMessage.textContent =
          result.error || "Ugyldig brukernavn eller passord";
        errorMessage.classList.add("show");
        document.getElementById("password").value = "";

        setTimeout(() => {
          errorMessage.classList.remove("show");
        }, 3000);
      }
    });
  }
});

// Export functions for use in other files
window.auth = {
  isAuthenticated,
  login,
  logout,
  getCurrentUser,
};
