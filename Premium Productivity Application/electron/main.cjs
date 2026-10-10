const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");

// ─── Configuration ───────────────────────────────────────────
const BACKEND_PORT = 8000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const POLL_INTERVAL_MS = 300;
const BACKEND_TIMEOUT_MS = 30000;
const isDev = !app.isPackaged;

let mainWindow = null;
let backendProcess = null;
let frontendProcess = null;

// ─── Backend Process Management ──────────────────────────────

function startFrontend() {
  const appDir = path.join(__dirname, "..");
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"]
    : ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"];

  frontendProcess = spawn(command, args, {
    cwd: appDir,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  frontendProcess.stdout.on("data", (data) => console.log(`[Frontend] ${data.toString().trim()}`));
  frontendProcess.stderr.on("data", (data) => console.log(`[Frontend:err] ${data.toString().trim()}`));
  frontendProcess.on("error", (err) => console.error("[Student Dashboard] Failed to start frontend:", err));

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const poll = () => {
      if (Date.now() - startTime > BACKEND_TIMEOUT_MS) {
        reject(new Error("Frontend startup timeout"));
        return;
      }

      const req = http.get("http://127.0.0.1:5173", (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      });

      req.on("error", () => setTimeout(poll, POLL_INTERVAL_MS));
      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(poll, POLL_INTERVAL_MS);
      });
    };

    setTimeout(poll, 500);
  });
}

function getBackendCommand() {
  if (isDev) {
    // Development: use venv python directly
    const backendDir = path.join(__dirname, "..", "..", "backend");
    const venvPython = path.join(backendDir, "venv", "Scripts", "python.exe");
    return {
      command: venvPython,
      args: ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", String(BACKEND_PORT)],
      cwd: backendDir,
      env: { ...process.env },
    };
  } else {
    // Production: use PyInstaller-built exe
    const exePath = path.join(process.resourcesPath, "backend", "student-dashboard-backend.exe");
    const appDataDir = path.join(process.env.APPDATA || app.getPath("userData"), "GOD-HQ");
    // Ensure AppData dir exists
    if (!fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir, { recursive: true });
    }
    return {
      command: exePath,
      args: [],
      cwd: appDataDir,
      env: {
        ...process.env,
        GOD_HQ_PRODUCTION: "1",
        GOD_HQ_DB_PATH: path.join(appDataDir, "god_hq.db"),
      },
    };
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const { command, args, cwd, env } = getBackendCommand();

    console.log(`[Student Dashboard] Starting backend: ${command} ${args.join(" ")}`);
    console.log(`[Student Dashboard] CWD: ${cwd}`);

    // Check if command exists
    if (!fs.existsSync(command)) {
      reject(new Error(`Backend executable not found: ${command}`));
      return;
    }

    backendProcess = spawn(command, args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on("data", (data) => {
      console.log(`[Backend:err] ${data.toString().trim()}`);
    });

    backendProcess.on("error", (err) => {
      console.error(`[Student Dashboard] Failed to start backend:`, err);
      reject(err);
    });

    backendProcess.on("exit", (code, signal) => {
      console.log(`[Student Dashboard] Backend exited: code=${code}, signal=${signal}`);
      backendProcess = null;
    });

    // Poll until backend is ready
    const startTime = Date.now();
    const poll = () => {
      if (Date.now() - startTime > BACKEND_TIMEOUT_MS) {
        reject(new Error("Backend startup timeout"));
        return;
      }

      const req = http.get(`${BACKEND_URL}/`, (res) => {
        if (res.statusCode === 200) {
          console.log("[Student Dashboard] Backend is ready");
          resolve();
        } else {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      });

      req.on("error", () => {
        setTimeout(poll, POLL_INTERVAL_MS);
      });

      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(poll, POLL_INTERVAL_MS);
      });
    };

    setTimeout(poll, 500); // Give backend a moment to start
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log("[Student Dashboard] Stopping backend...");
    // On Windows, we need to kill the process tree
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(backendProcess.pid), "/f", "/t"], {
        windowsHide: true,
      });
    } else {
      backendProcess.kill("SIGTERM");
    }
    backendProcess = null;
  }
}

function stopFrontend() {
  if (!frontendProcess) return;

  console.log("[Student Dashboard] Stopping frontend...");
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(frontendProcess.pid), "/f", "/t"], { windowsHide: true });
  } else {
    frontendProcess.kill("SIGTERM");
  }
  frontendProcess = null;
}

// ─── Window Management ──────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: "Student Personal Dashboard",
    icon: path.join(__dirname, "icon.ico"),
    backgroundColor: "#0a0a1a",
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove menu bar entirely
  mainWindow.setMenu(null);

  // Show splash content while loading
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL("http://127.0.0.1:5173");
    // Optionally open DevTools
    // mainWindow.webContents.openDevTools();
  } else {
    // Production: load from backend (which serves the built frontend)
    mainWindow.loadURL("http://127.0.0.1:8000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Show a simple loading window while backend starts
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 480,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          display: flex; align-items: center; justify-content: center;
          height: 100vh; background: rgba(10, 10, 26, 0.95);
          border-radius: 20px; font-family: 'Segoe UI', sans-serif;
          -webkit-app-region: drag;
          overflow: hidden;
        }
        .container {
          text-align: center; color: #fff;
        }
        .logo-mark { width: 72px; height: 72px; margin-bottom: 18px; }
        .subtitle {
          font-size: 11px; letter-spacing: 4px;
          color: rgba(255,255,255,0.5); text-transform: uppercase;
          margin-bottom: 32px;
        }
        .loader {
          width: 200px; height: 3px;
          background: rgba(255,255,255,0.1); border-radius: 3px;
          margin: 0 auto; overflow: hidden;
        }
        .loader-bar {
          height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, #c9a84c, #f0d68a, transparent);
          border-radius: 3px;
          animation: slide 1.5s infinite ease-in-out;
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .status {
          font-size: 12px; color: rgba(255,255,255,0.35);
          margin-top: 16px; letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <svg class="logo-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#14243B"/>
          <path d="M14 20.5c6.6-2.3 12.6-.8 18 4.2 5.4-5 11.4-6.5 18-4.2v23c-6.6-2.3-12.6-.8-18 4.2-5.4-5-11.4-6.5-18-4.2v-23Z" stroke="#F2F5F8" stroke-width="3" stroke-linejoin="round"/>
          <path d="M32 25v22.7M22 30l5 3M42 28l-5 4M38 19l5-5 5 5M43 14v10" stroke="#58D6C4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="subtitle">Student Personal Dashboard</div>
        <div class="loader"><div class="loader-bar"></div></div>
        <div class="status">Initializing systems...</div>
      </div>
    </body>
    </html>
  `)}`);

  return splash;
}

// ─── App Lifecycle ──────────────────────────────────────────

app.whenReady().then(async () => {
  const splash = createSplashWindow();

  try {
    await Promise.all([
      isDev ? startFrontend() : Promise.resolve(),
      startBackend(),
    ]);
    splash.close();
    createWindow();
  } catch (err) {
    splash.close();
    console.error("[Student Dashboard] Failed to start:", err);
    dialog.showErrorBox(
      "Student Personal Dashboard — Startup Error",
      `Failed to start a local application service.\n\n${err.message}\n\nPlease check the logs and try again.`
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopBackend();
  stopFrontend();
  app.quit();
});

app.on("before-quit", () => {
  stopBackend();
  stopFrontend();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
