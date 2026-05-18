# 💬 Random Portal Chat (Laravel + Livewire)

Random Portal Chat adalah aplikasi **chat acak (random match)** berbasis **Laravel + Livewire**.  
Pengguna dapat melakukan chat **random one-on-one** atau masuk ke **group chat**.  
Tidak perlu refresh halaman — chatting realtime dengan Livewire!

---

## 🔥 Fitur Utama

| Fitur | Deskripsi |
|------|----------|
| 🔀 Random Chat | Sistem menemukan random user untuk chat 1-on-1 |
| 👥 Group Chats | Chat room untuk banyak user dalam 1 grup |
| 👤 Login / Register | Autentikasi user lengkap |
| 🟢 Status Online | User yang aktif ditampilkan online |
| ⏳ Typing Indicator | Menampilkan status sedang mengetik |
| 🎯 Generate Chat | Buat session chat manual atau random |
| 🚪 End Chat / Next | Tinggalkan chat & cari partner baru |
| 🧩 Live UI Update | Data berubah tanpa reload (Livewire realtime) |


---

## 🛠️ Teknologi

- Laravel (backend + routing)
- Livewire (UI realtime tanpa reload)
- TailwindCSS + DaisyUI (UI Components)
- MySQL atau MariaDB
- Vite (asset bundling)

---

## 🚀 Cara Instalasi

```bash
# Clone project
git clone https://github.com/YoKYa/Portal-Random-Chat.git
cd Portal-Random-Chat

# Install dependencies
composer install
npm install

# Copy environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate --seed

# Jalankan server
npm run dev
php artisan serve
```

---

## ⚙️ Livewire Setup

Pastikan layout menggunakan:

```blade
@livewireStyles
@livewireScripts
```

Tidak perlu membuat banyak JavaScript manual — semua sudah di-handle Livewire.

---

## 🧩 Cara Menggunakan

1. Masuk ke halaman utama → login / register
2. Pilih **Random Chat** atau **Group Chat**
3. Masukkan username → klik **Join**
4. Chat dimulai!

Tambahan fitur:
- Klik **Generate Chat** → buat room chat manual
- Mode **Random** → langsung otomatis mencarikan partner chat

---

## 🤝 Kontribusi

Silakan fork repository ini, buat perubahan / fitur baru, lalu kirim Pull Request.

```bash
git checkout -b new-feature
git commit -m "add new feature"
git push origin new-feature
```

---

## 📄 License

Proyek ini dirilis dengan **MIT License**.  
Silakan gunakan untuk kebutuhan personal, project kuliah, atau komersial.

---

Jika repo ini bermanfaat, jangan lupa kasih ⭐ di GitHub!
