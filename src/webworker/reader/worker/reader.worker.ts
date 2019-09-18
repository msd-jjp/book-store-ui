import { Utility } from "../../../asset/script/utility";

export default onmessage = async function (e) {
    if (!e.data.book_id || !e.data.library) return;
    console.log('waiting 1000 ms...');
    await waitOnMe(1000);
    postMessage({ y_data: e.data, round_n: round_n() });
}

function waitOnMe(timer = 500) {
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(true);
        }, timer);
    });
}

function round_n() {
    return Utility.round_num_decimals(5.32564);
}