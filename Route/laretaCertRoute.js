const Router = require('express').Router();
const {LeratTaxController}  = require("../Controller/LaretaController/LaretaTaxController");
const {addPageNumbersToPDF} = require("../Controller/addPageNumController");

Router.get("/certificate/pdf", LeratTaxController,  addPageNumbersToPDF);

module.exports = Router;