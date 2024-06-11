const { hoacertificate } = require("../Controller/Hoa/HoaController")
const { taxCertificate } = require("../Controller/Tax/TaxController")
const { addPageNumbersToPDF } = require("../Controller/addPageNumController")

const Router = require("express").Router()



Router.get("/tax-certificate/pdf",  taxCertificate, hoacertificate, addPageNumbersToPDF)

module.exports = Router