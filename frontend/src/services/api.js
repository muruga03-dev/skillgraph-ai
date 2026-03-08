// ─── SkillGraph AI — Central API Configuration ────────────────────────────────
// Automatically uses the deployed backend URL in production,
// and the local proxy (localhost:5000) in development.

const BASE_URL = process.env.REACT_APP_API_URL || "";

/**
 * Returns the full API URL for a given path.
 * Usage: apiURL("/api/auth/login")  →  "https://skillgraph-backend.onrender.com/api/auth/login"
 */
export const apiURL = (path) => `${BASE_URL}${path}`;

/**
 * Pre-configured fetch wrapper with JSON headers + auth token.
 * Usage: apiFetch("/api/auth/me")
 */
export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("sg_token");

  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(apiURL(path), { ...options, headers });
  return res;
};

export default apiURL;
