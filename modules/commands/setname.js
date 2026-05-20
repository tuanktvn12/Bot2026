module.exports.config = {
    name: "setname",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "TrúcCute + fix",
    description: "Đổi biệt danh",
    commandCategory: "Bổ não",
    usages: "[tag/reply] + [name]",
    cooldowns: 5
};

module.exports.run = async function ({
    api,
    event,
    args,
    Users
}) {

    try {

        const {
            threadID,
            messageReply,
            senderID,
            mentions,
            type
        } = event;

        const delayUnsend = 60;

        // reply người khác
        if (type === "message_reply") {

            const uid = messageReply.senderID;
            const newName = args.join(" ").trim();

            const oldName =
                await Users.getNameUser(uid);

            await api.changeNickname(
                newName,
                threadID,
                uid
            );

            return api.sendMessage(
                `✅ Đã đổi tên của ${oldName} thành ${newName || "tên gốc"}`,
                threadID,
                (err, info) => {
                    setTimeout(() => {
                        api.unsendMessage(info.messageID);
                    }, delayUnsend * 1000);
                }
            );
        }

        // tag người khác
        const mention = Object.keys(mentions || {})[0];

        if (mention) {

            let newName = args
                .join(" ")
                .replace(mentions[mention], "")
                .trim();

            const oldName =
                await Users.getNameUser(mention);

            await api.changeNickname(
                newName,
                threadID,
                mention
            );

            return api.sendMessage(
                `✅ Đã đổi tên của ${oldName} thành ${newName || "tên gốc"}`,
                threadID,
                (err, info) => {
                    setTimeout(() => {
                        api.unsendMessage(info.messageID);
                    }, delayUnsend * 1000);
                }
            );
        }

        // đổi tên bản thân
        const newName = args.join(" ").trim();

        await api.changeNickname(
            newName,
            threadID,
            senderID
        );

        return api.sendMessage(
            `✅ Đã đổi tên của bạn thành ${newName || "tên gốc"}`,
            threadID,
            (err, info) => {
                setTimeout(() => {
                    api.unsendMessage(info.messageID);
                }, delayUnsend * 1000);
            }
        );

    } catch (e) {

        console.log(e);

        return api.sendMessage(
            "❌ Không thể đổi biệt danh",
            event.threadID
        );
    }
};