function renderTemplate(router,template, data) {
    return new Promise((resolve, reject) => {
        router.render(template, data, (err, html) => {
            if (err) { reject(err) }
            else {        // Wait for the canvas element to be visible

                resolve(html)
            };
        });
    });
}

function getCustomerName(name) {
    switch (name) {
        case "River City National Title":
            return 1
        case "Texas Family Title":
            return 2
        case "TaxCertPros LLC":
            return 3
        case "The Title Company":
            return 4
        case "Independence Title":
            return 5
        default:
            return 0
    }
}

function formatPhoneNumber(phoneNumber) {
    // Check if the input is a valid phone number
    if (!/^\+\d{11}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
  
    // Extract the area code, central office code, and line number
    const areaCode = phoneNumber.slice(2, 5);
    const centralOfficeCode = phoneNumber.slice(5, 8);
    const lineNumber = phoneNumber.slice(8);
  
    // Format the phone number
    return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
  }
  
  function decodeBase64(base64String) {
    return Buffer.from(base64String, 'base64');
}

module.exports = {renderTemplate, getCustomerName, formatPhoneNumber, decodeBase64}