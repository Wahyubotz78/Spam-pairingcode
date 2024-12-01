const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const systemDir = path.resolve(__dirname, "system"); // Folder tempat submesin berada

function start(fileName) {
  const filePath = path.join(systemDir, fileName);
  const args = [filePath];
  let processInterval;

  console.log(`[INFO] Menjalankan submesin: ${fileName}`);

  const p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  // Tangani pesan dari subproses
  p.on("message", (data) => {
    if (data === "reset") {
      clearInterval(processInterval);
      p.kill();
    }
  });

  // Restart proses saat keluar
  p.on("exit", (code) => {
    clearInterval(processInterval);
    if (code === 130) {
      console.log(`[INFO] Submesin ${fileName} dihentikan dengan sinyal SIGINT.`);
      process.exit(0);
    } else {
      console.log(`[INFO] Submesin ${fileName} keluar. Memulai ulang...`);
      start(fileName); // Restart proses
    }
  });

  // Hentikan dan restart proses setiap 20 detik
  processInterval = setInterval(() => {
    p.kill();
  }, 20_000);
}

// Penanganan SIGINT dan SIGTERM
process.on("SIGINT", () => {
  console.log("[INFO] Mendapatkan SIGINT. Menghentikan semua submesin...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[INFO] Mendapatkan SIGTERM. Menghentikan semua submesin...");
  process.exit(0);
});

// Jalankan semua submesin di folder `system`
function runAllSubmachines() {
  console.log("[INFO] Membaca submesin di folder system...");
  const files = fs.readdirSync(systemDir).filter((file) => file.endsWith(".js"));

  files.forEach((file) => {
    start(file);
  });
}

runAllSubmachines();