enum HTTP_statusCode {
    OK = 200,
    NoChange = 301,
    TaskFailed = 304,
    BadRequest = 400,
    Unauthorized = 401,
    NoAccess = 403,
    NotFound = 404,
    Conflict = 409,
    Expired = 410,
    InternalServerError = 500,
    ServiceUnavailable = 503,
 };
 
 export default HTTP_statusCode;