// ===== Data menu (sesuai tabel menu & kategori pada proposal) =====

const MENU = [
  {
    id: 1,
    nama: "Ayam Geprek",
    kat: "Makanan",
    harga: 15000,
    stok: 10,
    populer: 9,
    penjual: "Warung Bu Sari",
    gambar: "assets/images/ayam-geprek.jpg",
    desk: "Ayam goreng tepung dengan sambal geprek pedas, disajikan bersama nasi hangat, timun, dan selada."
  },
  {
    id: 2,
    nama: "Nasi Goreng",
    kat: "Makanan",
    harga: 12000,
    stok: 8,
    populer: 8,
    penjual: "Dapur Pak Budi",
    gambar: "assets/images/nasi-goreng.jpg",
    desk: "Nasi goreng telur dengan acar dan kerupuk."
  },
  {
    id: 3,
    nama: "Es Teh Manis",
    kat: "Minuman",
    harga: 5000,
    stok: 20,
    populer: 6,
    penjual: "Warung Bu Sari",
    gambar: "assets/images/es-teh-manis.jpg",
    desk: "Teh dingin dengan gula asli."
  },
  {
    id: 4,
    nama: "Jus Alpukat",
    kat: "Minuman",
    harga: 10000,
    stok: 5,
    populer: 5,
    penjual: "Kedai Segar",
    gambar: "assets/images/jus-alpukat.jpg",
    desk: "Alpukat segar dengan susu cokelat."
  }
];

const rp = n => "Rp" + n.toLocaleString("id-ID");

// ===== Keranjang: {id_menu: jumlah}, disimpan di localStorage =====
let cart = {};
try { cart = JSON.parse(localStorage.getItem("cart") || "{}"); } catch (e) {}
function simpan() {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
  $("#badge").text(Object.values(cart).reduce((a, b) => a + b, 0));
}
const sisaStok = m => m.stok - (cart[m.id] || 0);
const status = m => m.stok === 0 ? "Habis" : sisaStok(m) <= 0 ? "Stok di keranjangmu penuh" : "Tersedia (" + sisaStok(m) + ")";

// ===== Navigasi Ajax (syarat 2.a): isi #konten diganti tanpa reload =====
function buka(halaman, id) {
  $("#konten").html('<p class="loading">Memuat...</p>');
  $("#konten").load("pages/" + halaman + ".html", function (res, st) {
    if (st === "error") {
      $("#konten").html('<p class="err">Halaman gagal dimuat. Jalankan lewat server (bukan klik dua kali file).</p>');
      return;
    }
    if (halaman === "dashboard") initDashboard();
    if (halaman === "menu") initMenu();
    if (halaman === "detail") initDetail(id)
    if (halaman === "keranjang") initKeranjang();;
  });
  $("#nav a").removeClass("aktif").filter('[data-page="' + (halaman === "detail" ? "menu" : halaman) + '"]').addClass("aktif");
  $("#nav").removeClass("buka");
  history.replaceState(null, "", "#" + halaman + (id ? "-" + id : ""));
  window.scrollTo(0, 0);
}
$(document).on("click", "a[data-page]", function (e) {
  e.preventDefault();
  buka($(this).data("page"), $(this).data("id"));
});
$("#btn-menu").on("click", () => $("#nav").toggleClass("buka"));

// ===== Dashboard =====
function initDashboard() {
  const nilai = {
    total: MENU.length,
    ada: MENU.filter(m => m.stok > 0).length,
    habis: MENU.filter(m => m.stok === 0).length,
    penjual: new Set(MENU.map(m => m.penjual)).size
  };
  $(".angka").each(function () {            // animasi hitung naik
    const el = $(this), target = nilai[el.data("n")];
    $({n: 0}).animate({n: target}, {duration: 700, step: v => el.text(Math.round(v))});
  });
  const top = [...MENU].sort((a, b) => b.populer - a.populer).slice(0, 3);
  $("#populer").html(top.map(kartu).join(""));
  $("#tabel-stok tbody").html(MENU.map(m =>
    `<tr><td>${m.ikon} ${m.nama}</td><td>${rp(m.harga)}</td>
     <td class="${m.stok ? "ok" : "err"}">${m.stok ? "Tersedia" : "Habis"}</td></tr>`).join(""));
}

function kartu(m) {
    return `<article class="kartu">
        <div class="foto">
            <img
                src="${m.gambar}"
                alt="${m.nama}"
                class="gambar-menu"
            >
        </div>
        <h3>${m.nama}</h3>
        <p class="muted">${m.penjual}</p>
        <p class="harga">${rp(m.harga)}</p>
        <p class="muted">${status(m)}</p>
        <a class="btn" href="#detail-${m.id}" data-page="detail" data-id="${m.id}">Lihat detail</a>
    </article>`;
}

// ===== Halaman 2.b: Daftar Menu =====
function initMenu() {
  let kat = "Semua";
  function tampil() {
    const q = $("#cari").val().toLowerCase(), u = $("#urut").val();
    const data = MENU.filter(m => (kat === "Semua" || m.kat === kat) &&
      (m.nama + " " + m.penjual).toLowerCase().includes(q));
    data.sort((a, b) => u === "murah" ? a.harga - b.harga : u === "mahal" ? b.harga - a.harga : a.nama.localeCompare(b.nama));
    $("#jumlah").text(data.length + " menu ditemukan");
    $("#grid").html(data.map(kartu).join("") || '<p class="muted">Menu tidak ditemukan. Coba kata kunci lain.</p>');
  }
  $("#cari").on("input", tampil);
  $("#urut").on("change", tampil);
  $("#kategori").on("click", ".chip", function () {
    kat = $(this).data("k");
    $(".chip").removeClass("aktif"); $(this).addClass("aktif");
    tampil();
  });
  tampil();
}

