
const express = require("express")
const router = express()
const ejs = require('ejs');
const fs = require('fs');
const puppeteer = require("puppeteer")
const path = require("path")
const { data } = require("../../data");
const { renderTemplate, getCustomerName, decodeBase64 } = require("../../lib/utils");
router.set('views', path.join(__dirname, '../../views/Hoa'));
router.set('view engine', 'ejs');
const PDFMerger = require("pdf-merger-js");




const hoacertificate = async (req, res, next) => {
    try {
        const data = req.body
        
        const merger = new PDFMerger();
        await merger.add(decodeBase64(req.taxCertificateData));

        //if hoad data is available
        if (data?.hoa_info?.length > 0) {
            const browser = await puppeteer.launch(process.env.SERVER === "DEV" ? { headless: true } : { args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            const page = await browser.newPage();
            // Wait for the canvas element to be visible


            await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(
                await renderTemplate(router, 'hoacertificate', data)
            )}`, { waitUntil: 'networkidle2' });


            await page.addStyleTag({ path: './public/style.css' });


            const watermarkPath = path.join(__dirname, '../../views/Hoa/hoawatermark.ejs');
            const watermarkTemplate = fs.readFileSync(watermarkPath, 'utf8');
            // Render the EJS template with data
            const renderedWatermark = ejs.render(watermarkTemplate, { watermark: data?.isHoaCompleted ? "" : 'HOA PRELIMINARY' })
            await page.evaluate((renderedWatermark) => {
                const watermark = document.createElement('div');
                watermark.innerHTML = renderedWatermark;
                watermark.style.position = 'fixed';
                watermark.style.top = '330px'; // Adjust as needed
                watermark.style.left = '90px'; // Adjust as needed
                watermark.style.transform = "rotate(-35deg)";
                watermark.style.fontSize = '16px'; // Adjust as needed
                document.body.insertBefore(watermark, document.body.firstChild);
            }, renderedWatermark);

            const headerPath = path.join(__dirname, '../../views/Hoa/Header/hoaHeader.ejs');
            const headerTemplate = fs.readFileSync(headerPath, 'utf8');
            // Render the EJS template with data
            // console.log(data?.input_Order?.private_label_logo)
            const renderedHeader = ejs.render(headerTemplate, { headerType: data?.input_Order.customer_is_private_label, isCompleted: data?.isHoaCompleted, logo: data?.input_Order?.private_label_logo, customer: data?.input_Order.client_Name })

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
                margin: { top: (data?.isHoaCompleted || (getCustomerName(data?.input_Order.client_Name) === 5)) ? 70 : 90, bottom: 10, left: 15, right: 15 },
            });
            await browser.close();


            // Convert PDF buffer to Base64 string
            const pdfBase64 = pdf.toString('base64');

            await merger.add(decodeBase64(pdfBase64))
        }
        const mergedBuffer = await merger.saveAsBuffer();
        const mergedBase64 = mergedBuffer.toString('base64');

        if (mergedBase64) {
            req.certificate = mergedBase64

            next()
        } else {
            return res.status(500).json({ message: "Invalid base64" })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json(error?.message)
    }
}

module.exports = { hoacertificate }