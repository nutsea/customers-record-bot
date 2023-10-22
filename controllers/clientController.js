const ApiError = require('../error/apiError')
const {Client, Booking} = require('../models/models')
const {Op} = require('sequelize')

class ClientController {
    async create(req, res) {
        const {name, phone} = req.body
        const client = await Client.create({name, phone})
        return res.json(client)
    }

    async update(req, res, next) {
        const {name, phone} = req.body
        const client = await Client.findOne({where: {phone}})
        if (client) {
            if (name) {
                client.name = name
            }
            await client.save()
            return res.json(client)
        } else {
            return next(ApiError.badRequest('Клиента не существует'))
        }
    }

    async delete(req, res, next) {
        const {id} = req.body
        const client = await Client.findOne({where: {id}})
        if (client) {
            await client.destroy()
            return res.json(client)
        }
        else {
            return next(ApiError.badRequest('Клиента не существует'))
        }
    }

    async getAll(req, res, next) {
        const clients = await Client.findAll()
        if (clients) {
            return res.json(clients)
        } else {
            return next(ApiError.badRequest('Клиенты отсутствуют'))
        }
    }

    async getLimit(req, res, next) {
        const {offset, limit} = req.query
        try {
            const totalCount = await Client.count()
            const clients = await Client.findAll({limit, offset: offset * limit - limit})
            if (clients.length > 0) {
                const totalPages = Math.ceil(totalCount / limit)
                console.log(clients)
                return res.json({clients, totalPages})
            } else {
                return next(ApiError.badRequest('Клиенты отсутствуют'))
            }
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        const {id} = req.body
        const client = await Client.findOne({where: {id}})
        if (client) {
            return res.json(client)
        } else {
            return next(ApiError.badRequest('Клиента не существует'))
        }
    }

    async getBySearch(req, res, next) {
        const {search} = req.query
        const clients = await Client.findAll({where: {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ]
        }})
        if (clients) {
            return res.json(clients)
        } else {
            return next(ApiError.badRequest('Клиенты не найдены'))
        }
    }

    async findBookings(req, res, next) {
        const {client_id} = req.query
        const bookings = await Booking.findAll({where: {client_id}})
        if (bookings) {
            return res.json(bookings)
        } else {
            return next(ApiError.badRequest('Записей нет'))
        }
    }

    async getClientsBot() {
        const clients = await Client.findAll()
        if (clients) {
            return clients
        } else {
            return undefined
        }
    }
}

module.exports = new ClientController()