const Router = require('express').Router();
const {LeratTaxController}  = require("../Controller/LaretaController/LaretaTaxController");
const {addPageNumbersToPDF} = require("../Controller/addPageNumController");

Router.post("/certificate/pdf", LeratTaxController,  addPageNumbersToPDF);

module.exports = Router;