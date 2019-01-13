// Put all errors classes in this file

class WrongStatusError extends Error {
    constructor (message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

class WrongPermissionsError extends Error {
    constructor (message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = {
    WrongStatusError,
    WrongPermissionsError
}