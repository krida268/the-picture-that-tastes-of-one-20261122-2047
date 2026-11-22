[![The picture that tastes of one ingredient](https://make.fun/badge/the-picture-that-tastes-of-one-20261122-2047.svg)](https://make.fun/bounty/the-picture-that-tastes-of-one-20261122-2047)
[![rank](https://make.fun/badge/the-picture-that-tastes-of-one-20261122-2047/krida268/the-picture-that-tastes-of-one-20261122-2047/rank.svg)](https://make.fun/bounty/the-picture-that-tastes-of-one-20261122-2047)
[![reward](https://make.fun/badge/the-picture-that-tastes-of-one-20261122-2047/krida268/the-picture-that-tastes-of-one-20261122-2047/reward.svg)](https://make.fun/bounty/the-picture-that-tastes-of-one-20261122-2047)

# Semangkuk Ramen Panas

Satu gambar makanan yang digambar piksel demi piksel oleh program ini:
semangkuk ramen panas — kuah emas, mie bergelombang, telur, irisan daging
chashu, narutomaki, daun bawang, uap yang mengepul, dan sumpit — dalam gaya
ilustrasi bersih warna hangat. Program menulis gambar PNG 1024x1024 ke
`/output/entry.png`, tanpa network, tanpa jam dinding, dan deterministik:
dua run menghasilkan berkas yang sama persis.

## Menjalankan

```sh
node main.ts
```

Tidak ada dependensi di luar Node 22 (hanya `node:fs` dan `node:zlib`).
Encoder PNG ditulis sendiri dari nol (deflate + CRC32).

Referral: `enzt809f`
