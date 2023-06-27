const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const validateOrderExists = (req, res, next) => {
    const {orderId} = req.params
    const index = orders.findIndex((order)=> order.id === orderId)

    if(index < 0) {
        next({
            status: 404,
            message: `No order with the id ${orderId}`
        })
    }else{
        res.locals.index = index
        res.locals.order = orders[index]
        next()
    }
}

const validator = (field) => {
    return function(req, res, next) {
        if(req.body.data[field]){
            next()
        }else{
            next({
                status: 400,
                message: `You forgot the ${field} field`
            })
        }
    }
}

const validateDishQuantityIsAnInteger = (req, res, next) => {
    let {quantity} = req.body.data
    if(typeof quantity === "number" && quantity > 0){
        next()
    }else{
        next({
            status: 400,
            message: "quantity must be an integar greater than 0"
        })
    }
}

const create = (req, res, next) => {
    const newId = nextId()
    const {deliverTo, mobileNumber, status, dishes} = req.body.data

    let newOrder = {
        id: newId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    }

    orders.push(newOrder)
    res.status(201).send({ data: newOrder })
}

const update = (req, res, next) => {
    const {deliverTo, mobileNumber, status, dishes} = req.body.data
    const {index, order} = res.locals
    const updatedOrder = {
        ...order,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders[index] = updatedOrder
    res.send({ data: updatedOrder })
}

const list = (req, res, next) => {
    res.send({ data: orders})
}

const read = (req, res, next) => {
    res.send({ data: res.locals.order })
}


module.exports = {
    list,
    read: [validateOrderExists, read],
    create: [
        validator("deliverTo"), 
        validator("mobileNumber"),
        validator("status"),
        validator("dishes"),
        validateDishQuantityIsAnInteger,
        create
    ],
    update: [
        validateOrderExists,
        validator("deliverTo"), 
        validator("mobileNumber"),
        validator("status"),
        validator("dishes"),
        validateDishQuantityIsAnInteger,
        update
    ]
}