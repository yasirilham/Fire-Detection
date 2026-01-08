// dashboard-app.js - SIMPLIFIED
const BACKEND_URL = "http://127.0.0.1:8000";
const ALARM_THRESHOLD = 0.70;
const ALARM_INTERVAL = 30000;

async function sendControl(action, userId) {
  const res = await fetch(`${BACKEND_URL}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, user_id: userId })
  });
  return await res.json();
}

function DashboardApp() {
  const [user, setUser] = React.useState(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [detectionActive, setDetectionActive] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState("Siap");
  const [fireDetected, setFireDetected] = React.useState(false);
  const [detectedClass, setDetectedClass] = React.useState(null);
  const [lastConfidence, setLastConfidence] = React.useState(0);
  const [totalDetections, setTotalDetections] = React.useState(0);
  const [alerts, setAlerts] = React.useState([]);
  const [alarmPlaying, setAlarmPlaying] = React.useState(false);
  const [telegramReport, setTelegramReport] = React.useState(null);
  const [telegramStatus, setTelegramStatus] = React.useState(null);

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectionAPIRef = React.useRef(null);
  const alarmAudioRef = React.useRef(null);
  const lastAlarmTimeRef = React.useRef(0);
  const lastTelegramAlertRef = React.useRef(0);

  // Alarm
  const playAlarm = () => {
    const now = Date.now();
    if (now - lastAlarmTimeRef.current >= ALARM_INTERVAL && alarmAudioRef.current) {
      lastAlarmTimeRef.current = now;
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.play().catch(err => console.error(err));
      setAlarmPlaying(true);
    }
  };

  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    lastAlarmTimeRef.current = 0;
    setAlarmPlaying(false);
  };

  // Auth init
  React.useEffect(() => {
    async function init() {
      const u = await getCurrentUser();
      if (!u || !u.id) {
        window.location.href = "index.html";
        return;
      }
      setUser(u);

      try {
        const res = await fetch(`${BACKEND_URL}/telegram/status`, { cache: "no-store" });
        if (res.ok) setTelegramStatus(await res.json());
      } catch (e) {
        // Backend might be down; ignore.
      }
    }
    init();
    return () => stopCamera();
  }, []);

  // Camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    setCameraActive(true);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  // Detection
  const startDetection = async () => {
    if (!user?.id) return alert("User belum siap");
    if (!cameraActive) await startCamera();

    const ctrl = await sendControl("start", user.id);
    if (!ctrl.active) return alert("Backend gagal aktif");

    setDetectionActive(true);
    setApiStatus("Berjalan");

    detectionAPIRef.current = initFireDetectionAPI(videoRef.current, handleDetectionResult);
    detectionAPIRef.current.start();
  };

  const stopDetection = async () => {
    if (user) await sendControl("stop", user.id);
    if (detectionAPIRef.current) {
      detectionAPIRef.current.stop();
      detectionAPIRef.current = null;
    }
    stopAlarm();
    setDetectionActive(false);
    setApiStatus("Siap");
  };

  const stopAll = async () => {
    await stopDetection();
    stopCamera();
  };

  const shutdownBackend = async () => {
    try {
      await fetch(`${BACKEND_URL}/shutdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      // Backend may already be down; ignore.
      console.warn("[SHUTDOWN] backend request failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await stopAll();
    } catch (e) {
      console.warn("[LOGOUT] stopAll failed", e);
    }

    await shutdownBackend();
    logout();
  };

  // Handle detection result
  const handleDetectionResult = (result) => {
    setDetectedClass(result.detected_class);
    setLastConfidence(result.confidence || 0);

    if (result.telegram) {
      setTelegramReport(result.telegram);

      // Refresh status if backend reports telegram activity/skip.
      fetch(`${BACKEND_URL}/telegram/status`, { cache: "no-store" })
        .then(r => (r.ok ? r.json() : null))
        .then(j => {
          if (j) setTelegramStatus(j);
        })
        .catch(() => {});
    }

    // Tambah riwayat jika Telegram benar-benar terkirim (hindari spam)
    if (result.telegram && (result.telegram.status === "sent" || result.telegram.status === "partial")) {
      const now = Date.now();
      if (now - lastTelegramAlertRef.current >= 1000) {
        lastTelegramAlertRef.current = now;

        const nama = result.user?.name || "-";
        const lokasi = result.user?.location || "-";
        const jenis = result.detected_class === "Smoke" ? "asap" : "api";
        const persen = typeof result.confidence === "number" ? `${(result.confidence * 100).toFixed(0)}%` : "-";
        const msg = `pesan terkirim. ke : (${nama}) deteksi : (${jenis}), persen : ${persen}, alamat : ${lokasi}`;

        setAlerts(prev => [{
          id: now,
          type: "TELEGRAM",
          message: msg
        }, ...prev].slice(0, 5));
      }
    }

    if (result.fire) {
      setFireDetected(true);
      setTotalDetections(prev => prev + 1);

      // Alarm jika confidence tinggi
      if (result.confidence >= ALARM_THRESHOLD) {
        playAlarm();
        
        const emoji = result.detected_class === "Fire" ? "🔥" : "💨";
        const label = result.detected_class === "Fire" ? "API" : "ASAP";
        
        setAlerts(prev => [{
          id: Date.now(),
          type: result.detected_class,
          message: `${emoji} ${label} terdeteksi (${(result.confidence * 100).toFixed(0)}%)`
        }, ...prev].slice(0, 5));
      }
    } else {
      setFireDetected(false);
    }
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  // UI
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <audio ref={alarmAudioRef} src="assets/Alarm1.mp3" preload="auto" />
      
      <nav className="bg-gray-800 p-4 flex justify-between">
        <b>🔥 Fire Detection System</b>
        <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">
          Logout
        </button>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Panel */}
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded">
          <button
            onClick={detectionActive ? stopAll : startDetection}
            className={`px-6 py-2 rounded mb-4 font-bold ${detectionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {detectionActive ? "⏹ Stop Deteksi" : "▶ Mulai Deteksi"}
          </button>

          <div className="bg-black aspect-video rounded overflow-hidden">
            <video ref={videoRef} muted autoPlay playsInline className={cameraActive ? "w-full h-full object-cover" : "hidden"} />
            {!cameraActive && (
              <div className="flex items-center justify-center h-full text-gray-400">
                📹 Kamera belum aktif
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gray-800 p-4 rounded space-y-2">
          <h3 className="text-xl font-bold mb-4">Status Deteksi</h3>
          
          <div className="space-y-2 text-sm">
            <p>API: <b className="text-green-400">{apiStatus}</b></p>
            <p>Status: <b className={fireDetected ? "text-red-500" : "text-green-500"}>
              {fireDetected ? "🚨 TERDETEKSI" : "✅ Aman"}
            </b></p>
            <p>Jenis: <b className={detectedClass === "Fire" ? "text-orange-500" : detectedClass === "Smoke" ? "text-gray-400" : ""}>
              {detectedClass === "Fire" ? "🔥 Api" : detectedClass === "Smoke" ? "💨 Asap" : "-"}
            </b></p>
            <p>Confidence: <b>{lastConfidence > 0 ? `${(lastConfidence * 100).toFixed(0)}%` : "-"}</b></p>
            <p>Total: <b>{totalDetections}</b></p>
            <p>Alarm: <b className={alarmPlaying ? "text-yellow-500 animate-pulse" : "text-gray-500"}>
              {alarmPlaying ? "🔔 Aktif" : "🔕 Mati"}
            </b></p>
          </div>

          <div className="mt-4 p-3 bg-gray-700 rounded text-xs">
            <p className="font-bold mb-1">⚙️ Sistem:</p>
            <p>• Motion Detection: ON</p>
            <p>• Alarm Threshold: ≥70%</p>
            <p>
              • Telegram: {telegramStatus?.enabled === true ? "Aktif" : telegramStatus?.enabled === false ? "Nonaktif" : "-"}
              {typeof telegramStatus?.cooldown === "number" ? ` (${telegramStatus.cooldown}s cooldown)` : ""}
            </p>
          </div>

          {alarmPlaying && (
            <button 
              onClick={stopAlarm}
              className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-bold"
            >
              🔕 Matikan Alarm
            </button>
          )}

          <hr className="my-4 border-gray-600" />

          <div>
            <b className="text-sm">📋 Riwayat Alert</b>
            {telegramReport?.status === "sent" && (
              <p className="text-xs text-green-400 mt-1">Telegram: pesan terkirim</p>
            )}
            {telegramReport?.status === "partial" && (
              <p className="text-xs text-yellow-400 mt-1">Telegram: terkirim sebagian</p>
            )}
            {telegramReport?.status === "cooldown" && (
              <p className="text-xs text-gray-400 mt-1">Telegram: cooldown</p>
            )}
            {telegramReport?.status === "disabled" && (
              <p className="text-xs text-gray-400 mt-1">Telegram: nonaktif</p>
            )}
            {telegramReport?.status === "error" && (
              <p className="text-xs text-red-400 mt-1">Telegram: gagal mengirim</p>
            )}
            {alerts.length === 0 && <p className="text-gray-500 text-xs mt-2">Belum ada alert</p>}
            {alerts.map(a => (
              <div key={a.id} className={`text-xs py-1 mt-1 ${a.type === "Fire" ? "text-orange-400" : a.type === "Smoke" ? "text-gray-400" : "text-green-400"}`}>
                {a.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardApp />);
