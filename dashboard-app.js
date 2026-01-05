// dashboard-app.js
const BACKEND_URL = "http://127.0.0.1:8000";

// ===============================
// THRESHOLD UNTUK ALARM & NOTIFIKASI
// ===============================
const ALARM_THRESHOLD_FIRE = 0.70;   // Fire harus >= 70% untuk alarm
const ALARM_THRESHOLD_SMOKE = 0.60;  // Smoke harus >= 60% untuk alarm
const ALARM_INTERVAL = 30000;        // Alarm berbunyi setiap 30 detik

async function sendControl(action, userId) {
  console.log("[CONTROL] sending:", action, "user_id:", userId);

  const res = await fetch(`${BACKEND_URL}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      user_id: userId
    })
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

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectionAPIRef = React.useRef(null);
  const alarmAudioRef = React.useRef(null);
  const lastAlarmTimeRef = React.useRef(0);

  // ===============================
  // ALARM FUNCTIONS
  // ===============================
  const playAlarmOnce = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.loop = false;
      alarmAudioRef.current.play()
        .catch(err => console.error("Error playing alarm:", err));
    }
  };

  const playAlarm = () => {
    const now = Date.now();
    
    // Cek apakah sudah 30 detik sejak alarm terakhir
    if (now - lastAlarmTimeRef.current >= ALARM_INTERVAL) {
      lastAlarmTimeRef.current = now;
      playAlarmOnce();
      setAlarmPlaying(true);
      console.log("🔊 Alarm berbunyi!");
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

  // ===============================
  // AUTH INIT (PENTING)
  // ===============================
  React.useEffect(() => {
    async function init() {
      console.log("[AUTH] checking session...");
      const u = await getCurrentUser();
      console.log("[AUTH] session result:", u);

      if (!u || !u.id) {
        window.location.href = "index.html";
        return;
      }

      setUser(u);
    }
    init();

    return () => stopCamera();
  }, []);

  // ===============================
  // CAMERA
  // ===============================
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    stopDetection();
  };

  // ===============================
  // DETECTION
  // ===============================
  const startDetection = async () => {
    console.log("[START DETECTION] user:", user);

    if (!user || !user.id) {
      alert("User belum siap");
      return;
    }

    if (!cameraActive) {
      await startCamera();
    }

    const ctrl = await sendControl("start", user.id);
    console.log("[CONTROL RESPONSE]", ctrl);

    if (!ctrl.active) {
      alert("Backend gagal aktif");
      return;
    }

    setDetectionActive(true);
    setApiStatus("Berjalan");

    detectionAPIRef.current = initFireDetectionAPI(
      videoRef.current,
      handleDetectionResult
    );

    detectionAPIRef.current.start();
  };

  const stopDetection = async () => {
    if (user) await sendControl("stop", user.id);

    if (detectionAPIRef.current) {
      detectionAPIRef.current.stop();
      detectionAPIRef.current = null;
    }

    // Stop alarm ketika deteksi dihentikan
    stopAlarm();

    setDetectionActive(false);
    setApiStatus("Siap");
  };

  // ===============================
  // HANDLE RESULT
  // ===============================
  const handleDetectionResult = (result) => {
    console.log("DETECTION RESULT:", result);

    // Update state untuk display
    setDetectedClass(result.detected_class);
    setLastConfidence(result.confidence || 0);

    if (result.fire === true) {
      // Api/Asap terdeteksi (sudah melewati stabilization)
      setFireDetected(true);
      setTotalDetections(prev => prev + 1);

      // Cek apakah confidence cukup tinggi untuk alarm & notifikasi
      const isFireHighConfidence = result.detected_class === "Fire" && result.confidence >= ALARM_THRESHOLD_FIRE;
      const isSmokeHighConfidence = result.detected_class === "Smoke" && result.confidence >= ALARM_THRESHOLD_SMOKE;
      const shouldTriggerAlarm = isFireHighConfidence || isSmokeHighConfidence;

      if (shouldTriggerAlarm) {
        // 🔊 PLAY ALARM hanya jika confidence tinggi
        playAlarm();

        // Tentukan emoji dan label
        const emoji = result.detected_class === "Fire" ? "🔥" : "💨";
        const label = result.detected_class === "Fire" ? "API" : "ASAP";

        setAlerts(prev => [
          {
            id: Date.now(),
            type: result.detected_class,
            message: `${emoji} KEBAKARAN - ${label} terdeteksi (${(result.confidence * 100).toFixed(0)}%) - ALARM AKTIF!`
          },
          ...prev
        ].slice(0, 5));
      } else {
        // Deteksi tapi confidence rendah - tidak ada alarm/notifikasi
        console.log(`[LOW CONFIDENCE] ${result.detected_class} detected at ${(result.confidence * 100).toFixed(0)}% - No alarm triggered`);
      }
    } else {
      setFireDetected(false);
    }
  };


  if (!user) {
    return <div className="text-white p-10">Loading user...</div>;
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hidden Audio Element untuk Alarm */}
      <audio ref={alarmAudioRef} src="assets/alarm.mp3" preload="auto" />
      
      <nav className="bg-gray-800 p-4 flex justify-between">
        <b>🔥 Fire Detection</b>
        <button onClick={logout} className="bg-red-600 px-4 py-1 rounded">
          Logout
        </button>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded">
          <button
            onClick={detectionActive ? stopDetection : startDetection}
            className="bg-red-600 px-4 py-2 rounded mb-4"
          >
            {detectionActive ? "Stop Deteksi" : "Mulai Deteksi"}
          </button>

          <div className="bg-black aspect-video rounded overflow-hidden">
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              className={cameraActive ? "w-full h-full object-cover" : "hidden"}
            />
            {!cameraActive && (
              <div className="flex items-center justify-center h-full text-gray-400">
                Kamera belum aktif
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p>Status API: <b>{apiStatus}</b></p>
          <p>Status: <b className={fireDetected ? "text-red-500" : "text-green-500"}>
            {fireDetected ? "🚨 TERDETEKSI" : "✅ Aman"}
          </b></p>
          <p>Jenis: <b className={detectedClass === "Fire" ? "text-orange-500" : detectedClass === "Smoke" ? "text-gray-400" : ""}>
            {detectedClass === "Fire" ? "🔥 Api" : detectedClass === "Smoke" ? "💨 Asap" : "-"}
          </b></p>
          <p>Confidence: <b>{lastConfidence > 0 ? `${(lastConfidence * 100).toFixed(0)}%` : "-"}</b></p>
          <p>Total Deteksi: <b>{totalDetections}</b></p>
          <p>Alarm: <b className={alarmPlaying ? "text-yellow-500" : "text-gray-500"}>
            {alarmPlaying ? "🔔 Aktif (30 detik)" : "🔕 Mati"}
          </b></p>

          {/* Info Threshold */}
          <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
            <p>⚠️ Alarm aktif jika:</p>
            <p>• Fire ≥ 70%</p>
            <p>• Smoke ≥ 60%</p>
          </div>

          {/* Tombol Stop Alarm */}
          {alarmPlaying && (
            <button 
              onClick={stopAlarm}
              className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-bold animate-pulse"
            >
              🔕 Matikan Alarm
            </button>
          )}

          <hr className="my-2 border-gray-600" />

          <b>Riwayat Alert (High Confidence)</b>
          {alerts.length === 0 && (
            <p className="text-gray-500 text-sm">Belum ada alert</p>
          )}
          {alerts.map(a => (
            <div 
              key={a.id} 
              className={`text-sm py-1 ${a.type === "Fire" ? "text-orange-400" : "text-gray-400"}`}
            >
              {a.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<DashboardApp />);
