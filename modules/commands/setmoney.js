module.exports.config = {
    name: "setmoney",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "CatalizCS",
    description: "Điều chỉnh thông tin của người dùng",
    commandCategory: "game",
    usages: "[add/all/set/clean] [Số tiền] [Tag người dùng/reply]",
    cooldowns: 5
};

module.exports.run = async function ({ event, api, Currencies, args,Users }) {
    const { threadID, messageID, senderID, messageReply } = event;
   
    const { throwError } = global.utils;
    const { increaseMoney, decreaseMoney, getData } = Currencies;
   const mentionID = Object.keys(event.mentions);
    const money = parseInt(args[1]);
  
    var message = [];
    var error = [];

    switch (args[0]) {
        case "add": {
          if (event.type == "message_reply") {
            var name = (await Users.getData(event.messageReply.senderID)).name;
          await Currencies.increaseMoney(event.messageReply.senderID, money); console.log("done");
   
          return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ${money} 𝐜𝐡𝐨 ${name}` ,event.threadID)      
            
          } else if (mentionID.length != 0) {
                for (singleID of mentionID) {
                if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
                try {
                    await Currencies.increaseMoney(singleID, money);
                    message.push(singleID);
                } catch (e) { error.push(e); console.log(e) };
                }
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 ${money}$ 𝐜𝐡𝐨 ${message.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐡𝐞̂̉ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 ${error.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID) }, messageID);
            } else {
                if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
                try {
                await Currencies.increaseMoney(senderID, money);
                message.push(senderID);
                } catch (e) { error.push(e) };
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 ${money}$ 𝐜𝐡𝐨 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐡𝐞̂̉ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧`, threadID) }, messageID);
            }
        }

        case "set": {
            if (mentionID.length != 0) {
                for (singleID of mentionID) {
                if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
                try {
                    await Currencies.setData(singleID, { money });
                    message.push(singleID);
                } catch (e) { error.push(e) };
                }
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐬𝐞𝐭 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ${money}𝐕𝐍Đ 𝐜𝐡𝐨 ${message.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐬𝐞𝐭 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 ${error.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID) }, messageID);
            } else if (args[2]) {
                if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
                try {
                await Currencies.setData(args[2], { money });
                message.push(args[2]);
                } catch (e) { error.push(e) };
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲] Đ𝐚̃ 𝐬𝐞𝐭 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ${money}𝐕𝐍Đ 𝐜𝐡𝐨 ${message.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐬𝐞𝐭 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 ${error.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID) }, messageID);
            }
            else {
                if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
                try {
                await Currencies.setData(senderID, { money });
                message.push(senderID);
                } catch (e) { error.push(e) };
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐬𝐞𝐭 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ${money}𝐕𝐍Đ 𝐜𝐡𝐨 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐬𝐞𝐭 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧!`, threadID) }, messageID);
            }
        }

        case "clean": {
            if (mentionID.length != 0) {
                for (singleID of mentionID) {
                try {
                    await Currencies.setData(singleID, { money: 0 });
                    message.push(singleID);
                } catch (e) { error.push(e) };
            }
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐱𝐨́𝐚 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 𝐭𝐨𝐚̀𝐧 𝐛𝐨̣̂ 𝐭𝐢𝐞̂̀𝐧 𝐜𝐮̉𝐚 ${message.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸]  𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐱𝐨́𝐚 𝐭𝐨𝐚̀𝐧 𝐛𝐨̣̂ 𝐭𝐢𝐞̂̀𝐧 𝐜𝐮̉𝐚 ${error.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID) }, messageID);
            } else {
                try {
                await Currencies.setData(senderID, { money: 0 });
                message.push(senderID);
                } catch (e) { error.push(e) };
                return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐱𝐨́𝐚 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 𝐭𝐢𝐞̂̀𝐧 𝐜𝐮̉𝐚 𝐜𝐡𝐨 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸]  𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐱𝐨́𝐚 𝐭𝐨𝐚̀𝐧 𝐛𝐨̣̂ 𝐭𝐢𝐞̂̀𝐧 𝐜𝐮̉𝐚 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧!`, threadID) }, messageID);
            }
        }
        
        case "all": {
           var name = (await Users.getData(event.senderID)).name
            if(!args[1]) return api.sendMessage("[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐂𝐡𝐮̛𝐚 𝐧𝐡𝐚̣̂𝐩 𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧", threadID, messageID);
            if(isNaN(args[1])) return api.sendMessage("[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐬𝐨̂́", threadID, messageID);
            if(args[1] > 1000000000) return api.sendMessage("[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐩𝐡𝐚̉𝐢 𝐧𝐡𝐨̉ 𝐡𝐨̛𝐧 𝟏𝟎𝟎𝟎𝟎𝟎𝟎𝟎𝟎𝟎", threadID, messageID);
            let { participantIDs } = await api.getThreadInfo(threadID);
            for(let i of participantIDs) {
                try {
                    await increaseMoney(parseInt(i), parseInt(args[1]));
                    message.push(i);
                } catch(e) { error.push(e) }
            }
            return api.sendMessage(`${name} Đ𝐚̃ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 ${args[1]}𝐕𝐍Đ 𝐜𝐡𝐨 ${message.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢`, threadID, function () { if (error.length != 0) return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 𝐭𝐢𝐞̂̀𝐧 𝐜𝐡𝐨 ${error.length} 𝐧𝐠𝐮̛𝐨̛̀𝐢!`, threadID) }, messageID);
        }

        case "uid": {
           var id = args[1];
		var cut = args[2];
		let nameeee = (await Users.getData(id)).name
		   return api.sendMessage(`[🌸𝐌𝐨𝐧𝐞𝐲🌸] Đ𝐚̃ 𝐜𝐨̣̂𝐧𝐠 𝐭𝐡𝐞̂𝐦 ${nameeee} 𝐭𝐡𝐚̀𝐧𝐡 ${cut} 𝐕𝐍Đ`, event.threadID, () => Currencies.increaseMoney(id, parseInt(cut)), event.messageID)	
          }
        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
}