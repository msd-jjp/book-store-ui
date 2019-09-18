onmessage = async function (e) {
    console.log('Worker: Message received from main script');
    let result = e.data[0] * e.data[1];
    // const _postMessage: any = postMessage;
    const _postMessage = postMessage;
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