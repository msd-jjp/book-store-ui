export abstract class BaseWorker {
    // abstract postMessage: Worker['postMessage'];
    // abstract onmessage: Worker['onmessage'];
    // abstract worker_url: string;
    // abstract handler(ev: MessageEvent): void;

    protected abstract init(...p:any): Worker | undefined;
}