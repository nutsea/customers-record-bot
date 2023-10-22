const ApiError = require('../error/apiError')
const {Booking, Client, Window} = require('../models/models')

class BookingController {
    async create(req, res, next) {
        const {date, time, name, phone, type} = req.body
        const window = await Window.findOne({where: {date, time}})
        if (window) {
            let client = await Client.findOne({where: {phone}})
            if (client) {
                if (client.name !== name) {
                    client.name = name
                    await client.save()
                }
            } else {
                client = await Client.create({name, phone})
            }
            const id = client.getDataValue('id')
            const booking = await Booking.create({date, time, name, phone, client_id: id, type})
            await window.destroy()
            await clientTwilio.messages
            .create({
                body: `НОВАЯ ЗАПИСЬ:\n${formatDate(booking.date)}\n${formatTime(booking.time)}\n${booking.name}\n${booking.phone}\n${formatType(booking.type)}`,
                from: '+14847499160',
                to: '+79172682101'
            })
            .then(message => console.log(message.sid))
            .catch(e => console.log(e))
            return res.json(booking)
        } else {
            return next(ApiError.badRequest('Данного окна не существует'))
        }
    }

    async createAdmin(req, res, next) {
        const {date, time, name, phone, type} = req.body
        const isBookingExist = await Booking.findOne({where: {date, time}})
        if (!isBookingExist) {
            let client = await Client.findOne({where: {phone}})
            if (client) {
                if (client.name !== name) {
                    client.name = name
                    await client.save()
                }
            } else {
                client = await Client.create({name, phone})
            }
            const id = client.getDataValue('id')
            const booking = await Booking.create({date, time, name, phone, client_id: id, type})
            const window = await Window.findOne({where: {date, time}})
            if (window) {
                await window.destroy()
            }
            return res.json(booking)
        } else {
            console.log('Ошибка!!!!!')
            return next(ApiError.badRequest('Это время уже занято'))
        }
    }

    async delete(req, res, next) {
        const {id} = req.query
        const booking = await Booking.findOne({where: {id}})
        if (booking) {
            await booking.destroy()
            console.log(booking)
            return res.json(booking)
        } else {
            return next(ApiError.badRequest('Данной записи не существует'))
        }
    }

    async getAll(req, res, next) {
        const bookings = await Booking.findAll()
        if (bookings) {
            return res.json(bookings)
        } else {
            return next(ApiError.badRequest('Записи отсутствуют'))
        }
    }

    async getOne(req, res, next) {
        const {id} = req.body
        const booking = await Booking.findOne({where: {id}})
        if (booking) {
            return res.json(booking)
        } else {
            return next(ApiError.badRequest('Данной записи не существует'))
        }
    }

    async getOneDay(req, res, next) {
        const {date} = req.query
        const bookings = await Booking.findAll({where: {date}})
        if (bookings.length > 0) {
            return res.json(bookings)
        } else {
            return next(ApiError.badRequest('В данный день записей нет'))
        }
    }

    async getBookingsBot(botDate) {
        const [dd, mm, yy] = botDate.split('.')
        const date = '20' + yy + '-' + mm + '-' + dd
        const bookings = await Booking.findAll({where: {date}}) 
        return bookings
    }
}

module.exports = new BookingController()