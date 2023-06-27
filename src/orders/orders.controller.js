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
    const { data: { dishes } = {} } = req.body;
    dishes.forEach((dish, i) => {
        if(!Number.isInteger(dish.quantity) || dish.quantity <= 0){
            next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`,
              })
        }
    })
    next()
}

const validateDishIsAnArray = (req, res, next) => {
    const { data: { dishes } = {} } = req.body;
    if(Array.isArray(dishes) && dishes.length > 0){
        next()
    }else{
        next({
            status: 400,
            message: "dishes must be an array"
        })
    }
}

const validateStatusforUpdate = (req, res, next) => {
    const { orderId } = req.params;
    const {order} = res.locals
    const { data: { id, status } = {} } = req.body;

    if (id && id !== orderId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        });
    };

    if(!status || !["pending", "preparing", "out-for-dellivery", "delivered"].includes(status)) {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing,out-for-delivery, delivered",
        })
    };

    if(order.status === "delivered"){
        next({
            status: 400,
            message: "A delivered order cannot be changed",
        })
    };
      
    next();
}

const create = (req, res, next) => {
    const newId = nextId()
    const { deliverTo, mobileNumber, dishes } = req.body.data

    let newOrder = {
        id: newId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        dishes: dishes
    }

    orders.push(newOrder)
    res.status(201).send({ data: newOrder })
}

const update = (req, res, next) => {
    const {deliverTo, mobileNumber, status, dishes, quantity} = req.body.data
    const {index, order} = res.locals
    const updatedOrder = {
        ...order,
        deliverTo,
        mobileNumber,
        status,
        dishes,
        quantity
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

const destroy = (req, res, next) => {
    const {index, order} = res.locals
    if(order.status !== "pending"){
        next({
            status: 400,
            message: "The status is pending, you cannot delete this"
        })
    }else{
        orders.splice(index, 1)
        res.status(204).send()
    }
}


module.exports = {
    list,
    read: [validateOrderExists, read],
    create: [
        validator("deliverTo"), 
        validator("mobileNumber"),
        validator("dishes"),
        validateDishIsAnArray,
        validateDishQuantityIsAnInteger,
        create
    ],
    update: [
        validateOrderExists,
        validator("deliverTo"), 
        validator("mobileNumber"),
        validator("status"),
        validator("dishes"),
        validateStatusforUpdate,
        validateDishIsAnArray,
        validateDishQuantityIsAnInteger,
        update
    ],
    delete: [validateOrderExists, destroy]
}