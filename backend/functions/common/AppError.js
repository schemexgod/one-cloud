
export class AppError extends Error {
    /** @type {number} */
    code = 500
    /** @type {string} */
    message = "Error occurred"

    /**
     * 
     * @param {string} message 
     * @param {number} code 
     */
    constructor(message, code) {
        super(message)
        this.message = message
        this.code = code
    }
}