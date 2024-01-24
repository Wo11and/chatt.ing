export class encryptedCommunications {
    convertFromBase64SymmetricKey = async (keyBase64) => {
        const keyBufferDecoded = new Uint8Array(
            atob(keyBase64)
                .split("")
                .map((char) => char.charCodeAt(0))
        );
        const keyDecoded = await crypto.subtle.importKey(
            "raw",
            keyBufferDecoded,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        return keyDecoded;
    };

    encryptSymmetric = async (messageObject) => {
        const symmetricKey = this.convertFromBase64SymmetricKey(
            process.env.ENCRYPTION_SYMMETRIC_KEY
        );

        const encoder = new TextEncoder();
        const content = encoder.encode(messageObject.content);
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation included (this is [0,0,0,..])
            },
            symmetricKey,
            content
        );
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: encryptedContent,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
        };
    };

    decryptSymmetric = async (messageObject, iv) => {
        const symmetricKey = this.convertFromBase64SymmetricKey(
            process.env.ENCRYPTION_SYMMETRIC_KEY
        );
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation
            },
            symmetricKey,
            messageObject.content
        );
        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedBuffer);
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: decryptedMessage,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
        };
    };
}
