function RegisterForm({ onLoginClick, showAlert }) {
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [telegramToken, setTelegramToken] = React.useState("");
  const [chatId, setChatId] = React.useState("");
  const [hasStartedBot, setHasStartedBot] = React.useState(false);
  const [location, setLocation] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !password || !telegramToken || !chatId || !location) {
      showAlert("Semua field wajib diisi", "error");
      return;
    }

    if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(telegramToken.trim())) {
      showAlert("Format token Telegram tidak valid", "error");
      return;
    }

    // chat_id biasanya numerik dari @userinfobot; bisa negatif untuk grup.
    if (!/^-?\d+$/.test(chatId.trim())) {
      showAlert("Format chat_id tidak valid. Ambil chat_id numerik dari @userinfobot", "error");
      return;
    }

    if (!hasStartedBot) {
      showAlert("Klik /start ke bot Telegram dulu, lalu centang konfirmasi", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("telegram_token", telegramToken.trim());
      formData.append("chat_id", chatId.trim());
      formData.append("has_started_bot", hasStartedBot ? "1" : "0");
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

      {/* Telegram Bot Token (dari admin) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Token Telegram
        </label>
        <input
          type="password"
          className="input-field"
          value={telegramToken}
          onChange={(e) => setTelegramToken(e.target.value)}
          placeholder="Contoh: 123456:ABCDEF..."
          autoComplete="off"
        />
        <p className="mt-2 text-xs text-gray-600">
          masukan token yang ada di README.txt{" "}
          <a
            href="https://drive.google.com/drive/folders/1IMXcdK6cZcv8W3cUfu5xhxGhZvV5vqXe?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 font-medium hover:underline"
          >
            di sini
          </a>
        </p>
      </div>

      {/* Telegram Chat ID */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Telegram chat_id
        </label>
        <input
          type="text"
          className="input-field"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Contoh: 6339045546"
          inputMode="numeric"
        />
        <p className="mt-2 text-xs text-gray-600">
          Dapatkan chat_id lewat{" "}
          <a
            href="https://t.me/userinfobot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 font-medium hover:underline"
          >
            https://t.me/userinfobot
          </a>
        </p>
      </div>

      {/* Konfirmasi /start bot */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-700 mb-3">
          Sebelum lanjut, lakukan{" "}
          <span className="font-medium">/start</span> ke bot Telegram terlebih dahulu:{" "}
          <a
            href="https://t.me/FireDA_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 font-medium hover:underline"
          >
            t.me/FireDA_bot
          </a>
        </p>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-1"
            checked={hasStartedBot}
            onChange={(e) => setHasStartedBot(e.target.checked)}
          />
          <span className="text-sm text-gray-800">
            Saya sudah melakukan /start dan siap menerima notifikasi.
          </span>
        </label>
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