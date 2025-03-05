import { Request, Response, NextFunction } from "express";
import { CustomError, StripeRefundError } from "../error/customError";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    } else if (err instanceof StripeRefundError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            type: err.type,
            code: err.code,
        });
    } else {
        console.error(`Unexpected error: ${err}`);
        res.status(500).json({
            message: "Internal Server Error. Please try again later.",
        });
    }
}