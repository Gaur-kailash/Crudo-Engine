const express = require('express');
const entityRouter = express.Router();
const mongoose = require('mongoose');

// Assuming you have already connected to your MongoDB instance

entityRouter.post("/entities", async (req, res) => {
    const { id} = req.body;
    const {collectionName} = req.query ;
    const collection = mongoose.connection.collection(collectionName);

    try {
        let findData = await collection.findOne({ id: id });
        if (findData) {
            return res.status(400).send({
                "result": "failed",
                "message": `${collectionName} already exists with the same ID`,
                "error": false
            });
        } else {
            const createdAt = new Date();
            const updatedAt = new Date();
            req.body.createdAt = createdAt;
            req.body.updatedAt = updatedAt;
            await collection.insertOne(req.body);
            return res.status(201).send({
                "result": "success",
                "message": `${collectionName} Created`,
                "error": false
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(503).send({
            "result": "failed",
            "message": "Some error occurred while creating",
            "error": true
        });
    }
});

entityRouter.get("/entities", async (req, res) => {
    const {collectionName,orderBy,order} = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const collection = mongoose.connection.collection(collectionName);
    let sorting ;
    if(order==="aesc"){
        sorting= 1;
    }else if(order === "desc"){
        sorting = -1 ;
    }

    try {
        const totalCount = await collection.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);

        const result = await collection.find().skip((page - 1) * pageSize).limit(pageSize).sort({[orderBy]:sorting}).toArray();
        return res.status(200).send({
            "result": result,
            "pageNumber": page,
            "pageSize": pageSize,
            "totalPage": totalPages,
            "totalData": totalCount,
            "message": `${collectionName} Data`,
            "error": false
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(503).send({
            "result": [],
            "message": "Some error occurred",
            "error": true
        });
    }
});

entityRouter.get("/entities/:id", async (req, res) => {
    const { id } = req.params;
    const {collectionName} = req.query;
    const collection = mongoose.connection.collection(collectionName);

    try {
        const result = await collection.findOne({ id: id });
        if (result) {
            return res.status(200).send({
                "result": result,
                "message": `${collectionName} Data`,
                "error": false
            });
        } else {
            return res.status(404).send({
                "result": [],
                "message": "Some error occurred or Data not found",
                "error": true
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(503).send({
            "result": [],
            "message": "Some error occurred",
            "error": true
        });
    }
});

entityRouter.put("/entities/:id", async (req, res) => {
    const { id } = req.params;
    const {collectionName} = req.query;
    const updatedAt = new Date();
    req.body.updatedAt = updatedAt;
    const collection = mongoose.connection.collection(collectionName);

    try {
        let updateItem = await collection.updateOne({ id: id }, { $set: req.body });
        if (updateItem.modifiedCount === 1) {
            return res.status(200).send({
                "result": "success",
                "message": `Updated student ${collectionName} `,
                "error": false
            });
        } else {
            console.log("Item not modified");
            return res.status(503).send({
                "result": "failed",
                "message": "Failed to update",
                "error": true
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(503).send({
            "result": "failed",
            "message": "Failed to update",
            "error": true
        });
    }
});

entityRouter.delete("/entities/:id", async (req, res) => {
    const { id } = req.params;
    const collectionName = req.query.collectionName;
    const collection = mongoose.connection.collection(collectionName);

    try {
        const result = await collection.deleteOne({ id: id });
        if (result.deletedCount === 1) {
            return res.status(200).send({
                "result": "success",
                "message": "Item deleted",
                "error": false
            });
        } else {
            return res.status(404).send({
                "result": "failed",
                "message": "Item not found",
                "error": true
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(503).send({
            "result": "failed",
            "message": "Failed to delete",
            "error": true
        });
    }
});

module.exports = entityRouter;