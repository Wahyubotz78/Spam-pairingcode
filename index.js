const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Path file database
const dbPath = path.resolve(__dirname, "database/db.json");
let lastModifiedTime = fs.existsSync(dbPath) ? fs.statSync(dbPath).mtime : null;

// Map untuk menyimpan penanganan penolakan yang tidak ditangani
const unhandledRejections = new Map();

// Tangani penolakan promise yang tidak tertangani
process.on("unhandledRejection", (reason, promise) => {
  unhandledRejections.set(promise, reason);
  console.log("[ERROR] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("rejectionHandled", (promise) => {
  unhandledRejections.delete(promise);
});

// Tangani error global
process.on("uncaughtException", (err) => {
  console.log("[ERROR] Caught exception: ", err);
});

function start() {
  const args = [path.join(__dirname, "server.js"), ...process.argv.slice(2)];
  let p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  // Tangani pesan dari child process
  p.on("message", (data) => {
    if (data === "reset") {
      console.log("[INFO] Restarting server...");
      p.kill();
    }
  });

  // Tangani exit process
  p.on("exit", (code) => {
    if (code !== 0) {
      console.error("[ERROR] Server exited with code:", code);
    }
    console.log("[INFO] Restarting server...");
    start();
  });
}

// Fungsi untuk memantau perubahan di file database
function watchDatabase() {
  console.log("[INFO] Monitoring database changes...");

  setInterval(() => {
    if (fs.existsSync(dbPath)) {
      const currentModifiedTime = fs.statSync(dbPath).mtime;

      if (!lastModifiedTime || currentModifiedTime > lastModifiedTime) {
        console.log("[INFO] Changes detected in database. Restarting server...");
        lastModifiedTime = currentModifiedTime;
      }
    } else {
      console.warn("[WARN] Database file not found. Waiting for it to be created...");
    }
  }, 5000); // Periksa perubahan setiap 5 detik
}

// Mulai server dan memantau database
start();
watchDatabase();