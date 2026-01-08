// app.js - Login Page Application
// ErrorBoundary di-load dari function/ErrorBoundary.js

const BACKEND_URL = "http://127.0.0.1:8000";

function App() {
  try {
    const [alert, setAlert] = React.useState(null);
    const [showLoginForm, setShowLoginForm] = React.useState(false);
    const [isStartingBackend, setIsStartingBackend] = React.useState(false);

    const showAlert = (message, type) => {
      setAlert({ message, type });
      setTimeout(() => setAlert(null), 3000);
    };

    const handleRegisterClick = async () => {
      // Matikan backend saat pindah ke halaman daftar (jika backend sedang menyala)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        await fetch(`${BACKEND_URL}/shutdown`, {
          method: 'POST',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (e) {
        // Jika backend sudah mati / request gagal, tetap lanjut ke halaman daftar.
      }

      window.location.href = 'regis.html';
    };

    const handleLoginClick = async () => {
      if (isStartingBackend) return;

      setIsStartingBackend(true);
      try {
        const res = await fetch('start_backend.php', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'error') {
            showAlert(data.message || 'Gagal menyalakan backend', 'error');
          }
        } else {
          showAlert('Gagal memanggil start_backend.php', 'error');
        }
      } catch (e) {
        console.error('start_backend error:', e);
        showAlert('Tidak bisa menyalakan backend otomatis', 'error');
      } finally {
        setIsStartingBackend(false);
        setShowLoginForm(true);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4" data-name="app" data-file="app.js">
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary-color)] rounded-2xl mb-4">
              <div className="icon-flame text-4xl text-white"></div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Fire Detection System</h1>
            <p className="text-[var(--text-secondary)]">Sistem Deteksi Api Real-time</p>
          </div>

          {!showLoginForm ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <div className="icon-shield-check text-3xl text-[var(--primary-color)]"></div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Selamat Datang</h2>
                <p className="text-[var(--text-secondary)]">Silakan login untuk mengakses sistem deteksi api</p>
              </div>
              <button onClick={handleLoginClick} className="btn-primary w-full" disabled={isStartingBackend}>
                Login
              </button>
            </div>
          ) : (
            <LoginForm onRegisterClick={handleRegisterClick} showAlert={showAlert} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);