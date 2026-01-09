// utils/auth.js
// ==========================================
// AUTH HELPER (SESSION-BASED, PHP ONLY)
// ==========================================

const AUTH_API = {
  CHECK: "backend_web/check_session.php",
  LOGOUT: "backend_web/logout.php"
};

/**
 * Ambil user yang sedang login dari PHP Session
 * @returns {Promise<object|null>}
 */
async function getCurrentUser() {
  try {
    const response = await fetch(AUTH_API.CHECK, {
      method: "GET",
      credentials: "include" // 🔥 WAJIB agar session terbaca
    });

    if (!response.ok) {
      console.error("Session check failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.logged_in === true && data.user) {
      return data.user; // { id, name, location }
    }

    return null;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/**
 * Logout user (destroy PHP session)
 */
function logout() {
  fetch(AUTH_API.LOGOUT, {
    method: "POST",
    credentials: "include"
  })
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Logout error:", err);
      window.location.href = "index.html";
    });
}
