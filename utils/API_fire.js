// utils/API_fire.js
// ============================================================
// FIRE DETECTION API CLIENT
// Kompatibel dengan api.py versi optimized (Fire Priority Override)
// ============================================================

const BACKEND_URL = "http://127.0.0.1:8000";

function initFireDetectionAPI(videoElement, onResult) {
  let intervalId = null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Interval deteksi (ms) - sesuaikan dengan performa
  const INTERVAL = 800;

  async function sendFrame() {
    if (!videoElement) return;
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const res = await fetch(`${BACKEND_URL}/detect`, {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          console.error("[DETECT] HTTP error:", res.status);
          return;
        }

        const data = await res.json();

        // ============================================================
        // RESPONSE STRUCTURE dari api.py:
        // {
        //   fire: boolean,           // true jika KEBAKARAN confirmed
        //   confidence: float,       // nilai confidence tertinggi
        //   detected_class: string,  // "Fire" | "Smoke" | null
        //   time: string,            // waktu deteksi
        //   user: object             // data user aktif
        // }
        // ============================================================

        console.log("[DETECT RESPONSE]", data);

        // Kirim data lengkap ke callback
        onResult({
          fire: data.fire === true,
          confidence: data.confidence || 0,
          detected_class: data.detected_class || null,  // Fire / Smoke / null
          telegram: data.telegram || null,
          time: data.time || "-",
          user: data.user || null
        });

      } catch (err) {
        console.error("[DETECT] fetch error:", err);
      }
    }, "image/jpeg", 0.7);
  }

  return {
    start() {
      if (intervalId) return;
      console.log("🔥 Fire detection loop started");
      intervalId = setInterval(sendFrame, INTERVAL);
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("🛑 Fire detection loop stopped");
      }
    }
  };
}
