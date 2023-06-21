class appError extends Error {

    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message)

        this.statusCode = statusCode;
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
        Object.setPrototypeOf(this, appError)
    }
}

export default appError