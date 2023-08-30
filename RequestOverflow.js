export default class RequestOverflowError extends Error {
    constructor(message) {
        super(message);
        this.name = "RequestOverflowError";
        this.status = 429;
    }
}