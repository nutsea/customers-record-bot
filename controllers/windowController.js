const ApiError = require('../error/apiError')
const {Window} = require('../models/models')
const { Op } = require('sequelize')

class WindowController {
    async create(req, res, next) {
        const {date, time} = req.body
        const isWindow = await Window.findOne({where: {date, time}})
        if (isWindow === null) {
            const window = await Window.create({date, time})
            return res.json(window)
        } else {
            return next(ApiError.badRequest('Такое окно уже существует'))
        }
    }

    async delete(req, res, next) {
        const {id} = req.query
        const window = await Window.findOne({where: {id}})
        if (window) {
            await window.destroy()
            return res.json(window)
        }
        else {
            return next(ApiError.badRequest('Окна не существует'))
        }
    }

    async getAll(req, res, next) {
        const windows = await Window.findAll()
        if (windows) {
            return res.json(windows)
        } else {
            return next(ApiError.badRequest('Свободных окон нет'))
        }
    }

    async getOne(req, res, next) {
        const {id} = req.body
        const window = await Window.findOne({where: {id}})
        if (window) {
            return res.json(window)
        } else {
            return next(ApiError.badRequest('Окна не существует'))
        }
    }

    async getOneDay(req, res, next) {
        const {date} = req.query
        console.log('\nДАТА: ' + date + '\n')
        if (date) {
            const windows = await Window.findAll({where: {date}})
            if (windows.length > 0) {
                return res.json(windows)
            } else {
                return next(ApiError.badRequest('В этот день свободных окон нет'))
            }
        } else {
            return next(ApiError.badRequest('Некорректная дата'))
        }
    }

    async deleteLastDays(date) {
        const windows = await Window.findAll({
            where: {
                date: {
                    [Op.lt]: date
                }
            }
        })
        console.log(windows)
        try {
            for (const i of windows) {
                i.destroy()
            }
            console.log('Окна на прошедшие даты удалены')
        } catch (e) {
            console.log(e)
        }
    }

    async windowsBot(botDate, botTime) {
        const [dd, mm, yy] = botDate.split('.')
        const date = '20' + yy + '-' + mm + '-' + dd
        const [hour, min] = botTime.split(':')
        const time = hour + ':' + min + ':' + '00'
        console.log(date + time)
        try {
            const isWindow = await Window.findOne({where: {date, time}})
            if (isWindow === null) {
                const window = await Window.create({date, time})
                return window
            } else {
                return 'exists'
            }
        } catch (e) {
            return undefined
        }
    }

    async getWindowsBot(botDate) {
        const [dd, mm, yy] = botDate.split('.')
        const date = '20' + yy + '-' + mm + '-' + dd
        const windows = await Window.findAll({where: {date}}) 
        console.log(windows)
        return windows
    }
}

module.exports = new WindowController()