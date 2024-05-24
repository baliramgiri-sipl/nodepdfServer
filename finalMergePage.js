const { PDFDocument, rgb } = require('pdf-lib');
   // Load the generated PDF with pdf-lib
   const pdfDoc = await PDFDocument.load(pdfBuffer);
   const totalPages = pdfDoc.getPageCount();

   // Modify the PDF to add 10 to each page number
   const pages = pdfDoc.getPages();
   pages.forEach((pdfPage, index) => {
       const { width, height } = pdfPage.getSize();
       const pageNumber = index + 1 + 10; // Adjust page number by adding 10

       pdfPage.drawText(`Page ${pageNumber} of ${totalPages + 10}`, {
           x: width / 2 - 50,
           y: 810,
           size: 12,
           color: rgb(0, 0, 0),
       });
   });

   const pdfBytes = await pdfDoc.save();

   res.set({
       'Content-Type': 'application/pdf',
       'Content-Disposition': 'inline; filename="output.pdf"',
       'Content-Length': pdfBytes.length
   });

   res.send(Buffer.from(pdfBytes));
