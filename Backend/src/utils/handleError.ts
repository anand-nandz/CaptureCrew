import { Response } from "express";
import { CustomError, StripeRefundError } from "../error/customError";

export function handleError(res: Response, error: any, contextMessage: string): void {

    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
             message: error.message 
        });
    } else if (error instanceof StripeRefundError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            type: error.type,
            code: error.code
        });
    } else {
        console.error(`Unexpected error in  ${contextMessage}: ${error}`);
        res.status(500).json({ 
            message: 'Internal Server Error,Please Try Again' 
        })
    }
}