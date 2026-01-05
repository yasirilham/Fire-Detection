// function/ErrorBoundary.js
// ============================================
// REUSABLE ERROR BOUNDARY COMPONENT
// Digunakan oleh: app.js, regis-app.js
// ============================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-4">Maaf, terjadi kesalahan yang tidak terduga.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
