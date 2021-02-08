require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-automate')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const axios = require('axios')
const fetch = require('node-fetch')

const appRoot = require('app-root-path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db_group = new FileSync(appRoot+'/lib/data/group.json')
const db = low(db_group)
db.defaults({ group: []}).write()

const { 
    removeBackgroundFromImageBase64
} = require('remove.bg')

const {
    exec
} = require('child_process')

const { 
    menuId, 
    cekResi, 
    urlShortener, 
    meme, 
    translate, 
    getLocationData,
    images,
    resep,
    rugapoi,
    rugaapi,
    cariKasar
} = require('./lib')

const { 
    msgFilter, 
    color, 
    processTime, 
    isUrl
} = require('./utils')

const { uploadImages } = require('./utils/fetcher')

const fs = require('fs-extra')
const banned = JSON.parse(fs.readFileSync('./settings/banned.json'))
/* const simi = JSON.parse(fs.readFileSync('./settings/simi.json')) */
const ngegas = JSON.parse(fs.readFileSync('./settings/ngegas.json'))
const setting = JSON.parse(fs.readFileSync('./settings/setting.json'))

let { 
    ownerNumber, 
    groupLimit, 
    memberLimit,
    prefix
} = setting

const {
    apiNoBg,
/*	apiSimi */
} = JSON.parse(fs.readFileSync('./settings/api.json'))

function formatin(duit){
    let	reverse = duit.toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return ribuan;
}

const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].id == needle) return i;
    }
    return false;
}

module.exports = HandleMsg = async (pakforlay, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        var { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await pakforlay.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await pakforlay.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
		const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
		const pengirim = sender.id
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
		const argx = chats.slice(0).trim().split(/ +/).shift().toLowerCase()
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
	    const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
		
		// [IDENTIFY]
		const isOwnerBot = ownerNumber.includes(pengirim)
        const isBanned = banned.includes(pengirim)
	/*	const isSimi = simi.includes(chatId) */
		const isNgegas = ngegas.includes(chatId)
		const isKasar = await cariKasar(chats)

        // [BETA] Avoid Spam Message
        
        //
        if(!isCmd && isKasar && isGroupMsg) { console.log(color('[BADW]', 'orange'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${argx}`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }

        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

	// Filter Banned People
        if (isBanned) {
            return console.log(color('[BAN]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        }
		
        switch (command) {
        // Menu and TnC
       
        }

        // Sticker Creator
        case 'sticker':
        case 'stiker':
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                pakforlay.sendImageAsSticker(from, imageBase64)
                .then(() => {
                    pakforlay.reply(from, 'Aqui está seu adesivo')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                if (isMedia || isQuotedImage) {
                    try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/noBg.png'
                    var result = await removeBackgroundFromImageBase64({ base64img, apiKey: apiNoBg, size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await pakforlay.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                    } catch(err) {
                    console.log(err)
	   	            await pakforlay.reply(from, 'Desculpe, o limite de uso de hoje atingiu o máximo', id)
                    }
                }
            } else if (args.length === 1) {
                if (!isUrl(url)) { await pakforlay.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id) }
                pakforlay.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? pakforlay.sendText(from, 'Desculpe, o link que você enviou não contém uma imagem.')
                    : pakforlay.reply(from, 'Aqui está seu adesivo')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await pakforlay.reply(from, `Esta faltando mandar uma foto seu bct!`, id)
            }
            break
        case 'stickergif':
        case 'stikergif':
            if (isMedia || isQuotedVideo) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    var mediaData = await decryptMedia(message, uaOverride)
                    pakforlay.reply(from, '[WAIT] Em andamento⏳ aguarde ± 1 min!', id)
                    var filename = `./media/stickergif.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/stickergf.gif --fps=60 --scale=240:240`, async function (error, stdout, stderr) {
                        var gif = await fs.readFileSync('./media/stickergf.gif', { encoding: "base64" })
                        await pakforlay.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        .catch(() => {
                            pakforlay.reply(from, 'Maaf filenya terlalu besar!', id)
                        })
                    })
                  } else {
                    pakforlay.reply(from, `Video De Até 10S Macaco!`, id)
                   }
                } else {
		    pakforlay.reply(from, `Sua Puta!, Cade a porra do video para fazer a figurinha!`, id)
	        }
            break
	    case 'ttp1'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
	     case 'ttp2'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
	    case 'ttp3'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
	     case 'ttp4'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
	    case 'ttp5'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
	    case 'xvideos'
	    pakforlay.sendText(from, `ESSE COMANDO É PREMIUM PARA ESSE BOT`)
            break
        case 'caderno':
            if (args.length == 0) return pakforlay.reply(from, `Mande #caderno e escreva seu texto!`, id)
            const nulisq = body.slice(7)
            const nulisp = await rugaapi.tulis(nulisq)
            await pakforlay.sendImage(from, `${nulisp}`, '', 'AQUI VADIA!', id)
            .catch(() => {
                pakforlay.reply(from, 'ERRO FDP, SERVIDOR TA OFF!', id)
            }
            break

        //Islam Command
        //Media
	
			
        // Random Kata
        
        }
		/*
		// Simi-simi function
		if ((!isCmd && isGroupMsg && isSimi) && message.type === 'chat') {
			axios.get(`https://arugaz.herokuapp.com/api/simisimi?kata=${encodeURIComponent(message.body)}&apikey=${apiSimi}`)
			.then((res) => {
				if (res.data.status == 403) return pakforlay.sendText(ownerNumber, `${res.data.result}\n\n${res.data.pesan}`)
				pakforlay.reply(from, `Simi berkata: ${res.data.result}`, id)
			})
			.catch((err) => {
				pakforlay.reply(from, `${err}`, id)
			})
		}
		*/
		// Kata kasar function
		if(!isCmd && isGroupMsg && isNgegas) {
            const find = db.get('group').find({ id: groupId }).value()
            if(find && find.id === groupId){
                const cekuser = db.get('group').filter({id: groupId}).map('members').value()[0]
                const isIn = inArray(pengirim, cekuser)
                if(cekuser && isIn !== false){
                    if(isKasar){
                        const denda = db.get('group').filter({id: groupId}).map('members['+isIn+']').find({ id: pengirim }).update('denda', n => n + 5000).write()
                        if(denda){
                            await pakforlay.reply(from, "Jangan badword bodoh\nDenda +5.000\nTotal : Rp"+formatin(denda.denda), id)
                        }
                    }
                } else {
                    const cekMember = db.get('group').filter({id: groupId}).map('members').value()[0]
                    if(cekMember.length === 0){
                        if(isKasar){
                            db.get('group').find({ id: groupId }).set('members', [{id: pengirim, denda: 5000}]).write()
                        } else {
                            db.get('group').find({ id: groupId }).set('members', [{id: pengirim, denda: 0}]).write()
                        }
                    } else {
                        const cekuser = db.get('group').filter({id: groupId}).map('members').value()[0]
                        if(isKasar){
                            cekuser.push({id: pengirim, denda: 5000})
                            await pakforlay.reply(from, "Jangan badword bodoh\nDenda +5.000", id)
                        } else {
                            cekuser.push({id: pengirim, denda: 0})
                        }
                        db.get('group').find({ id: groupId }).set('members', cekuser).write()
                    }
                }
            } else {
                if(isKasar){
                    db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 5000}] }).write()
                    await pakforlay.reply(from, "Jangan badword bodoh\nDenda +5.000\nTotal : Rp5.000", id)
                } else {
                    db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 0}] }).write()
                }
            }
        }
    } catch (err) {
        console.log(color('[EROR]', 'red'), err)
    }
}
