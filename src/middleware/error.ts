export class ErrorHandler extends Error {
    constructor(public statusCode: number, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

export const handleError = (err: ErrorHandler, res: any) => {
    const { statusCode, message } = err;
    return res.status(statusCode).json({
        errors: [
            {
                msg: message,
            },
        ],
    });
};
