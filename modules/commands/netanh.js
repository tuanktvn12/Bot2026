const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
const FormData = require("form-data");

module.exports.config = {
    name: "netanh",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "fixed by ChatGPT",
    description: "Làm nét ảnh",
    commandCategory: "THÀNH VIÊN",
    usages: "[reply ảnh/link ảnh]",
    cooldowns: 5
};

module.exports.onLoad = () => {

    const dir = __dirname + "/noprefix/";
    const cache = __dirname + "/cache/";

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache, { recursive: true });
    }

    if (!fs.existsSync(dir + "tpkh.jpeg")) {
        request(
            "https://i.imgur.com/dlgbY3k.jpeg"
        ).pipe(
            fs.createWriteStream(dir + "tpkh.jpeg")
        );
    }
};

function base64_encode(path) {
    try {
        return fs.readFileSync(path, {
            encoding: "base64"
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports.run = async function ({
    api,
    event,
    args
}) {

    try {

        let imageUrl;

        // reply ảnh
        if (
            event.type === "message_reply" &&
            event.messageReply.attachments &&
            event.messageReply.attachments[0]
        ) {

            imageUrl = event.messageReply.attachments[0].url;

        }

        // link ảnh
        else if (args[0]) {

            imageUrl = args[0];

        }

        else {

            return api.sendMessage(
                "⚠️ Reply ảnh hoặc nhập link ảnh",
                event.threadID,
                event.messageID
            );
        }

        const imgPath =
            __dirname +
            `/cache/${event.senderID}.png`;

        // tải ảnh
        const getImg = (
            await axios.get(imageUrl, {
                responseType: "arraybuffer"
            })
        ).data;

        fs.writeFileSync(imgPath, Buffer.from(getImg));

        // encode base64
        const base64 = base64_encode(imgPath);

        if (!base64) {
            return api.sendMessage(
                "❌ Không thể đọc ảnh",
                event.threadID,
                event.messageID
            );
        }

        // upscale
        const upscale = await axios.post(
            "https://upscaler.zyro.com/v1/ai/image-upscaler",
            {
                image_data:
                    "data:image/jpeg;base64," + base64
            },
            {
                headers: {
                    "content-type": "application/json"
                },
                timeout: 60000
            }
        );

        const upscaled = upscale.data.upscaled;

        if (!upscaled) {
            return api.sendMessage(
                "❌ API upscale lỗi",
                event.threadID,
                event.messageID
            );
        }

        // upload catbox
        const form = new FormData();

        form.append(
            "fileToUpload",
            Buffer.from(
                upscaled.replace(
                    /^data:image\/\w+;base64,/,
                    ""
                ),
                "base64"
            ),
            {
                filename: "upscaled.jpg",
                contentType: "image/jpeg"
            }
        );

        form.append("reqtype", "fileupload");

        const upload = await axios.post(
            "https://catbox.moe/user/api.php",
            form,
            {
                headers: form.getHeaders(),
                timeout: 60000
            }
        );

        const link = upload.data;

        api.sendMessage(
            {
                body:
`🖨️====「 NÉT ẢNH 」====🖨️
━━━━━━━━━━━━━━━━━━
✅ Đã làm nét ảnh thành công

🔗 Link ảnh:
${link}

📥 Muốn tải:
Mở link → giữ ảnh → tải xuống`,
                attachment: fs.createReadStream(
                    __dirname +
                    "/noprefix/tpkh.jpeg"
                )
            },
            event.threadID,
            () => {
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            },
            event.messageID
        );

    } catch (e) {

        console.log(e);

        return api.sendMessage(
            "❌ Có lỗi xảy ra khi xử lý ảnh",
            event.threadID,
            event.messageID
        );
    }
};