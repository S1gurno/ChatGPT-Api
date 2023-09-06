
export default class ContextOverflowError extends Error {
    constructor(message) {
        super(message);
        this.name = "ContextOverflowError";
        this.status = 400;
    }
}