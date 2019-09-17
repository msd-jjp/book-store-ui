export abstract class BaseWorker {
    // abstract postMessage: Worker['postMessage'];
    // abstract onmessage: Worker['onmessage'];
    abstract worker_url: string;
    abstract handler(ev: MessageEvent): void;

    async init4(): Promise<Worker | undefined> {
        return new Promise(async res => {


            if (typeof (Worker) === "undefined") return;
            let wrk = await import('../asset/script/worker.reader');
            debugger;
            // return new Worker(URL.createObjectURL(new Blob([`(${(wrk.onmessage || '').toString()})(e=null)`])));
            return new Worker(URL.createObjectURL(new Blob([(wrk.onmessage || '').toString()])));
            return new Worker(
                this.worker_url,
                // { type: 'classic' }
            );
        })
    }

    init(): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        return new Worker(
            this.worker_url,
            // { type: 'classic' }
        );
    }
    init2(): Worker | undefined {
        // const _window: any = window;
        // if (!_window.Worker) return;
        if (typeof (Worker) === "undefined") return;


        let code = (this.handler || '').toString();
        if (this.handler) {
            code = code.replace('handler', 'onmessage = function ');
        }
        const blob = new Blob(["(" + code + ")()"]);
        // const blob = new Blob(["(" + code + ")()"], { type: 'application/javascript' } );
        // let vdvds: any = this.handler;
        // const blob = new Blob([code], { type: 'application/javascript' });
        // const blob = new Blob([code]);
        return new Worker(URL.createObjectURL(blob));


        /* 
                let str = JSON.stringify(this.handler);
        
                // let str_func = `onmessage = function () { JSON.parse(${str})(); }`;
                let str_func = `onmessage = function () { (${this.handler})(); }`;
                const blob = new Blob(["(" + str_func + ")()"], { type: 'application/javascript' });
                return new Worker(URL.createObjectURL(blob));
                 */

        // Worker
    }
}