import { Response } from "express";
import { CustomError } from "../error/customError";

export function handleError(res:Response, error :any ,contextMessage : string) : void {
    if(error instanceof CustomError) {
        res.status(error.statusCode).json({message : error.message})
    }else{
        console.error(`Unexpected error in  ${contextMessage}: ${error}`);
        res.status(500).json({message : 'Internal Server Error,Please Try Again'})
    }
}