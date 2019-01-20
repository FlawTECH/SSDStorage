const crypto = require('crypto')
const algorithm = 'aes-256-cbc';
const encryptionSecret = '<3Nas-2018';

function encrypt(fileName) {
    var cipher = crypto.createCipher(algorithm, encryptionSecret)
    var crypted = cipher.update(fileName, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(fileName) {
    var decipher = crypto.createDecipher(algorithm, encryptionSecret)
    var dec = decipher.update(fileName,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    encrypt,
    decrypt
}
