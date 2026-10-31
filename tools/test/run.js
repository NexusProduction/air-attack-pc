// Headless smoke test: serves dist/, opens the page in Chromium, starts the game, collects errors, takes screenshots.
// usage: node tools/test/run.js [seconds] [outDir]
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const root = path.join(__dirname, "../../dist");
const secs = +(process.argv[2] || 8), out = process.argv[3] || "/tmp/aa-shots";
fs.mkdirSync(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".ogg": "audio/ogg", ".otf": "font/otf" };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0].split("#")[0]); if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); r.end("nf"); return; }
  r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise((ok) => srv.listen(0, ok));
  const port = srv.address().port;
  const br = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const pg = await br.newPage({ viewport: { width: 1280, height: 720 } });
  const logs = [];
  pg.on("console", (m) => { logs.push("[" + m.type() + "] " + m.text()); });
  pg.on("pageerror", (e) => logs.push("[pageerror] " + (e.stack || e.message)));
  await pg.goto("http://localhost:" + port + "/index.html#autostart");
  for (let i = 0; i < secs; i++) {
    await pg.waitForTimeout(1000);
    await pg.screenshot({ path: path.join(out, "t" + String(i).padStart(2, "0") + ".png") });
  }
  const frames = await pg.evaluate(() => (window.$game && window.$game.frames) || 0);
  console.log("frames:", frames);
  console.log(logs.slice(0, 40).join("\n"));
  await br.close(); srv.close();
})();
