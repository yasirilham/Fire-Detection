# Database Setup

## Import Database

### Cara 1: Via phpMyAdmin
1. Buka **phpMyAdmin**
2. Buat database baru: `fire_detect`
3. Pilih database tersebut
4. Klik tab **Import**
5. Pilih file `fire_detect.sql`
6. Klik **Go**

### Cara 2: Via Command Line
```bash
# Windows (Laragon)
C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS fire_detect"
C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql -u root fire_detect < database/fire_detect.sql

# Linux/Mac
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fire_detect"
mysql -u root -p fire_detect < database/fire_detect.sql
```

## Struktur Tabel

### users
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key, auto increment |
| name | VARCHAR(100) | Nama lengkap user |
| username | VARCHAR(50) | Username untuk login (unique) |
| password | VARCHAR(255) | Password (hashed bcrypt) |
| location | TEXT | Alamat/lokasi user |
| created_at | TIMESTAMP | Waktu registrasi |

## Default User (untuk testing)
- **Username**: Arsyi12
- **Password**: (sesuai saat registrasi)
