// const TelegramBot = require('node-telegram-bot-api')
const { Telegraf, Markup, session } = require('telegraf');

const token = '6797930073:AAFxTZN_Y0kSsgvvijfxHKK2buH62Zo6qXc'

// const bot = new TelegramBot(token, { polling: true })
const bot = new Telegraf(token)

module.exports = bot