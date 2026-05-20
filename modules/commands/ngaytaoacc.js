module.exports.config = {
    name: "ngaytaoacc",
    version: "1.1.2",
    hasPermssion: 0,
    credits: "Fix By ChatGPT",
    description: "Xem ngày tạo tài khoản Facebook",
    commandCategory: "Tiện ích",
    usages: "[reply/@tag/uid]",
    cooldowns: 5
};

const axios = require("axios");

module.exports.run = async function ({ api, event, args }) {

    try {

        const uid =
            event.type == "message_reply"
                ? event.messageReply.senderID
                : Object.keys(event.mentions).length > 0
                ? Object.keys(event.mentions)[0]
                : args[0]
                ? args[0]
                : event.senderID;

        if (isNaN(uid))
            return api.sendMessage(
                "UID không hợp lệ",
                event.threadID,
                event.messageID
            );

        const res = await axios.get(
            `https://golike.com.vn/func-api.php?user=${uid}`
        );

        if (!res.data || res.data.status != 200) {
            return api.sendMessage(
                "Không tìm thấy thông tin tài khoản",
                event.threadID,
                event.messageID
            );
        }

        const date = res.data.data.date.replace(" ", " | ");

        api.sendMessage(
            `=== [ NGÀY TẠO ACC FACEBOOK ] ===\n\n` +
            `UID: ${uid}\n` +
            `Ngày tạo: ${date}`,
            event.threadID,
            event.messageID
        );

    } catch (e) {

        console.log(e);

        api.sendMessage(
            "API lỗi hoặc không thể lấy dữ liệu",
            event.threadID,
            event.messageID
        );
    }
};