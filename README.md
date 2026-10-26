# UTS Pemrograman Web – Website Kantin Kampus

## Identitas
| | |
|---|---|
| Nama | (isi nama lengkap) |
| NIM | (isi NIM) |
| Kelas | D4 MI 2025 / (isi A, B, atau C) |
| Kelompok | 7 |
| Dosen | Ari Kurniawan, S.Kom., M.T. |
| Topik | Website Kantin Kampus (sesuai proposal kelompok) |

## Deskripsi singkat
Website Kantin Kampus membantu mahasiswa melihat menu, harga, dan ketersediaan makanan atau minuman di kantin tanpa harus datang dulu. Pada UTS ini saya mengerjakan tiga halaman: **Dashboard**, **Daftar Menu**, dan **Detail Menu**. Pembagian ini sudah didiskusikan dengan anggota kelompok agar pekerjaan 2.a, 2.b, dan 2.c tidak sama (ketentuan 2.d).

## Pemenuhan ketentuan soal
| Item | Yang dikerjakan | File |
|---|---|---|
| **2.a** Homepage / layout utama | Layout responsif (header, navigasi, footer) dengan Dashboard sebagai halaman awal. Navigasi memakai **Ajax** untuk memuat halaman 2.b dan 2.c tanpa reload. | `index.html`, `css/style.css`, `js/app.js`, `pages/dashboard.html` |
| **2.b** Halaman konten interaktif | **Daftar Menu**: pencarian, filter kategori, dan pengurutan harga. | `pages/menu.html` |
| **2.c** Halaman form + validasi | **Detail Menu** berisi form "tambah ke keranjang" dengan validasi jQuery sebelum dikirim ke server HTTP. | `pages/detail.html` |
| **2.e** Catatan pengerjaan | File ini. | `README.md` |

## Struktur folder
```
PWUTS_<kode_kelompok>_<nim>/
├── index.html            # layout utama (2.a)
├── css/
│   └── style.css         # tampilan + responsive (media query)
├── js/
│   └── app.js            # data menu, navigasi Ajax, logika semua halaman
├── pages/
│   ├── dashboard.html    # halaman awal
│   ├── menu.html         # 2.b Daftar Menu
│   └── detail.html       # 2.c Detail Menu + form
├── images/               # gambar menu (opsional)
└── README.md
```

## Teknologi
HTML5, CSS3 (Flexbox, Grid, media query), JavaScript, dan jQuery 3.7.1 (via CDN cdnjs).

## Cara menjalankan
Teknik Ajax (`$.load`) **tidak berjalan jika `index.html` dibuka dengan klik dua kali** (protokol `file://` diblokir browser). Gunakan salah satu cara berikut:

1. **VS Code + Live Server**: buka folder proyek, klik kanan `index.html`, pilih *Open with Live Server*.
2. **Python**: jalankan `python -m http.server 8000` di folder proyek, lalu buka `http://localhost:8000`.
3. **GitHub Pages**: aktifkan di *Settings → Pages* pada repository, lalu buka URL yang diberikan.

## Penjelasan fitur

### 1. Layout utama dan Ajax (2.a)
- Header berisi logo, menu navigasi, dan penghitung keranjang. Di layar ≤ 700 px, navigasi berubah menjadi tombol ☰ (responsive web design).
- Setiap link navigasi memanggil fungsi `buka(halaman, id)` di `app.js`, yang menjalankan `$("#konten").load("pages/<halaman>.html")`. Hanya isi `<main id="konten">` yang berganti, header dan footer tetap.
- Alamat memakai hash (contoh `#detail-3`), sehingga halaman yang sama terbuka lagi saat di-refresh.

### 2. Dashboard
- Statistik: jumlah menu, tersedia, habis, dan jumlah penjual. Angkanya dihitung dari data dan ditampilkan dengan animasi hitung naik (`.animate()` jQuery).
- Tiga menu populer dan tabel status ketersediaan semua menu.

### 3. Daftar Menu (2.b)
- Pencarian langsung (event `input`) berdasarkan nama menu atau nama penjual.
- Filter kategori: Semua, Makanan, Minuman, Snack.
- Pengurutan: nama A–Z, harga termurah, harga termahal.
- Setiap kartu menampilkan nama, penjual, harga, dan status stok, serta tombol menuju detail.

### 4. Detail Menu dan form (2.c)
Menampilkan gambar, nama, kategori, harga, deskripsi, penjual, dan ketersediaan, sesuai rancangan halaman detail menu pada proposal. Form "tambah ke keranjang" berisi:

| Field | Aturan validasi |
|---|---|
| Jumlah | Wajib, bilangan bulat ≥ 1, tidak boleh melebihi sisa stok |
| Tipe pesanan | Wajib dipilih (Makan di tempat / Bawa pulang) |
| Catatan | Opsional, maksimal 100 karakter, hanya huruf, angka, dan tanda baca dasar |

Alur form:
1. Saat tombol ditekan, `e.preventDefault()` menahan pengiriman.
2. Validasi jQuery dijalankan. Jika ada yang salah, pesan merah muncul di bawah field dan data **tidak dikirim**.
3. Jika lolos, data dikirim ke server HTTP dengan `$.ajax` (method POST, format JSON).
4. Jika berhasil, jumlah masuk keranjang, angka 🛒 di header bertambah, dan sisa stok berkurang.

Fitur lain: subtotal berubah otomatis saat jumlah diubah, penghitung karakter catatan, dan tombol otomatis nonaktif jika stok habis.

## Kaitan dengan rancangan database proposal
Data menu di `js/app.js` (array `MENU`) meniru tabel `menu` dan `kategori`: `id` (id_menu), `kat` (kategori), `nama` (nama_menu), `harga`, `stok`, dan `desk` (deskripsi). Data yang dikirim form memakai nama kolom yang sejalan dengan tabel `detail_pesanan`:

```json
{
  "id_menu": 1,
  "jumlah": 2,
  "harga_satuan": 15000,
  "subtotal": 30000,
  "tipe_pesanan": "Bawa pulang",
  "catatan": "tidak pakai sambal"
}
```

## Catatan dan batasan
- Server HTTP yang dipakai adalah `https://httpbin.org/post`, layanan uji publik yang hanya membalas data yang dikirim. Hal ini karena belum ada backend PHP/MySQL pada tahap UTS. Untuk versi akhir, URL pada `$.ajax` tinggal diganti ke skrip PHP (misalnya `proses_keranjang.php`).
- Data menu masih berupa array JavaScript, belum dibaca dari database.
- Keranjang disimpan di `localStorage` browser, jadi tidak tersimpan di server.
- Emoji dipakai sebagai gambar sementara. Foto asli dapat ditaruh di folder `images/`.
- Halaman login, keranjang, dan pesanan dikerjakan anggota kelompok lain.

## Referensi
- Proposal Perancangan Website Kantin Kampus, Kelompok 7 (use case, class diagram, ERD, wireframe, dan mockup).
- Dokumentasi jQuery: https://api.jquery.com
