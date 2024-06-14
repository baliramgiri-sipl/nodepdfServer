
const express = require("express")
const router = express()
const ejs = require('ejs');
const fs = require('fs');
const puppeteer = require("puppeteer")
const path = require("path")
const { data } = require("../../data");
const { renderTemplate, getCustomerName } = require("../../lib/utils");
// const { renderTemplate } = require("../../lib/utils");
router.set('views', path.join(__dirname, '../../views'));
router.set('view engine', 'ejs');


const taxCertificate = async (req, res, next) => {
    try {
        // const data = req.body
        const browser = await puppeteer.launch(process.env.SERVER === "DEV" ? { headless: true } : { args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        // console.log(process.env)
        const page = await browser.newPage();
        // Wait for the canvas element to be visible

        await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(
            await renderTemplate(router, 'TaxCertificate', data)
        )}`, { waitUntil: 'networkidle2' });


        await page.addStyleTag({ path: './public/style.css' });


        const watermarkPath = path.join(__dirname, '../../views/watermark.ejs');
        const watermarkTemplate = fs.readFileSync(watermarkPath, 'utf8');
        // Render the EJS template with data
        const renderedWatermark = ejs.render(watermarkTemplate, { watermark: !data?.isOrderCompleted ? "" : 'PRELIMINARY' })
        await page.evaluate((renderedWatermark) => {
            const watermark = document.createElement('div');
            watermark.innerHTML = renderedWatermark;
            watermark.style.position = 'fixed';
            watermark.style.top = '350px'; // Adjust as needed
            watermark.style.left = '200px'; // Adjust as needed
            watermark.style.transform = "rotate(-45deg)";
            watermark.style.fontSize = '16px'; // Adjust as needed
            document.body.insertBefore(watermark, document.body.firstChild);
        }, renderedWatermark);

        const headerPath = path.join(__dirname, '../../views/components/Header/CertsimpleHeader.ejs');
        const headerTemplate = fs.readFileSync(headerPath, 'utf8');
        // Render the EJS template with data
        // console.log(data?.input_Order?.private_label_logo)
        const renderedHeader = ejs.render(headerTemplate, { headerType: data?.input_Order.customer_is_private_label, isWaterMark: data?.isOrderCompleted, logo: data?.input_Order?.private_label_logo, customer: data?.input_Order.client_Name })

        const pdf = await page.pdf({
            format: 'A4',
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `
            <style>
            html {
              -webkit-print-color-adjust: exact;
            }
            </style>
            ${renderedHeader}
        `,
            margin: { top: (data?.isOrderCompleted || (getCustomerName(data?.input_Order.client_Name) === 5)) ? 70 : ((getCustomerName(data?.input_Order.client_Name) === 1 || getCustomerName(data?.input_Order.client_Name) === 2 || getCustomerName(data?.input_Order.client_Name) === 3 ||getCustomerName(data?.input_Order.client_Name) === 4 ) && !data?.isOrderCompleted) ? 55 : 90, bottom: 10, left: 15, right: 15 },
        });
        await browser.close();


        // return res.send(pdf)
        // Convert PDF buffer to Base64 string
        // const pdfBase64 = pdf.toString('base64');
        // // Send the PDF Base64 string in the response
        // res.json({ pdfBase64: `data:application/pdf;base64,${pdfBase64}` });

        // res.set({
        //     'Content-Type': 'application/pdf',
        //     'Content-Disposition': 'inline; filename="output.pdf"',
        //     'Content-Length': pdf.length
        // });
        if (pdf) {
            const pdfBase64 = pdf.toString('base64');
            req.taxCertificateData = pdfBase64
            req.data = data
            next();
        } else {
            return res.status(400).json({ message: 'Invalid PDF' })
        }
        // res.send(pdf);
    } catch (error) {
        return res.json(error?.message)
    }
}
module.exports = { taxCertificate }