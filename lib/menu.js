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

Criador:
-❥ *${prefix}sticker*
-❥ *${prefix}stickergif*
-❥ *${prefix}caderno*

Download:
-❥ *${prefix}ytmus*
└Baixe áudio do Youtube
-❥ *${prefix}ytvid*
└Baixe vídeos do Youtube
-❥ *${prefix}twimg*
└Baixe Fotos Do Twitter
-❥ *${prefix}twvid*
Baixe vídeos do twitter
(Não baixe recursos estranhos do Twitter)

(EM BREVE, IREI ATUALIZAR O BOT, COLOCANDO COMANDOS NOVOS!)

BY : wa.me/5513997473691
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
