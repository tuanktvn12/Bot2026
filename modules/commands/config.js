module.exports.config = {
  name: "config",
  version: "2.1.0",
  hasPermssion: 2,
  credits: "NTKhang + Fix",
  description: "Config bot Messenger",
  commandCategory: "admin",
  cooldowns: 5
};

const axios = require("axios");

module.exports.languages = {
  vi: {},
  en: {}
};

module.exports.handleReply = async function ({ api, event, handleReply }) {

  const { threadID, messageID, senderID, body } = event;

  if (senderID != handleReply.author) return;

  const reply = (msg, callback) => {
    if (callback) {
      return api.sendMessage(msg, threadID, callback, messageID);
    }
    return api.sendMessage(msg, threadID, messageID);
  };

  switch (handleReply.type) {

    case "menu": {

      const choose = body.trim();

      // ĐỔI BIO
      if (choose == "1") {
        return reply("Reply bio mới của bot", (err, info) => {
          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "changeBio"
          });
        });
      }

      // ĐỔI AVATAR
      if (choose == "2") {
        return reply("Reply ảnh hoặc link ảnh để đổi avatar bot", (err, info) => {
          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "changeAvatar"
          });
        });
      }

      // XEM PENDING
      if (choose == "3") {

        const pending = await api.getThreadList(100, null, ["PENDING"]);

        let msg = "";

        for (const i of pending) {
          msg += `• ${i.name}\nTID: ${i.threadID}\n\n`;
        }

        if (!msg) msg = "Không có box pending";

        return reply(msg);
      }

      // XEM UNREAD
      if (choose == "4") {

        const unread = await api.getThreadList(100, null, ["unread"]);

        let msg = "";

        for (const i of unread) {
          msg += `• ${i.name}\nTID: ${i.threadID}\n\n`;
        }

        if (!msg) msg = "Không có tin chưa đọc";

        return reply(msg);
      }

      // BLOCK
      if (choose == "5") {

        return reply("Reply UID cần block", (err, info) => {

          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "blockUser"
          });

        });

      }

      // UNBLOCK
      if (choose == "6") {

        return reply("Reply UID cần unblock", (err, info) => {

          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "unBlockUser"
          });

        });

      }

      // GỬI TIN NHẮN
      if (choose == "7") {

        return reply("Reply UID người nhận", (err, info) => {

          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "sendMessageUID"
          });

        });

      }

      // LOGOUT
      if (choose == "8") {

        api.logout(err => {

          if (err) return reply("Logout thất bại");

          reply("Đã logout bot");

        });

      }

      // KHIÊN AVATAR
      if (choose == "9") {

        return reply("Reply on hoặc off", (err, info) => {

          global.client.handleReply.push({
            name: module.exports.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "shieldAvatar"
          });

        });

      }

      break;
    }

    // ĐỔI BIO
    case "changeBio": {

      const bio = body || "";

      api.changeBio(bio, false, err => {

        if (err) return reply("Đổi bio thất bại");

        reply(`Đã đổi bio bot thành:\n${bio}`);

      });

      break;
    }

    // ĐỔI AVATAR
    case "changeAvatar": {

      let imgUrl;

      if (event.attachments[0] && event.attachments[0].type == "photo") {
        imgUrl = event.attachments[0].url;
      }
      else if (body.startsWith("http")) {
        imgUrl = body;
      }
      else {
        return reply("Vui lòng reply ảnh hoặc link ảnh");
      }

      try {

        const img = (await axios.get(imgUrl, {
          responseType: "stream"
        })).data;

        const form = {
          avatar: img
        };

        api.changeAvatar(form, err => {

          if (err) return reply("Đổi avatar thất bại");

          reply("Đổi avatar bot thành công");

        });

      }
      catch (e) {

        reply("Không thể tải ảnh");

      }

      break;
    }

    // BLOCK USER
    case "blockUser": {

      const uid = body.trim();

      try {

        await api.changeBlockedStatus(uid, true);

        reply(`Đã block ${uid}`);

      }
      catch {

        reply("Block thất bại");

      }

      break;
    }

    // UNBLOCK USER
    case "unBlockUser": {

      const uid = body.trim();

      try {

        await api.changeBlockedStatus(uid, false);

        reply(`Đã unblock ${uid}`);

      }
      catch {

        reply("Unblock thất bại");

      }

      break;
    }

    // NHẬP UID GỬI TIN NHẮN
    case "sendMessageUID": {

      const uid = body.trim();

      return reply("Reply nội dung muốn gửi", (err, info) => {

        global.client.handleReply.push({
          name: module.exports.config.name,
          author: senderID,
          messageID: info.messageID,
          type: "sendMessageContent",
          uid
        });

      });

    }

    // GỬI TIN NHẮN
    case "sendMessageContent": {

      try {

        await api.sendMessage(body, handleReply.uid);

        reply(`Đã gửi tin nhắn tới ${handleReply.uid}`);

      }
      catch {

        reply("Gửi thất bại");

      }

      break;
    }

    // KHIÊN AVATAR
    case "shieldAvatar": {

      const mode = body.toLowerCase();

      if (!["on", "off"].includes(mode)) {
        return reply("Chỉ dùng on hoặc off");
      }

      const form = {
        av: api.getCurrentUserID(),
        variables: JSON.stringify({
          "0": {
            is_shielded: mode == "on",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.floor(Math.random() * 999999).toString()
          }
        }),
        doc_id: "1477043292367183"
      };

      api.httpPost(
        "https://www.facebook.com/api/graphql/",
        form,
        (err, data) => {

          try {

            const res = JSON.parse(data);

            if (err || res.errors) {
              return reply("Bật/tắt khiên thất bại");
            }

            reply(`Đã ${mode == "on" ? "bật" : "tắt"} khiên avatar bot`);

          }
          catch {

            reply("Có lỗi xảy ra");

          }

        }
      );

      break;
    }

  }

};

module.exports.run = async function ({ api, event }) {

  const { threadID, messageID, senderID } = event;

  const msg =
`⚙️ CONFIG BOT ⚙️

[1] Đổi bio bot
[2] Đổi avatar bot
[3] Xem pending
[4] Xem unread
[5] Block user
[6] Unblock user
[7] Gửi tin nhắn bằng UID
[8] Logout bot
[9] Bật/Tắt khiên avatar

━━━━━━━━━━━━━━━
Bot ID: ${api.getCurrentUserID()}
━━━━━━━━━━━━━━━

Reply số để chọn`;

  api.sendMessage(msg, threadID, (err, info) => {

    global.client.handleReply.push({
      name: module.exports.config.name,
      author: senderID,
      messageID: info.messageID,
      type: "menu"
    });

  }, messageID);

};