const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const validateDishExists = (req, res, next) => {
    const {dishesId} = req.params
    const index = dishes.findIndex((dish)=> dish.id === dishesId)

    if(index < 0) {
        next({
            status: 404,
            message: `No dish with the id ${dishesId}`
        })
    }else{
        res.locals.index = index
        res.locals.dish = dishes[index]
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

const validateId = (req, res, next) => {
    const { dishesId } = req.params;
    const { id } = req.body.data;

    if (!id || id === dishesId) {
        next();
    }else{
        next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${dishesId}`,
        });
    }

    next();
}

const validatePriceIsNumeric = (req, res, next) => {
    let {price} = req.body.data
    if(typeof price === "number" && price > 0){
        next()
    }else{
        next({
            status: 400,
            message: `price must be a number greater than 0`
        })
    }
}

const list = (req, res, next) => {
    res.send({ data: dishes })
}

const read = (req, res, next) => {
    res.send({ data: res.locals.dish })
}

const update = (req, res, next) => {
    const {name, description, price, image_url} = req.body.data
    const {dish} = res.locals
   
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    
    res.send({ data: dish })
}

const create = (req, res, next) => {
    const newId = nextId()
    const {name, description, price, image_url} = req.body.data

    let newDish = {
        id: newId,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }

    dishes.push(newDish)
    res.status(201).send({ data: newDish })
}



module.exports = {
    list,
    read: [validateDishExists, read],
    update: [
        validateDishExists, 
        validator("name"), 
        validator("description"),
        validator("price"),
        validator("image_url"),
        validatePriceIsNumeric,
        validateId, 
        update
    ],
    create: [
        validator("name"), 
        validator("description"),
        validator("price"),
        validator("image_url"),
        validatePriceIsNumeric,
        create
    ]
}