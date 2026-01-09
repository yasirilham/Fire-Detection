function RegisterForm({ onLoginClick, showAlert }) {
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [location, setLocation] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !password || !location) {
      showAlert("Semua field wajib diisi", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("location", location);

      const res = await fetch("backend_web/register.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        showAlert("Registrasi berhasil! Silakan login.", "success");
        setTimeout(() => onLoginClick(), 1500);
      } else {
        showAlert(data.message || "Registrasi gagal", "error");
      }
    } catch (err) {
      console.error("Register error:", err);
      showAlert("Gagal terhubung ke server", "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-8 space-y-4"
    >
      {/* Nama Lengkap */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap pemilik rumah"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          type="text"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username untuk login"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>

      {/* Alamat Lengkap Rumah */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Alamat Lengkap Rumah
        </label>
        <textarea
          className="input-field"
          rows="4"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Contoh:
Jl. Ahmad Yani No. 12
RT 03 / RW 01
Kel. Sukamaju, Kec. Tegal Barat
Kota Tegal, Jawa Tengah"
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full">
        Daftar
      </button>

      {/* Redirect ke Login */}
      <p className="text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-red-600 font-medium hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
}