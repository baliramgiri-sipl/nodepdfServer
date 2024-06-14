const express = require("express")
const router = express()
const ejs = require('ejs');
const fs = require('fs');
const puppeteer = require("puppeteer")
const path = require("path")
const { laretaJosn } = require("../../data");
const {renderTemplate} = require("../../lib/utils")

router.set('views', path.join(__dirname, '../../views/laretaView'));
router.use(express.static(path.join(__dirname,"../../public")))
router.set('view engine', 'ejs');

async function LeratTaxController(req, res, next){
  try{
    const data = req.body
    const browser = await puppeteer.launch(process.env.SERVER === "DEV" ? { headless: true } : { args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    // console.log(process.env)
    const page = await browser.newPage();
    // Wait for the canvas element to be visible

    await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(
        await renderTemplate(router, 'LaretaCertificate', laretaJosn)
    )}`, { waitUntil: 'networkidle2' });
  
    await page.addStyleTag({ path: './public/lareta.css' });

    const headerPath = path.join(__dirname, '../../views/components/Header/LaretaHeader.ejs');
    const footerPath = path.join(__dirname, "../..//views/components/Footer/LaretaFooter.ejs");
    const headerTemplate = fs.readFileSync(headerPath, 'utf8');
    // Render the EJS template with data
    // console.log(data?.input_Order?.private_label_logo)
    const renderedHeader = ejs.render(headerTemplate, { headerType: laretaJosn?.input_order });

    const renderFooter = ejs.render(fs.readFileSync(footerPath, 'utf8'))

    const pdf = await page.pdf({
      format: 'A4',
      printBackground:true,
      displayHeaderFooter:true,
      headerTemplate: `
      <style>
      html {
        -webkit-print-color-adjust: exact;
      }
      </style>
      ${renderedHeader}
   `,
      footerTemplate:`
      <style>
      html {
        -webkit-print-color-adjust: exact;
      }
      </style>
      ${renderFooter}
      `,
      margin: {top:170, bottom:80, right:20, left:20}
    });
     await browser.close();

     if(pdf){
      const pdfBase64 = pdf.toString('base64');
        // return res.status(200).json(pdfBase64)
            req.certificate = pdfBase64
            // req.data = laretaJosn
            next();
        } else {
            return res.status(400).json({ message: 'Invalid PDF' })
        }
  }catch(error){
     return res.json(error?.message)
  }
}


module.exports = {LeratTaxController}