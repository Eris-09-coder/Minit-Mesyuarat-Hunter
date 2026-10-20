# Penjana Minit Mesyuarat – SK Sungai Tiram

Alat web percuma (tanpa pemasangan) untuk menjana **Minit Mesyuarat / Minit Mesyuarat Curai** dalam format PK07.

## Cara guna (guru)
1. Buka pautan GitHub Pages sekolah.
2. Isi borang di sebelah kiri (tarikh, masa, tempat, pengerusi, agenda).
3. Hari, bulan dan masa (pagi/tengahari/petang) dikira automatik.
4. Tekan **Cetak / Simpan PDF** → pilih saiz **A4**, margin **Default/None**, matikan "Headers and footers".

## Format agenda
- Satu baris = satu perkara (auto 1.1, 1.2 …)
- `## Tajuk` = sub-tajuk (4.1) → perkara di bawahnya 4.1.1, 4.1.2 …
- `- teks` = senarai titik
- Penanda: *Makluman* atau *Tindakan* (+ pihak bertindak)

## Pasang di GitHub Pages
1. Cipta repo baharu → muat naik `index.html`, `logo.jpg`, `README.md`.
2. Settings → Pages → Source: `main` / root → Save.
3. Kongsi pautan `https://<nama-akaun>.github.io/<nama-repo>/` kepada semua guru.

Draf disimpan dalam pelayar guru sendiri (tiada data dihantar ke mana-mana pelayan).

## Ciri OPR
- **Cara A:** pilih gambar OPR → *Baca OPR* (OCR dalam pelayar, perlu internet) → semak teks → *Jana agenda*. Gambar OPR dilampirkan automatik.
- **Cara B:** *Salin arahan AI* → muat naik OPR ke Claude + tampal arahan → tampal jawapan → *Masukkan ke agenda*.
Sentiasa semak hasil sebelum cetak.
