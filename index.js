const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const log = require("./utils/log");
const chalk = require("chalk");
const chalkercli = require("chalkercli");
const express = require("express");

const app = express();

// ================== WEB SERVER ==================
app.get("/", (req, res) => {
    res.send("Bot is running ✅");
});

// ⚠️ FIX PORT (Node 20)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    log(`Server running at port ${PORT}`, "[ WEB ]");
});

// ================== DASHBOARD ==================
const dashboard = http.createServer(function (_req, res) {
    res.writeHead(200, "OK", { "Content-Type": "text/plain" });
    res.write("Xin chào cậu chủ Nguyễn Đạt. Welcome back!");
    res.end();
});

// ================== START BOT ==================
function startBot(message) {
    if (message) log(message, "[ START ]");

    const child = spawn("node", ["mirai.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", async (codeExit) => {
        const code = String(codeExit);

        if (codeExit === 1) {
            return startBot("🔄 BOT RESTARTING...");
        } 
        else if (code.startsWith("2")) {
            const delay = parseInt(code.slice(1)) * 1000 || 5000;
            log(`⏳ Restart sau ${delay / 1000}s`, "[ WAIT ]");

            await new Promise(resolve => setTimeout(resolve, delay));
            startBot("✅ BOT STARTED AGAIN");
        } 
        else {
            log(`❌ Bot stopped với code: ${codeExit}`, "[ STOP ]");
        }
    });

    child.on("error", (error) => {
        log("❌ Lỗi khi start bot: " + error.message, "[ ERROR ]");
    });
}

// ================== CHECK UPDATE ==================
axios.get("https://raw.githubusercontent.com/dongdev06/miraiv2/main/package.json")
.then((res) => {
    log("MAGUS", "[ NAME ]");
    log("Version Github: " + res.data.version, "[ VERSION ]");
    log("MAGUS hân hạnh tài trợ chương trình này", "[ DESCRIPTION ]");
})
.catch(err => {
    log("Không check được update: " + err.message, "[ ERROR ]");
});

// ================== BANNER ==================
setTimeout(() => {
    const rainbow = chalkercli.rainbow(`
***********************************************************
* *
* ███╗░░░███╗░█████╗░░██████╗░██╗░░░██╗░██████╗    *
* ████╗░████║██╔══██╗██╔════╝░██║░░░██║██╔════╝    *
* ██╔████╔██║███████║██║░░██╗░██║░░░██║╚█████╗░    *
* ██║╚██╔╝██║██╔══██║██║░░╚██╗██║░░░██║░╚═══██╗    *
* ██║░╚═╝░██║██║░░██║╚██████╔╝╚██████╔╝██████╔╝    *
* ╚═╝░░░░░╚═╝╚═╝░░╚═╝░╚═════╝░░╚═════╝░╚═════╝░    *
* *
* → BOT Magus (Node 20 FIX)                               *
***********************************************************
    `).stop();

    rainbow.render();
    console.log(rainbow.frame());

    log("🚀 Bắt đầu load source code...", "[ LOAD ]");

    startBot();

}, 500);