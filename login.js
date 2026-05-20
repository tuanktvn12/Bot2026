const fs = require("fs-extra");
const login = require("facebook-chat-api-v2");
const readline = require("readline");
const totp = require("totp-generator");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ===== LOAD CONFIG =====
const config = require("./config.json");

const email = config.EMAIL;
const password = config.PASSWORD;
const otpkey = (config.OTPKEY || "").replace(/\s+/g, "").toLowerCase();

// ===== OPTION LOGIN (GIẢ LẬP BRAVE) =====
const option = {
    logLevel: "silent",
    forceLogin: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
};

// ===== LOGIN =====
login({ email, password }, option, (err, api) => {
    if (err) {
        switch (err.error) {
            case "login-approval":
                console.log("🔐 Cần mã 2FA");

                if (otpkey) {
                    const code = totp(otpkey);
                    console.log("👉 Dùng OTP tự động:", code);
                    return err.continue(code);
                }

                rl.question("Nhập mã 2FA: ", (code) => {
                    err.continue(code);
                    rl.close();
                });
                break;

            default:
                console.error("❌ Login lỗi:", err);
                process.exit(1);
        }
        return;
    }

    try {
        const appState = api.getAppState();
        fs.writeFileSync(config.APPSTATEPATH || "appstate.json", JSON.stringify(appState, null, 2));
        console.log("✅ Đã tạo appstate thành công!");
    } catch (e) {
        console.log("❌ Lỗi ghi appstate:", e.message);
    }

    process.exit(0);
});