const sequelize = require('../db.js')
const {DataTypes} = require('sequelize')
const {v4: uuidv4} = require('uuid')

const Client = sequelize.define('client', {
    id: {type: DataTypes.UUID, defaultValue: uuidv4, primaryKey: true, allowNull: false, unique: true},
    name: {type: DataTypes.STRING(255), allowNull: false},
    phone: {type: DataTypes.STRING(11), allowNull: false}
})

const Booking = sequelize.define('booking', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true},
    date: {type: DataTypes.DATEONLY, allowNull: false},
    time: {type: DataTypes.TIME, allowNull: false},
    type: {type: DataTypes.STRING(255), allowNull: false},
    name: {type: DataTypes.STRING(255), allowNull: false},
    phone: {type: DataTypes.STRING(11), allowNull: false}
})

const Window = sequelize.define('window', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    date: {type: DataTypes.DATEONLY, allowNull: false},
    time: {type: DataTypes.TIME, allowNull: false}
})

const Bot = sequelize.define('bot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    currentChat: {type: DataTypes.STRING, allowNull: false}
})

Client.hasMany(Booking, {foreignKey: 'client_id'})
Booking.belongsTo(Client, {foreignKey: 'client_id'})

module.exports = {
    Client,
    Booking,
    Window,
    Bot
}