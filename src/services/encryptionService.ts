import CryptoJS from 'crypto-js';

const SECRET_KEY = "128bl3$$1ng$";
const SALT       = "bl3$$1ng$128";

// ── Derive Key + IV once, cache it so we never re-run PBKDF2 ──
let cached: { key: CryptoJS.lib.WordArray; iv: CryptoJS.lib.WordArray } | null = null;

function getKeyAndIV() {
    if (cached) return cached;

    const saltBytes = CryptoJS.enc.Utf16LE.parse(SALT);

    const derived = CryptoJS.PBKDF2(SECRET_KEY, saltBytes, {
        keySize: 12,          // 12 words = 48 bytes (16 IV + 32 Key)
        iterations: 1000,
        hasher: CryptoJS.algo.SHA1,
    });

    // C# stream order: IV first (4 words / 16 bytes), then Key (8 words / 32 bytes)
    cached = {
        iv:  CryptoJS.lib.WordArray.create(derived.words.slice(0, 4)),
        key: CryptoJS.lib.WordArray.create(derived.words.slice(4, 12)),
    };

    return cached;
}

export const decryptData = (cipherText: string): string => {
    if (!cipherText || cipherText === "string") return "";

    try {
        const { key, iv } = getKeyAndIV();

        const cleanedInput = cipherText.trim().replace(/\s/g, '+');

        const decrypted = CryptoJS.AES.decrypt(cleanedInput, key, {
            iv:      iv,
            mode:    CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf16LE);

    } catch (error) {
        console.error("Decryption Error:", error);
        return "";
    }
};