const ApiError = require('../error/apiError')
const {Bot} = require('../models/models')

class BotController {
    async setChatId (chatId, next) {
        const lastChat = await Bot.findOne({where: {id: 1}})
        if (lastChat) {
            lastChat.currentChat = chatId
            await lastChat.save()
            return chatId
        } else {
            return undefined
        }
    }
}

module.exports = new BotController()