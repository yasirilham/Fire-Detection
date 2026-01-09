function LoginForm({ onRegisterClick, showAlert }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      showAlert("Username dan password wajib diisi", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("backend_web/login.php", {
        method: "POST",
        body: formData,
        credentials: "include" // 🔥 PENTING
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        showAlert(data.message, "error");
      }

    } catch (err) {
      console.error("Login error:", err);
      showAlert("Gagal login ke server", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Login
      </button>

      <p className="text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-red-600 font-medium hover:underline"
        >
          Daftar
        </button>
      </p>
    </form>
  );
}
