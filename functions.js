// Model Genrator function 
function modelGenerator(schemaInput) {
    let data = "{";
    schemaInput.fields.map((field, index) => {
        data += `${field.fieldName} : ${field.fieldType} ,`
    })
    data = data.slice(0, -1)
    data += "}"
    return (
        `const mongoose = require('mongoose');
       const ${schemaInput.name}Schema = new mongoose.Schema(${data});
       module.exports = mongoose.model("${schemaInput.name}s",${schemaInput.name}Schema);`);
}

// Route Generator Function
function routeGenerator(schemaInput) {
    const { name} = schemaInput;
    return (`const express = require('express');
    const router = express.Router();
    const ${name} = require("../models/${name}");

    router.post("/${name}s",async (req,res)=>{
    const {id}= req.body;
    let findData = await ${name}.findOne({id:id});
    if(findData){
            res.status(400).send(
                {"result":"failed",
                 "message":"${name} already exist with same ID",
                 "error" : false
                 }
                )
    }else {
        let ${name}Data = new ${name}(req.body);
            let result = await ${name}Data.save();
            if (result) {
                res.status(201).send({
                    "result": "success",
                    "message": "${name} Created",
                    "error": false
                })
            }
            else {
                res.status(503).send({
                    "result": "failed",
                    "message": "Some error occur while creating",
                    "error": true
                })
            }
    }
        })

router.get("/${name}s", async (req,res)=>{
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 10; 
    const totalCount = await ${name}.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);

    const result = await ${name}.find().skip((page - 1) * pageSize).limit(pageSize);
    if(result){
        res.status(200).send({
            "result":result,
            "pageNumber" : page,
            "pageSize" : pageSize,
            "totalPage" : totalPages,
            "totalData" : totalCount,
            "message": "${name} Data",
            "error" : false
        })
    }else{
        res.status(503).send({
            "result":[],
            "message": "some error occured",
            "error" : true
        })
    }
})

router.get("/${name}s/:id", async (req,res)=>{
    const {id} = req.params;
    let result = await ${name}.findOne({id:id});
    if(result){
        res.status(200).send({
            "result":result,
            "message":"Student Data",
            "error" : false
        })
    }else{
        res.status(404).send({
            "result":[],
            "message": "some error occured or Data not found",
            "error" : true
        })
    }
})

router.put("/${name}s/:id",async (req,res)=>{
        const {id}= req.params;
        let updateItem = await ${name}.updateOne({id:id},req.body);
        if(updateItem.modifiedCount===1){
            console.log("Item modified");
            res.status(200).send({
                "result" : "success",
                "message" : "updated ${name}",
                "error" : false
            })
        }else{
            res.status(503).send({
                "result" : "failed",
                "message" : "Failed to update",
                "error" : true
            })
            console.log("else")
        }
    
})

router.delete("/${name}s/:id",async (req,res)=>{
    const {id} = req.params;
    const result = await ${name}.deleteOne({id:id});
    if(result.deletedCount===1){
        res.status(200).send({
            "result" : "success",
            "message" : "Item deleted",
            "error" : false
        })
    }else{
        res.status(503).send({
            "result" : "failed",
            "message" : "Item not deleted",
            "error" : true
        })
    }
})
module.exports = router;`)
}

// Package Generator function
function packageGenerator(schemaInput) {
    return (`{
        "name": "${schemaInput.projectName}",
        "version": "1.0.0",
        "description": "this server is dedicated to entity project ",
        "main": "index.js",
        "scripts": {
          "start": "nodemon index.js",
          "test": "echo \\\"Error: no test specified\\\" && exit 1"
        },
        "author": "kailash c. gaur",
        "license": "ISC",
        "dependencies": {
          "cors": "^2.8.5",
          "express": "^4.18.3",
          "fs": "^0.0.1-security",
          "mongoose": "^8.2.1"
        },
        "devDependencies": {
          "nodemon": "^3.1.0"
        }
      }`)
}

module.exports = {
    modelGenerator,packageGenerator,routeGenerator
}
