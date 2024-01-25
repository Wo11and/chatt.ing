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

    encryptSymmetric = async (messageObject) => {
        const symmetricKey = await this.convertFromBase64SymmetricKey(
            frontendAddress
        );

        const stringifiedMessageObject = JSON.stringify(messageObject);

        const encoder = new TextEncoder();
        const encodedMessageObject = encoder.encode(stringifiedMessageObject);
        const encryptedMessageObject = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation included (this is [0,0,0,..])
            },
            symmetricKey,
            encodedMessageObject
        );
        return encryptedMessageObject;
    };

    decryptSymmetric = async (encryptedMessageObject) => {
        const symmetricKey = await this.convertFromBase64SymmetricKey(
            frontendAddress
        );
        const decryptedMessageBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(12), // No randomisation
            },
            symmetricKey,
            encryptedMessageObject
        );
        const decoder = new TextDecoder();
        const decryptedMessageString = decoder.decode(decryptedMessageBuffer);
        const message = JSON.parse(decryptedMessageString);
        console.log(message);

        return message;
    };
}
