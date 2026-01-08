# 🔥 Perubahan Sistem - Simplified & Motion Detection

## 📊 Hasil Simplifikasi

### Sebelum:
- **backend/api.py**: ~408 baris (verbose, banyak komentar panjang)
- **dashboard-app.js**: ~317 baris (kode bertele-tele)

### Setelah:
- **backend/api.py**: **270 baris** (↓ 33% lebih ringkas)
- **dashboard-app.js**: **226 baris** (↓ 29% lebih simple)

---

## ✨ Fitur Baru: MOTION DETECTION

### Masalah:
❌ Sistem mendeteksi **tembok putih/objek statis** sebagai asap (false positive)

### Solusi:
✅ Menambahkan **motion detection** untuk filter objek yang tidak bergerak

### Cara Kerja:
```python
def has_motion(frame, prev_frame):
    """Deteksi gerakan untuk filter objek statis"""
    if prev_frame is None:
        return True
    
    # Bandingkan frame saat ini dengan frame sebelumnya
    gray1 = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gray1, gray2)
    motion_pixels = np.sum(diff > 30)
    
    # Minimal 500 pixel berubah untuk dianggap ada gerakan
    return motion_pixels > MOTION_THRESHOLD
```

**Logika:**
- **Asap asli**: Selalu bergerak → **LOLOS** ✅
- **Tembok putih**: Tidak bergerak → **DITOLAK** ❌
- **Objek statis lain**: Tidak bergerak → **DITOLAK** ❌

---

## 🎯 Peningkatan Threshold (Anti False Positive)

### Confidence Threshold:
| Parameter | Sebelum | Setelah | Perubahan |
|-----------|---------|---------|-----------|
| Fire Detection | 65% | 65% | - |
| Smoke Detection | 70% | **75%** | ↑ 5% |
| Fire Notify | 70% | 70% | - |
| Smoke Notify | 60% | **70%** | ↑ 10% |

### Area Threshold:
| Parameter | Sebelum | Setelah | Perubahan |
|-----------|---------|---------|-----------|
| Fire Minimal Area | 3000px² | 3000px² | - |
| Smoke Minimal Area | 4500px² | **6500px²** | ↑ 44% |

### Frame Stabilization:
| Parameter | Sebelum | Setelah | Perubahan |
|-----------|---------|---------|-----------|
| Fire Frames | 4 | 4 | - |
| Smoke Frames | 6 | **9** | ↑ 50% |

### CLAHE Processing:
| Parameter | Sebelum | Setelah | Perubahan |
|-----------|---------|---------|-----------|
| clipLimit | 2.0 | **1.5** | ↓ 25% |

---

## 🔧 Simplifikasi Kode

### Backend (api.py):

**SEBELUM:**
```python
# ============================================================
# A1. THRESHOLD CONFIDENCE (TUNED)
# ============================================================
# 🔥 Fire: threshold lebih tinggi untuk mengurangi false positive
# 💨 Smoke: threshold lebih tinggi untuk mengurangi false positive
CONF_FIRE  = 0.65   # 🔥 api butuh keyakinan lebih tinggi
CONF_SMOKE = 0.70   # 💨 asap butuh keyakinan lebih tinggi
```

**SETELAH:**
```python
# Threshold (simple & clear)
CONF_FIRE = 0.65
CONF_SMOKE = 0.75
NOTIFY_FIRE = 0.70
NOTIFY_SMOKE = 0.70
```

### Helper Functions (Modular):

```python
def has_motion(frame, prev_frame):
    """Motion detection"""
    
def preprocess_frame(frame, for_smoke=False):
    """Frame preprocessing"""
    
def extract_candidates(results, target_class, conf_threshold, area_threshold):
    """Extract valid YOLO candidates"""
```

**Benefit:**
- ✅ Kode lebih modular & reusable
- ✅ Mudah di-test & debug
- ✅ Tidak ada duplikasi kode

---

## 🎨 Frontend Simplification

### Dashboard (dashboard-app.js):

**SEBELUM:**
- Komentar panjang dan verbose
- Fungsi terlalu detail
- Threshold Fire & Smoke terpisah

**SETELAH:**
- Clean & concise
- Single alarm threshold (70%)
- Fungsi lebih compact

**Contoh:**
```javascript
// SEBELUM (verbose)
const ALARM_THRESHOLD_FIRE = 0.70;
const ALARM_THRESHOLD_SMOKE = 0.60;

const playAlarmOnce = () => {
  if (alarmAudioRef.current) {
    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current.loop = false;
    alarmAudioRef.current.play().catch(err => console.error("Error playing alarm:", err));
  }
};

const playAlarm = () => {
  const now = Date.now();
  if (now - lastAlarmTimeRef.current >= ALARM_INTERVAL) {
    lastAlarmTimeRef.current = now;
    playAlarmOnce();
    setAlarmPlaying(true);
    console.log("🔊 Alarm berbunyi!");
  }
};

// SETELAH (simple)
const ALARM_THRESHOLD = 0.70;

const playAlarm = () => {
  const now = Date.now();
  if (now - lastAlarmTimeRef.current >= ALARM_INTERVAL && alarmAudioRef.current) {
    lastAlarmTimeRef.current = now;
    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current.play().catch(err => console.error(err));
    setAlarmPlaying(true);
  }
};
```

---

## 🚀 Cara Menggunakan

### 1. Restart Backend
```bash
# Stop backend yang sedang berjalan (Ctrl+C)
# Lalu jalankan lagi:
cd c:/laragon/www/firedetec/backend
python api.py
```

### 2. Refresh Frontend
- Buka browser
- Tekan `Ctrl + Shift + R` (hard refresh)
- Login dan mulai deteksi

---

## ✅ Hasil yang Diharapkan

### False Positive Berkurang:
| Skenario | Sebelum | Setelah |
|----------|---------|---------|
| Tembok putih terdeteksi | ❌ Ya | ✅ Tidak |
| Objek statis terdeteksi | ❌ Ya | ✅ Tidak |
| Asap asli terdeteksi | ✅ Ya | ✅ Ya |
| Api asli terdeteksi | ✅ Ya | ✅ Ya |

### Performa Sistem:
- ✅ **Lebih cepat**: Skip frame tanpa gerakan
- ✅ **Lebih akurat**: Motion detection + threshold tinggi
- ✅ **Lebih stabil**: Frame threshold lebih ketat untuk Smoke
- ✅ **Kode lebih bersih**: 30% lebih ringkas, mudah maintain

---

## 📝 Catatan Penting

### Motion Detection:
- **Threshold**: 500 pixel berubah
- **Fungsi**: Filter objek statis seperti tembok, furniture, dll
- **Trade-off**: Kamera harus relatif stabil (tidak goyang berlebihan)

### Jika Masih Ada False Positive:
Tingkatkan parameter ini di `backend/api.py`:

```python
CONF_SMOKE = 0.78          # Naikkan ke 78-80%
MIN_AREA_SMOKE = 8000      # Naikkan ke 8000-10000px²
SMOKE_FRAMES = 12          # Naikkan ke 12-15 frames
MOTION_THRESHOLD = 800     # Naikkan ke 800-1000 pixels
```

### Jika Asap Asli Tidak Terdeteksi:
Turunkan parameter ini:

```python
CONF_SMOKE = 0.70          # Turunkan ke 70-72%
MIN_AREA_SMOKE = 5000      # Turunkan ke 5000-6000px²
SMOKE_FRAMES = 7           # Turunkan ke 7-8 frames
```

---

**Tanggal**: 8 Januari 2026  
**Versi**: 2.0 (Simplified + Motion Detection)  
**Status**: ✅ Production Ready
