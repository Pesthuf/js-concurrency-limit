export default class ConcurrencyLimitScope {
    constructor(maxConcurrency = 2) {
        this.scheduledStuff = [];
        this.currentlyPendingTasks = 0;
        this.maxConcurrency = maxConcurrency;
    }

    /**
     * @param {function() : Promise} creatorFunc
     */
    scheduleWork(creatorFunc) {
        let res, rej;
        const promise = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject
        });
        this.scheduledStuff.push({f: creatorFunc, res, rej});
        this.tick();

        return promise;
    }


    tick() {
        let newTasks = this.scheduledStuff.splice(0, this.maxConcurrency - this.currentlyPendingTasks);
        this.currentlyPendingTasks += newTasks.length;

        for (const newTask of newTasks) {
            let promise = newTask.f();
            promise.then((val) => {
                newTask.res(val);
                this.currentlyPendingTasks--;
                this.tick();
            }, (err) => {
                newTask.rej(err);
                this.currentlyPendingTasks--;
                this.tick();
            });
        }
    }
}


function timeout(str, time) {
    return new Promise(function (res) {
        setTimeout(function () {
            res();
            console.log(`Work ${str} done`);
        }, time);
    })
}

