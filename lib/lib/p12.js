"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToPem = void 0;
var forge = require("node-forge");
function convertToPem(p12base64, password) {
    var p12Asn1 = forge.asn1.fromDer(p12base64);
    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
    var pemKey = getKeyFromP12(p12, password);
    var _a = getCertificateFromP12(p12), pemCertificate = _a.pemCertificate, commonName = _a.commonName;
    return { pemKey: pemKey, pemCertificate: pemCertificate, commonName: commonName };
}
exports.convertToPem = convertToPem;
function getKeyFromP12(p12, password) {
    var keyData = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }, password);
    var pkcs8Key = keyData[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    if (typeof pkcs8Key === 'undefined') {
        pkcs8Key = keyData[forge.pki.oids.keyBag][0];
    }
    if (typeof pkcs8Key === 'undefined') {
        throw new Error('Unable to get private key.');
    }
    var pemKey = forge.pki.privateKeyToPem(pkcs8Key.key);
    //pemKey = pemKey.replace(/\r\n/g, '');
    return pemKey;
}
function getCertificateFromP12(p12) {
    var certData = p12.getBags({ bagType: forge.pki.oids.certBag });
    var certificate = certData[forge.pki.oids.certBag][0];
    var pemCertificate = forge.pki.certificateToPem(certificate.cert);
    //pemCertificate = pemCertificate.replace(/\r\n/g, '');
    var commonName = certificate.cert.subject.attributes[0].value;
    return { pemCertificate: pemCertificate, commonName: commonName };
}
