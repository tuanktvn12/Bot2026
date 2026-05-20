const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "cap",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Thiệu Trung Kiên + fix",
    description: "Chụp profile Facebook",
    commandCategory: "THÀNH VIÊN",
    usages: "[reply/tag/uid]",
    cooldowns: 5
};

async function capProfile({
    api,
    event,
    Users,
    args
}) {

    try {

        const name =
            await Users.getNameUser(
                event.senderID
            );

        api.sendMessage(
            `📸 Đang chụp profile cho ${name}...`,
            event.threadID,
            event.messageID
        );

        let uid;

        // reply
        if (
            event.type === "message_reply"
        ) {

            uid =
                event.messageReply.senderID;
        }

        // tag
        else if (
            Object.keys(
                event.mentions || {}
            ).length > 0
        ) {

            uid =
                Object.keys(
                    event.mentions
                )[0];
        }

        // nhập uid
        else if (
            args[0] &&
            !isNaN(args[0])
        ) {

            uid = args[0];
        }

        // bản thân
        else {

            uid = event.senderID;
        }

        const path =
            __dirname +
            `/cache/${uid}.png`;

        // API mới
        const url =
            `https://graph.facebook.com/${uid}/picture?width=2000&height=2000`;

        const img = (
            await axios.get(url, {
                responseType:
                    "arraybuffer"
            })
        ).data;

        fs.writeFileSync(
            path,
            Buffer.from(img)
        );

        return api.sendMessage(
            {
                body:
`📸 PROFILE FACEBOOK
━━━━━━━━━━
👤 UID: ${uid}`,
                attachment:
                    fs.createReadStream(path)
            },
            event.threadID,
            () => {
                if (
                    fs.existsSync(path)
                ) {
                    fs.unlinkSync(path);
                }
            },
            event.messageID
        );

    } catch (e) {

        console.log(e);

        return api.sendMessage(
            "❌ Không thể lấy ảnh profile",
            event.threadID,
            event.messageID
        );
    }
}

module.exports.handleEvent =
async function (obj) {

    try {

        if (
            !obj.event.body
        ) return;

        if (
            obj.event.body
                .toLowerCase()
                .trim() === "cap"
        ) {

            return capProfile(obj);
        }

    } catch (e) {
        console.log(e);
    }
};

module.exports.run =
async function (obj) {
    return capProfile(obj);
};