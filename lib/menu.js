const fs = require('fs-extra')
const { 
    prefix
} = JSON.parse(fs.readFileSync('./settings/setting.json'))

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

exports.textTnC = () => {
    return `
`
}

/*

Dimohon untuk tidak menghapus link github saya, butuh support dari kalian! makasih.

*/

exports.textMenu = (pushname) => {
    return `
opaaa, ${pushname}! 👋️

Sticker:
-❥ *${prefix}sticker*
-❥ *${prefix}stickergif*
-❥ *${prefix}caderno*
-
`
}

/*



*/

exports.textAdmin = () => {
    return `

`
}

/*



*/

exports.textDonasi = () => {
    return `
`
}
