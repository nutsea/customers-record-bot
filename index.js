require('dotenv').config()
const express = require('express')
const sequelize = require('./db.js')
const models = require('./models/models.js')
const cors = require('cors')
const router = require('./routes/index.js')
const cron = require('node-cron')
const windowController = require('./controllers/windowController.js')
const botController = require('./controllers/botController.js')
const { Telegraf, Markup, session } = require('telegraf');
const bookingContoller = require('./controllers/bookingContoller.js')
const clientController = require('./controllers/clientController.js')
const path = require('path')
const https = require('https')
const fs = require('fs')

const PORT = process.env.PORT || 5100

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/bot.taxiallrussia.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/bot.taxiallrussia.ru/cert.pem')
}

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

const server = https.createServer(options, app)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

// const start = async () => {
//     try {
//         await sequelize.authenticate()
//         await sequelize.sync()
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
//     } catch (e) {
//         console.error(e)
//     }
// }

start()

cron.schedule('0 0 * * *', () => {
    const date = new Date
    const dbDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    windowController.deleteLastDays(dbDate)
})

////////// functions

const correctDate = (date) => {
    const regexPattern = /^\d{2}\.\d{2}\.\d{2}$/;
    if (regexPattern.test(date)) {
        const [dd, mm, yy] = date.split('.')
        if (Number(dd) <= 31 && Number(mm) <= 12 && Number(yy) >= 23) return true
        else return false
    } else {
        return false
    }
}

const correctTime = (time) => {
    const regexPattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (regexPattern.test(time)) {
        const [hh, mm] = time.split(':')
        if (Number(hh) <= 23 && Number(mm) <= 59) return true
        else return false
    } else {
        return false
    }
}

const compareWindows = (a, b) => {
    const [hhA, mmA] = a.time.split(':')
    const [hhB, mmB] = b.time.split(':')
    if (hhA !== hhB) {
        return hhA - hhB
    }
    return mmA - mmB
}

////////// bot

const token = '6797930073:AAFxTZN_Y0kSsgvvijfxHKK2buH62Zo6qXc'
const bot = new Telegraf(token)
bot.use(session())

bot.start((ctx) => {
    botController.setChatId(ctx.chat.id)
    const message = 'Здравствуйте! Вы установлены временным администратором.'
    const keyboard = Markup.keyboard([
        ['Свободные окна'],
        ['Записи'],
        ['Клиенты']
    ]).resize()
    ctx.reply(message, keyboard)
})

let chosenDate = ''

bot.on('text', async (ctx) => {
    switch (ctx.message.text) {
        case 'Свободные окна':
            ctx.reply('Отправьте дату в формате дд.мм.гг')
            ctx.session = 'windows_date'
            break

        case 'Записи':
            ctx.reply('Отправьте дату в формате дд.мм.гг')
            ctx.session = 'bookings_date'
            break

        case 'Клиенты':
            const button = Markup.inlineKeyboard([
                Markup.button.url('Открыть', 't.me/customers_record_bot/Customers')
            ])
            ctx.reply('Список клиентов', button)
            break

        default:
            if (ctx.session === 'windows_date') {
                if (correctDate(ctx.message.text)) {
                    chosenDate = ctx.message.text
                    const windows = await windowController.getWindowsBot(ctx.message.text)
                    if (windows.length > 0) {
                        let allWindows = ''
                        windows.sort(compareWindows).map((window) => {
                            const [hh, mm] = window.time.split(':')
                            allWindows = allWindows + hh + ':' + mm + '\n'
                        })
                        ctx.reply(allWindows, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Создать окно', callback_data: 'create_window' }]
                                ]
                            }
                        })
                    } else {
                        ctx.reply('Свободных окон на эту дату нет.', {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Создать окно', callback_data: 'create_window' }]
                                ]
                            }
                        })
                    }
                } else {
                    ctx.reply('Неверная дата.\nПример: 31.12.23')
                }
                break
            }
            if (ctx.session === 'bookings_date') {
                if (correctDate(ctx.message.text)) {
                    chosenDate = ctx.message.text
                    const bookings = await bookingContoller.getBookingsBot(ctx.message.text)
                    if (bookings.length > 0) {
                        let allBookings = `Записи на ${chosenDate}`
                        bookings.sort(compareWindows).map((booking) => {
                            const [hh, mm] = booking.time.split(':')
                            allBookings = allBookings + '\n-----------------\n' + hh + ':' + mm + ' ' + booking.name + ' +' + booking.phone + ' ' + booking.type
                        })
                        ctx.reply(allBookings)
                    } else {
                        ctx.reply('Записи на эту дату не найдены.')
                    }
                } else {
                    ctx.reply('Неверная дата.\nПример: 31.12.23')
                }
                break
            }
            if (ctx.session === 'create_window') {
                if (correctTime(ctx.message.text)) {
                    await windowController.windowsBot(chosenDate, ctx.message.text).then((data) => {
                        if (data) {
                            if (data === 'exists') {
                                ctx.reply('Такое окно уже существует.')
                            } else {
                                ctx.reply(`Создано окно:\n${chosenDate}\n${ctx.message.text}`)
                            }
                        } else {
                            ctx.reply('Произошла ошибка. Повторите действие или нажмите /start')
                        }
                    })
                } else {
                    ctx.reply('Неверное время.\nПример: 10:00')
                }
            }
            break
    }
})

bot.action('create_window', (ctx) => {
    ctx.reply('Введите время в формате чч:мм')
    ctx.session = 'create_window'
})

bot.launch()