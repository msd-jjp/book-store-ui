// import { Store2 } from "../../redux/store";

// if( 'function' === typeof importScripts) {



// importScripts && importScripts('./worker');
// export const sample = 
// interface Reader_MessageEvent extends MessageEvent {
//     data: {
//         store: any,
//         data: any
//     }
// }

// export default {} as typeof Worker & (new () => Worker);
export default onmessage = async function (e) { // : MessageEvent, Reader_MessageEvent
    console.log('Worker: Message received from main script');
    let result = e.data.data[0] * e.data.data[1];
    // const _postMessage: any = postMessage;
    const _postMessage = postMessage;
    if (isNaN(result)) {
        _postMessage('Please write two numbers');
    } else {
        let workerResult = 'Result: ' + result;
        console.log('Worker: Posting message back to main script');
        console.log('waiting 1000 ms...');
        await waitOnMe(1000);
        const re_data = test_redux_getData();
        _postMessage({ workerResult, re_data, y_data:e.data });
    }
}
// export default {};// as typeof Worker & (new () => Worker);

// }
function waitOnMe(timer = 500) {
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(true);
        }, timer);
    });
}

function test_redux_getData() {
    // return { lib: Store2.getState().library, cart: Store2.getState().cart };
}