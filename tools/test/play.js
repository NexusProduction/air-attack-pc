// Scripted gameplay test. usage: node play.js "<steps>" outDir
// steps: semicolon list: click:x,y | wait:ms | shot:name | key:Code | keydown:Code | keyup:Code | drag:x1,y1,x2,y2 | eval:js
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const root = path.join(__dirname, "../../dist");
const steps = (process.argv[2] || "").split(";").map((s) => s.trim()).filter(Boolean), out = process.argv[3] || "/tmp/aa-play";
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
  const br = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const pg = await br.newPage({ viewport: { width: 1280, height: 720 } });
  const logs = [];
  pg.on("console", (m) => logs.push("[" + m.type() + "] " + m.text()));
  pg.on("pageerror", (e) => logs.push("[pageerror] " + (e.stack || e.message)));
  await pg.goto("http://localhost:" + srv.address().port + "/index.html#autostart");
  await pg.waitForTimeout(2500);
  for (const st of steps) {
    const i = st.indexOf(":"); const cmd = i < 0 ? st : st.slice(0, i), arg = i < 0 ? "" : st.slice(i + 1);
    if (cmd === "click") { const [x, y] = arg.split(",").map(Number); await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(60); await pg.mouse.up(); }
    else if (cmd === "hold") { const [x, y, ms] = arg.split(",").map(Number); await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(ms); await pg.mouse.up(); }
    else if (cmd === "drag") { const [a, b, c, d] = arg.split(",").map(Number); await pg.mouse.move(a, b); await pg.mouse.down(); for (let k = 1; k <= 6; k++) { await pg.mouse.move(a + (c - a) * k / 6, b + (d - b) * k / 6); await pg.waitForTimeout(25); } await pg.mouse.up(); }
    else if (cmd === "random") { // random bot: fire at random sky points, walk, jump(swipe up), dig
      const end = Date.now() + +arg; let n = 0;
      while (Date.now() < end) {
        const r = Math.random(), sx = 640 + (Math.random() - 0.5) * 600;
        if (r < 0.5) { await pg.mouse.move(100 + Math.random() * 1080, 60 + Math.random() * 400); await pg.mouse.down(); await pg.waitForTimeout(40); await pg.mouse.up(); }
        else if (r < 0.65) { await pg.keyboard.down("ArrowLeft"); await pg.waitForTimeout(300 + Math.random() * 500); await pg.keyboard.up("ArrowLeft"); }
        else if (r < 0.8) { await pg.keyboard.down("ArrowRight"); await pg.waitForTimeout(300 + Math.random() * 500); await pg.keyboard.up("ArrowRight"); }
        else if (r < 0.9) { const x = 300 + Math.random() * 700; await pg.mouse.move(x, 560); await pg.mouse.down(); for (let k = 1; k <= 5; k++) { await pg.mouse.move(x + 10 * k, 560 - 30 * k); await pg.waitForTimeout(20); } await pg.mouse.up(); }
        else { await pg.keyboard.press("Space"); }
        await pg.waitForTimeout(120 + Math.random() * 250);
        if (++n % 60 === 0) await pg.screenshot({ path: path.join(out, "r" + String(n / 60).padStart(2, "0") + ".png") });
      }
    }
    else if (cmd === "dom") await pg.click(arg);
    else if (cmd === "wait") await pg.waitForTimeout(+arg);
    else if (cmd === "shot") await pg.screenshot({ path: path.join(out, arg + ".png") });
    else if (cmd === "key") await pg.keyboard.press(arg);
    else if (cmd === "keydown") await pg.keyboard.down(arg);
    else if (cmd === "keyup") await pg.keyboard.up(arg);
    else if (cmd === "eval") console.log("eval:", JSON.stringify(await pg.evaluate((src) => { try { return (0, eval)(src); } catch (e) { return "ERR " + (e && e.constructor && e.constructor.name) + " " + (e && e.message) + " | " + (e && e.stack) + " | " + (e && e.$jsStack) + " | " + JSON.stringify(e, (k, v) => typeof v === "bigint" ? v.toString() : v).slice(0, 400); } }, arg)));
  }
  const frames = await pg.evaluate(() => (window.$game && window.$game.frames) || 0);
  console.log("frames:", frames);
  console.log(logs.slice(0, 50).join("\n"));
  await br.close(); srv.close();
})();
