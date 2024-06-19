const { decodeBase64, getCustomerName } = require("../lib/utils");
const { PDFDocument, rgb } = require('pdf-lib');
const { encode, decode } = require('uint8-to-base64')

async function addPageNumbersToPDF(req, res) {

    if (!req.certificate) return res.status(404).json({ message: "Certificate not found" })

    try {
        // const isDark = getCustomerName(req?.data?.input_Order.client_Name) === 4 ? rgb(1, 1, 1) : rgb(0, 0, 0)
        const pdfBuffer = decodeBase64(req.certificate);
        // Load the generated PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Modify the PDF to add 10 to each page number
        const pages = pdfDoc.getPages();
        pages.forEach((pdfPage, index) => {

            const pageNumber = index + 1  // Adjust page number by adding 10

            pdfPage.drawText(`Page ${pageNumber} of ${totalPages}`, {
                x: 520,
                y: ((getCustomerName(req?.data?.input_Order?.client_Name) === 1 || getCustomerName(req?.data?.input_Order?.client_Name) === 4) && !req?.data?.isOrderCompleted) ? 822 : 810,
                size: 9,
                color: rgb(0, 0, 0),
            });
            pdfPage.fo
        });

        const pdfBytes = await pdfDoc.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="output.pdf"',
            'Content-Length': pdfBytes.length
        });

        return res.send(Buffer.from(pdfBytes));


        // return res.json({base64:encode(pdfBytes)});
    } catch (error) {
        console.log(error);
        return res.status(500).json(error?.message)
    }

}

module.exports = { addPageNumbersToPDF }