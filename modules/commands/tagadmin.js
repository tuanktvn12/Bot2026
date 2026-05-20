const fs = require("fs");
const moment = require("moment-timezone");

module.exports.config = {
    name: "tagadmin",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "fixed by ChatGPT",
    description: "Tag admin và phản hồi",
    commandCategory: "ADMIN",
    usages: "[on/off]",
    cooldowns: 5
};

module.exports.handleReply = async function ({
    api,
    event,
    handleReply,
    Users,
    Threads
}) {
    const { threadID, messageID, body, senderID } = event;

    if (!body) return;

    switch (handleReply.type) {

        case "tagadmin": {
            let name;

            try {
                name = await Users.getNameUser(senderID);
            } catch {
                name = "Admin";
            }

            api.sendMessage(
                `❖ -- [ FEEDBACK FROM ADMIN ] -- ❖\n\n✎ Nội dung: ${body}\n👤 Từ Admin: ${name}\n⏰ Time: ${moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss")}`,
                handleReply.threadID,
                (err, info) => {
                    if (err) return console.log(err);

                    global.client.handleReply.push({
                        name: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        messID: messageID,
                        threadID: threadID
                    });
                },
                handleReply.messID
            );

            break;
        }

        case "reply": {
            let name = "Người dùng";

            try {
                const user = await api.getUserInfoV2(senderID);
                name = user.name || "Người dùng";
            } catch (e) {}

            let threadName = "Unknown";

            try {
                threadName = (await Threads.getInfo(threadID)).threadName;
            } catch (e) {}

            api.sendMessage(
                `❖ -- [ FEEDBACK FROM USER ] -- ❖\n\n✎ Nội dung: ${body}\n👤 Từ: ${name}\n📌 Box: ${threadName}\n⏰ Time: ${moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss")}`,
                handleReply.threadID,
                (err, info) => {
                    if (err) return console.log(err);

                    global.client.handleReply.push({
                        name: this.config.name,
                        type: "tagadmin",
                        messageID: info.messageID,
                        messID: messageID,
                        threadID: threadID
                    });
                },
                handleReply.messID
            );

            break;
        }
    }
};

module.exports.handleEvent = async function ({
    api,
    event
}) {
    const { threadID, body, mentions, senderID, messageID } = event;

    if (!body) return;

    const path = __dirname + "/cache/tagadmin.json";

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}, null, 4));
    }

    let data = JSON.parse(fs.readFileSync(path));

    if (data[threadID] === undefined) {
        data[threadID] = true;
    }

    if (!data[threadID]) return;

    if (!mentions || Object.keys(mentions).length === 0) return;

    const mentionIDs = Object.keys(mentions);
    const allAdmin = global.config.ADMINBOT || [];

    for (const uid of mentionIDs) {

        if (uid == api.getCurrentUserID()) continue;

        if (allAdmin.includes(uid)) {

            let userName = "User";
            let threadName = "Group";

            try {
                const threadInfo = await api.getThreadInfo(threadID);

                const user = threadInfo.userInfo.find(
                    i => i.id == senderID
                );

                userName = user?.name || "User";
                threadName = threadInfo.threadName || "Group";

            } catch (e) {}

            api.sendMessage(
                `🫠 == [ TAG ADMIN ] == 🫠\n\n👤 User: ${userName}\n📌 Box: ${threadName}\n✎ Nội dung: ${body}\n⏰ Time: ${moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss")}`,
                uid,
                (err, info) => {

                    if (err) return console.log(err);

                    global.client.handleReply.push({
                        name: this.config.name,
                        type: "tagadmin",
                        messageID: info.messageID,
                        messID: messageID,
                        author: uid,
                        threadID: threadID
                    });
                }
            );
        }
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};

module.exports.run = async function ({
    api,
    event,
    args
}) {

    const { threadID } = event;

    const path = __dirname + "/cache/tagadmin.json";

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}, null, 4));
    }

    let data = JSON.parse(fs.readFileSync(path));

    if (data[threadID] === undefined) {
        data[threadID] = true;
    }

    if (args[0] == "off") {
        data[threadID] = false;
    }

    else if (args[0] == "on") {
        data[threadID] = true;
    }

    else {
        return api.sendMessage(
            "Dùng: tagadmin on/off",
            threadID
        );
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 4));

    return api.sendMessage(
        `✅ Tag Admin đã được ${data[threadID] ? "bật" : "tắt"}`,
        threadID
    );
};