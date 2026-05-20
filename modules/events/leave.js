module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "2.0.0",
    credits: "Fix by ChatGPT",
    description: "Thông báo rời nhóm (tối ưu)",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "moment-timezone": ""
    }
};

const checkttPath = __dirname + '/../commands/checktt/';

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = require("fs-extra");
    const { join } = require("path");

    const path = join(__dirname, "cache", "leaveGif");

    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const randomPath = join(path, "randomgif");
    if (!existsSync(randomPath)) mkdirSync(randomPath, { recursive: true });
};

// ================= RUN =================
module.exports.run = async function ({ api, event, Users, Threads }) {
    try {
        const { createReadStream, existsSync, readdirSync, readFileSync, writeFileSync } = require("fs-extra");
        const { join } = require("path");
        const moment = require("moment-timezone");

        const threadID = event.threadID;
        const leftID = event.logMessageData.leftParticipantFbId;

        // ❌ BOT tự out → bỏ
        if (leftID == api.getCurrentUserID()) return;

        // ================= CLEAN CHECKTT =================
        if (existsSync(checkttPath + threadID + '.json')) {
            const data = JSON.parse(readFileSync(checkttPath + threadID + '.json'));

            ["total", "week", "day"].forEach(type => {
                const index = data[type].findIndex(e => e.id == leftID);
                if (index !== -1) data[type].splice(index, 1);
            });

            writeFileSync(checkttPath + threadID + '.json', JSON.stringify(data, null, 4));
        }

        // ================= CHECK ENABLE =================
        let threadData = (await Threads.getData(threadID)).data || {};
        if (threadData.leave === false) return;

        // ================= TIME =================
        const timeNow = moment.tz("Asia/Ho_Chi_Minh");
        const gio = timeNow.format("D/MM/YYYY || HH:mm:ss");

        const thuMap = {
            Sunday: "Chủ Nhật",
            Monday: "Thứ Hai",
            Tuesday: "Thứ Ba",
            Wednesday: "Thứ Tư",
            Thursday: "Thứ Năm",
            Friday: "Thứ Sáu",
            Saturday: "Thứ Bảy"
        };

        const thu = thuMap[timeNow.format("dddd")];

        const hour = timeNow.format("HH");
        const session =
            hour < 3 ? "đêm khuya" :
            hour < 8 ? "sáng sớm" :
            hour < 12 ? "trưa" :
            hour < 17 ? "chiều" :
            hour < 23 ? "tối" : "đêm khuya";

        // ================= USER =================
        const name = await Users.getNameUser(leftID);
        const nameAuthor = await Users.getNameUser(event.author);

        const isSelfLeave = event.author == leftID;

        const typeMsg = isSelfLeave
            ? "đã tự rời nhóm"
            : `đã bị ${nameAuthor} kick`;

        // ================= MESSAGE =================
        let msg = threadData.customLeave ||
            `→ ${name} ${typeMsg}
→ Thời gian: ${gio}
→ ${session} ${thu}
→ Profile: https://facebook.com/${leftID}`;

        // ================= FILE =================
        const folder = join(__dirname, "cache", "leaveGif");
        const randomFolder = join(folder, "randomgif");

        let formPush = { body: msg };

        if (existsSync(folder + "/leave.mp4")) {
            formPush.attachment = createReadStream(folder + "/leave.mp4");
        } else if (existsSync(randomFolder)) {
            const files = readdirSync(randomFolder);
            if (files.length > 0) {
                const file = files[Math.floor(Math.random() * files.length)];
                formPush.attachment = createReadStream(join(randomFolder, file));
            }
        }

        return api.sendMessage(formPush, threadID);

    } catch (e) {
        console.log("Leave error:", e);
    }
};