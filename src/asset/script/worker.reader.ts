export const onmessage =  async function onmessage(e: MessageEvent) { // : MessageEvent
    console.log('Worker: Message received from main script');
    if (!e) return;
    let result = e.data[0] * e.data[1];
    const _postMessage: any = postMessage;
    if (isNaN(result)) {
        _postMessage('Please write two numbers');
    } else {
        let workerResult = 'Result: ' + result;
        console.log('Worker: Posting message back to main script');
        console.log('waiting...');
        await waitOnMe(3000);
        _postMessage(workerResult);
    }
}

function waitOnMe(timer = 500) {
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(true);
        }, timer);
    });
}