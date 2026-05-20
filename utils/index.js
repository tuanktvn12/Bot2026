const axios = require("axios");
const fs = require("fs-extra");
const crypto = require("crypto");
const os = require("os");
const assets = require("@miraipr0ject/assets");

// ================== YOUTUBE ==================
module.exports.getYoutube = async function (query, type, mode) {
    try {
        if (type === "search") {
            const yts = require("youtube-search-api");
            if (!query) return [];
            const res = await yts.GetListByKeyword(query, false, 6);
            return res.items || [];
        }

        if (type === "getLink") {
            const res = await axios.post(
                "https://aiovideodl.ml/wp-json/aio-dl/video-data/",
                { url: `https://www.youtube.com/watch?v=${query}` }
            );

            const data = res.data;
            const medias = data.medias || [];

            if (mode === "video") {
                return {
                    title: data.title,
                    duration: data.duration,
                    download: {
                        SD: medias[1]?.url || null,
                        HD: medias[2]?.url || null
                    }
                };
            }

            if (mode === "audio") {
                return {
                    title: data.title,
                    duration: data.duration,
                    download: medias[3]?.url || null
                };
            }
        }

        return null;
    } catch (e) {
        console.log("YouTube error:", e.message);
        return null;
    }
};

// ================== ERROR ==================
module.exports.throwError = function (command, threadID, messageID) {
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    return global.client.api.sendMessage(
        global.getText(
            "utils",
            "throwError",
            threadSetting.PREFIX || global.config.PREFIX,
            command
        ),
        threadID,
        messageID
    );
};

// ================== CLEAN HTML ==================
module.exports.cleanAnilistHTML = function (text) {
    if (!text) return "";
    return text
        .replace('<br>', '\n')
        .replace(/<\/?(i|em)>/g, '*')
        .replace(/<\/?b>/g, '**')
        .replace(/~!|!~/g, '||')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
};

// ================== DOWNLOAD FILE ==================
module.exports.downloadFile = async function (url, path) {
    try {
        const res = await axios({
            method: "GET",
            url,
            responseType: "stream"
        });

        const writer = fs.createWriteStream(path);
        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
            res.data.on("error", reject);
        });
    } catch (e) {
        console.log("Download error:", e.message);
        throw e;
    }
};

// ================== GET CONTENT ==================
module.exports.getContent = async function (url) {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (e) {
        console.log("GetContent error:", e.message);
        return null;
    }
};

// ================== RANDOM STRING ==================
module.exports.randomString = function (length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// ================== ASSETS ==================
module.exports.assets = {
    async font(name) {
        if (!assets.font.loaded) await assets.font.load();
        return assets.font.get(name);
    },
    async image(name) {
        if (!assets.image.loaded) await assets.image.load();
        return assets.image.get(name);
    },
    async data(name) {
        if (!assets.data.loaded) await assets.data.load();
        return assets.data.get(name);
    }
};

// ================== AES ==================
module.exports.AES = {
    encrypt(key, iv, data) {
        try {
            const k = Buffer.from(key).slice(0, 32);
            const i = Buffer.from(iv).slice(0, 16);

            const cipher = crypto.createCipheriv("aes-256-cbc", k, i);
            let encrypted = cipher.update(data);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            return encrypted.toString("hex");
        } catch (e) {
            console.log("AES encrypt error:", e.message);
            return null;
        }
    },

    decrypt(key, iv, encrypted) {
        try {
            const k = Buffer.from(key).slice(0, 32);
            const i = Buffer.from(iv).slice(0, 16);

            const decipher = crypto.createDecipheriv("aes-256-cbc", k, i);
            let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString();
        } catch (e) {
            console.log("AES decrypt error:", e.message);
            return null;
        }
    },

    makeIv() {
        return crypto.randomBytes(16).toString("hex").slice(0, 16);
    }
};

// ================== HOME DIR ==================
module.exports.homeDir = function () {
    const home = process.env["HOME"];
    const user = process.env["USER"] || process.env["USERNAME"];

    let returnHome;
    let typeSystem;

    switch (process.platform) {
        case "win32":
            returnHome = process.env.USERPROFILE || home;
            typeSystem = "win32";
            break;

        case "darwin":
            returnHome = home || `/Users/${user}`;
            typeSystem = "darwin";
            break;

        case "linux":
            returnHome = home || `/home/${user}`;
            typeSystem = "linux";
            break;

        default:
            returnHome = home || null;
            typeSystem = "unknown";
            break;
    }

    return [os.homedir(), typeSystem];
};