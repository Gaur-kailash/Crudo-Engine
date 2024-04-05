const {modelGenerator,routeGenerator,packageGenerator} = require("./functions");
const path = require("path");
const { exec } = require("child_process");
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
require('./db/config');
app.use(cors());
app.listen(5000);

app.post("/files", async (req, res) => {
    let error = { err: false, message: "" };
    // Paths
    const basePath = path.join(__dirname, `../projects/${req.body.projectName}`);
    const modelPath = path.join(basePath, "./models");
    const dbPath = path.join(basePath, "./db");
    const routePath = path.join(basePath, "./routes");
    const indexFilePath = path.join(basePath, "index.js");
    const packageFilePath = path.join(basePath, "package.json");
    const modelFilePath = path.join(modelPath, `${req.body.name}.js`);
    const routeFilePath = path.join(routePath, `${req.body.name}.js`);
    const configFilePath = path.join(dbPath, "config.js")

    // File Data 
    const modelFileData = modelGenerator(req.body);
    const routeFileData = routeGenerator(req.body);
    const packageFileData = packageGenerator(req.body);
    let indexFileData = fs.readFileSync('index.js', 'utf8');
    indexFileData = `${indexFileData.slice(183, 362)} 

const ${req.body.name} = require("./routes/${req.body.name}");
app.use("/",${req.body.name});`;

    const configFileData = `const mongoose = require('mongoose');
    const dbUrl = "mongodb://127.0.0.1:27017/entity-db";
    
    const connectionOptions = {
        useNewUrlParser : true,
        useUnifiedTopology : true
    }
    mongoose.connect(dbUrl,connectionOptions).then(()=>{
        console.info("Connected to database");
    }).catch((err)=>console.warn(err))`;

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
    try {
        fs.writeFileSync(packageFilePath, packageFileData);
    } catch (err) {
        error = { err: true, message: `Error while creating package file error : ${err} ` }
    }

    if (!fs.existsSync(modelPath)) {
        fs.mkdirSync(modelPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
    try {
        fs.writeFileSync(modelFilePath, modelFileData);
    } catch (err) {
        error = { err: true, message: `Error while creating model file error : ${err} ` }
    }

    if (!fs.existsSync(routeFilePath)) {
        fs.mkdirSync(routePath, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }
    try {
        fs.writeFileSync(routeFilePath, routeFileData)
    } catch (err) {
        error = { err: true, message: `Error while creating route file error : ${err} ` }
    }

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }
    try {
        if(!fs.existsSync(indexFilePath)){
        fs.writeFileSync(indexFilePath, indexFileData);
        }
        else{
            fs.appendFileSync(indexFilePath,`
const ${req.body.name} = require("./routes/${req.body.name}");
app.use("/",${req.body.name});`)
        }
    } catch (err) {
        error = { err: true, message: `Error while creating route file error : ${err} ` }
    }

    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(`../projects/${req.body.projectName}/db`, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
    try {
        fs.writeFileSync(configFilePath, configFileData);
    } catch (err) {
        error = { err: true, message: `Error while creating config file error : ${err} ` }
    }


    if (error.err) {
        res.send(error)
    } else {
        exec(`cd .. & cd projects/${req.body.projectName} & npm install`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
        res.send({
            result: "success file"
        })
    }
})

console.log("server started at port 5ooo");

