export class CustomError extends Error {
    statusCode : number ;

    constructor(message : string , statusCode :number){
        super(message);
        this.statusCode = statusCode
    }
}

export class StripeRefundError extends Error {
    type: string;
    code?: string;
    statusCode: number;

    constructor(message: string, type: string, code?: string, statusCode: number = 400) {
        super(message);
        this.name = 'StripeRefundError';
        this.type = type;
        this.code = code;
        this.statusCode = statusCode;
    }
}