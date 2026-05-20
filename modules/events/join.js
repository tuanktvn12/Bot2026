module.exports.config = {
	name: "joinNoti",
	eventType: ["log:subscribe"],
	version: "2.0.0",
	credits: "Fix by ChatGPT",
	description: "Thông báo vào nhóm (đã tối ưu)",
	dependencies: {
		"fs-extra": ""
	}
};

module.exports.onLoad = async () => {
	const { join } = global.nodemodule["path"];
	const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
	const { downloadFile } = global.utils;

	const path = join(__dirname, "cache", "joinGif");
	const pathGif = join(path, "join.gif");

	if (!existsSync(path)) mkdirSync(path, { recursive: true });
	if (!existsSync(pathGif)) {
		await downloadFile("https://i.imgur.com/bvLe7or.gif", pathGif);
	}
};

module.exports.run = async function ({ api, event, Users }) {
	try {
		const { threadID } = event;
		const { join } = global.nodemodule["path"];
		const fs = global.nodemodule["fs-extra"];

		// ===== BOT VÀO =====
		if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
			api.changeNickname(
				`▹ ${global.config.PREFIX} ◃ → ${global.config.BOTNAME || "Bot"}`,
				threadID,
				api.getCurrentUserID()
			);

			return api.sendMessage({
				body: "✅ Bot đã vào nhóm!",
				attachment: fs.createReadStream(__dirname + "/cache/joinGif/join.gif")
			}, threadID);
		}

		// ===== LẤY DATA =====
		const { threadName, participantIDs } = await api.getThreadInfo(threadID);
		const threadData = global.data.threadData.get(parseInt(threadID)) || {};

		const path = join(__dirname, "cache", "joinGif");
		const pathGif = join(path, "join.gif");

		let names = [];
		let mentions = [];

		for (let user of event.logMessageData.addedParticipants) {
			const id = user.userFbId;
			const name = user.fullName;

			names.push(name);
			mentions.push({ tag: name, id });

			// lưu user nếu chưa có
			if (!global.data.allUserID.includes(id)) {
				await Users.createData(id, { name, data: {} });
				global.data.userName.set(id, name);
				global.data.allUserID.push(id);
			}
		}

		// ===== MESSAGE =====
		let msg = threadData.customJoin || `👋 Xin chào ${names.join(", ")}`;

		let formPush = {
			body: msg,
			mentions
		};

		// ===== GIF =====
		if (fs.existsSync(pathGif)) {
			formPush.attachment = fs.createReadStream(pathGif);
		}

		return api.sendMessage(formPush, threadID);

	} catch (e) {
		console.log("joinNoti lỗi:", e);
	}
};