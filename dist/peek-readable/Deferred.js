export class Deferred {
    promise;
    resolve = () => null;
    reject = () => null;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
//# sourceMappingURL=Deferred.js.map