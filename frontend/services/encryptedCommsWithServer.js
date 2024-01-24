const frontendAddress = import.meta.env.VITE_ENCRYPTION_SYMMETRIC_KEY;

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

    encryptToken = async (token) => {
        const encoder = new TextEncoder();
        const encodedToken = encoder.encode(token);
        const encryptedToken = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation
            },
            symmetricKey,
            encodedToken
        );
        return encryptedToken;
    };

    decryptToken = async (encryptedToken) => {
        const decryptedTokenBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12),
            },
            symmetricKey,
            encryptedToken
        );

        const decoder = new TextDecoder();
        const decryptedToken = decoder.decode(decryptedTokenBuffer);
        return decryptedToken;
    };

    encryptSymmetric = async (messageObject) => {
        const symmetricKey = await this.convertFromBase64SymmetricKey(
            frontendAddress
        );

        const encoder = new TextEncoder();
        const encodedContent = encoder.encode(messageObject.content);
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation included (this is [0,0,0,..])
            },
            symmetricKey,
            encodedContent
        );
        const encryptedToken = await this.encryptToken(messageObject.token);
        return {
            from: messageObject.from,
            to: messageObject.to,
            content: encryptedContent,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
            token: encryptedToken,
        };
    };

    decryptSymmetric = async (messageObject) => {
        const symmetricKey = await this.convertFromBase64SymmetricKey(
            frontendAddress
        );
        const decryptedContentBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation
            },
            symmetricKey,
            messageObject.content
        );
        const decoder = new TextDecoder();
        const decryptedContent = decoder.decode(decryptedContentBuffer);
        const decryptedToken = await this.decryptToken(messageObject.token);

        return {
            from: messageObject.from,
            to: messageObject.to,
            content: decryptedContent,
            createdAt: messageObject.createdAt,
            type: messageObject.type,
            token: decryptedToken,
        };
    };
}