// ===== Halaman 2.c: Detail Menu + form tambah ke keranjang =====

function initDetail(id) {
  const m = MENU.find(x => x.id == id);

  if (!m) {
    $("#isi-detail").html(
      '<p class="err">Menu tidak ditemukan.</p>'
    );
    return;
  }

  const sisa = sisaStok(m);

  // Menampilkan detail menu
  $("#isi-detail").html(`
    <div class="foto besar">
      <img src="${m.gambar}" alt="${m.nama}" class="gambar-menu">
    </div>

    <div>
      <p class="muted">${m.kat}</p>
      <h2>${m.nama}</h2>
      <p class="harga besar-teks">${rp(m.harga)}</p>
      <p>${m.desk}</p>
      <p class="muted">
        Penjual: <b>${m.penjual}</b> • ${status(m)}
      </p>

      <form id="form" novalidate>
        <label>Jumlah
          <input type="number" id="jumlah-pesan" value="1" min="1"
            max="${sisa}" ${sisa <= 0 ? "disabled" : ""}>
          <small class="err" id="e-jumlah"></small>
        </label>

        <label>Tipe pesanan
          <select id="tipe">
            <option value="">-- pilih --</option>
            <option value="Makan di tempat">Makan di tempat</option>
            <option value="Bawa pulang">Bawa pulang</option>
          </select>
          <small class="err" id="e-tipe"></small>
        </label>

        <label>Catatan (opsional)
          <input type="text" id="catatan" maxlength="100"
            placeholder="Contoh: tidak pakai sambal">
          <small class="muted" id="hitung">0/100</small>
          <small class="err" id="e-catatan"></small>
        </label>

        <p>Subtotal: <b id="subtotal">${rp(m.harga)}</b></p>

        <button type="submit" class="btn" ${sisa <= 0 ? "disabled" : ""}>
          ${sisa <= 0 ? "Stok habis" : "Tambah ke keranjang"}
        </button>

        <div id="hasil"></div>
      </form>
    </div>
  `);

  // Menghitung subtotal secara otomatis
  $("#jumlah-pesan").on("input", function () {
    const j = Number($(this).val());
    $("#subtotal").text(rp((j > 0 ? j : 0) * m.harga));
  });

  // Menghitung karakter catatan
  $("#catatan").on("input", function () {
    $("#hitung").text($(this).val().length + "/100");
  });

  // Validasi dan konfirmasi pesanan
  $("#form").on("submit", function (e) {
    e.preventDefault();

    $(".err").text("");

    let ok = true;

    const err = (id, pesan) => {
      $("#e-" + id).text(pesan);
      ok = false;
    };

    const j = Number($("#jumlah-pesan").val());
    const tipe = $("#tipe").val();
    const catatan = $("#catatan").val().trim();

    if (!Number.isInteger(j) || j < 1) {
      err("jumlah", "Jumlah minimal 1 dan harus bilangan bulat.");
    } else if (j > sisaStok(m)) {
      err("jumlah", "Stok tidak cukup. Sisa " + sisaStok(m) + ".");
    }

    if (!tipe) {
      err("tipe", "Silakan pilih tipe pesanan.");
    }

    if (!/^[\w\s.,!?-]*$/.test(catatan)) {
      err("catatan", "Catatan hanya boleh berisi huruf, angka, dan tanda baca dasar.");
    }

    if (!ok) return;

    const payload = {
      id_menu: m.id,
      nama_menu: m.nama,
      jumlah: j,
      harga_satuan: m.harga,
      subtotal: j * m.harga,
      tipe_pesanan: tipe,
      catatan: catatan
    };

    // Meminta konfirmasi sebelum memesan
    const yakin = confirm(
      "Apakah kamu yakin ingin memesan menu ini?\n\n" +
      "Nama menu: " + m.nama + "\n" +
      "Jumlah: " + j + "\n" +
      "Tipe pesanan: " + tipe + "\n" +
      "Subtotal: " + rp(payload.subtotal)
    );

    if (!yakin) {
      $("#hasil").html(
        "<p class='muted'>Pesanan dibatalkan.</p>"
      );
      return;
    }

    // Menambahkan pesanan satu kali ke keranjang
    cart[m.id] = (cart[m.id] || 0) + j;
    simpan();

    // Simpan juga rincian pesanan untuk ditampilkan di keranjang
    let rincian = {};
    try {
      rincian = JSON.parse(
        localStorage.getItem("rincianPesanan") || "{}"
      );
    } catch (e) {
      rincian = {};
    }

    rincian[m.id] = {
      tipe_pesanan: tipe,
      catatan: catatan
    };

    localStorage.setItem(
      "rincianPesanan",
      JSON.stringify(rincian)
    );

    $("#hasil").html(
      "<p class='ok'>✅ " + j + " × " + m.nama +
      " berhasil ditambahkan ke keranjang (" +
      rp(payload.subtotal) + ").</p>"
    );

    $("#jumlah-pesan").val(1);
    $("#subtotal").text(rp(m.harga));

    initDetailStatus(m);
  });
}

// Fungsi ini harus berada di luar initDetail()
function initDetailStatus(m) {
  const sisa = sisaStok(m);

  $("#form button[type=submit]")
    .prop("disabled", sisa <= 0)
    .text(sisa <= 0 ? "Stok habis" : "Tambah ke keranjang");
}
; 
  

// ===== Mulai: baca hash, misal #detail-3 =====
simpan();
const h = location.hash.replace("#", "").split("-");
buka(h[0] || "dashboard", h[1]);
