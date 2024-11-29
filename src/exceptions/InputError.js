const ClientError = require("../exceptions/ClientError");
 
class InputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InputError';
        this.statusCode = 400; // Custom status code
    }
}

module.exports = InputError;
