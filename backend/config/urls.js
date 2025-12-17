// backend/config/urls.js

const getApiBaseUrl = () => {
  // 1️⃣ Explicit API_URL (production or manual override)
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // 2️⃣ Render / Railway / Cloud providers
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // 3️⃣ Local development fallback
  return "http://localhost:4000";
};

const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  // Expo web default
  return "http://localhost:8081";
};

module.exports = {
  getApiBaseUrl,
  getFrontendUrl,
};
