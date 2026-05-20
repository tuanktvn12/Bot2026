const axios = require("axios");
const fs = require("fs-extra");
const downloader = require("image-downloader");

const path = __dirname + "/cache/statusAuto.json";

module.exports.config = {
    name: "autodow",
    version: "3.0.0",
    hasPermssion: 2,
    credits: "DC-Nam + fix api",
    description: "Auto tải video TikTok/Facebook/Douyin",
    commandCategory: "TIỆN ÍCH",
    usages: "",
    cooldowns: 3
};

module.exports.onLoad = function () {

    const cache = __dirname + "/cache";

    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache, {
            recursive: true
        });
    }

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "{}");
    }
};

async function streamURL(url, ext = "mp4") {

    const file =
        __dirname +
        `/cache/${Date.now()}.${ext}`;

    await downloader.image({
        url,
        dest: file
    });

    setTimeout(() => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    }, 60 * 1000);

    return fs.createReadStream(file);
}

module.exports.handleEvent = async function ({
    api,
    event
}) {

    try {

        if (
            event.senderID ==
            api.getCurrentUserID()
        ) return;

        const data =
            JSON.parse(
                fs.readFileSync(path)
            );

        if (
            typeof data[event.threadID]
            === "boolean" &&
            !data[event.threadID]
        ) return;

        const body = event.body || "";

        const urls =
            body.match(
                /(https?:\/\/[^\s]+)/g
            );

        if (!urls) return;

        for (const url of urls) {

            // TIKTOK + DOUYIN
            if (
                /tiktok\.com|douyin\.com|vt\.tiktok\.com/.test(url)
            ) {

                try {

                    const res = (
                        await axios.post(
                            "https://www.tikwm.com/api/",
                            {
                                url
                            },
                            {
                                headers: {
                                    "content-type":
                                        "application/json"
                                },
                                timeout: 30000
                            }
                        )
                    ).data.data;

                    if (!res.play) return;

                    return api.sendMessage(
                        {
                            body:
`🎵 TIKTOK / DOUYIN
━━━━━━━━━━
📝 ${res.title || "Không có tiêu đề"}

❤️ ${res.digg_count || 0}
💬 ${res.comment_count || 0}
🔁 ${res.share_count || 0}`,
                            attachment:
                                await streamURL(
                                    res.play,
                                    "mp4"
                                )
                        },
                        event.threadID,
                        event.messageID
                    );

                } catch (e) {
                    console.log("TikTok:", e.message);
                }
            }

            // FACEBOOK REELS / VIDEO
            if (
                /facebook\.com|fb\.watch|fb\.com/.test(url)
            ) {

                try {

                    const res = (
                        await axios.get(
                            `https://www.getmyfb.com/process`,
                            {
                                params: {
                                    id: url,
                                    locale: "en"
                                },
                                timeout: 30000
                            }
                        )
                    ).data;

                    const match =
                        res.match(
                            /https:\/\/video[^"]+\.mp4/g
                        );

                    if (!match || !match[0]) return;

                    return api.sendMessage(
                        {
                            body:
`📘 FACEBOOK REELS
━━━━━━━━━━`,
                            attachment:
                                await streamURL(
                                    match[0],
                                    "mp4"
                                )
                        },
                        event.threadID,
                        event.messageID
                    );

                } catch (e) {
                    console.log("Facebook:", e.message);
                }
            }
        }

    } catch (e) {
        console.log(e);
    }
};

module.exports.run = async function ({
    api,
    event
}) {

    const data =
        JSON.parse(
            fs.readFileSync(path)
        );

    data[event.threadID] =
        !data[event.threadID];

    fs.writeFileSync(
        path,
        JSON.stringify(data, null, 4)
    );

    return api.sendMessage(
        `✅ autodow ${
            data[event.threadID]
                ? "ON"
                : "OFF"
        }`,
        event.threadID,
        event.messageID
    );
};