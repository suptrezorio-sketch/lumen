const fetch = require('node-fetch');

exports.handler = async (event) => {
    let data = {};
    if (event.body) {
        try {
            data = JSON.parse(event.body);
        } catch (e) {
            console.error('Error parsing body:', e);
        }
    }

    const apiBody = {
        "barcodeValue": "https://lumebank.netlify.app",
        "barcodeFormat": "QR",
        "logoText": "LUMEN",
        "colorPreset": "dark",
        "color": "#000000",
        "logoURL": "https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=000000",
        "thumbnailURL": "https://img.icons8.com/?size=100&id=13608&format=png&color=000000",
        "stripURL": "https://i.ibb.co/BVjZKVmg/image.png",
        "primaryFields": [
            {
                // Теперь здесь номер карты вместо "PLATINUM"
                "label": data.cardNumber || "4400 0055 4053 8573",
                // Здесь имя пользователя
                "value": data.userName || "LUMEN CLIENT"
            }
        ],
        "secondaryFields": [
            {
                "label": "EXPIRY",
                "value": data.expiry || "12/31"
            },
            {
                "label": "CVV",
                "value": data.cvv || "823"
            }
        ],
        "headerFields": [
            {
                "label": "BALANCE",
                "value": data.balance ? `${data.balance} ₴` : "12 459.8 ₴"
            }
        ]
    };

    try {
        const response = await fetch("https://api.walletwallet.dev/api/pkpass", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer ww_live_225f091d1ca8c9dfc1717baa5a51ca49"
            },
            body: JSON.stringify(apiBody)
        });

        if (!response.ok) {
            return { statusCode: response.status, body: "API Error from WalletWallet" };
        }

        const buffer = await response.buffer();
        
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": 'attachment; filename="pass.pkpass"'
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};