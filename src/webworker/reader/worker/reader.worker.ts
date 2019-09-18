import { Utility } from "../../../asset/script/utility";
import { getBookTree_mock, getBookSlideList_mock, calc_active_slide } from "./mock";

export default onmessage = async function (e) {
    // if (!e.data.book_id || !e.data.library) return;
    // if (!e.data.book_active_page) return;
    let bookSlideList = await getBookSlideList();
    let active_slide;
    if (e.data.book_active_page) {
        active_slide = calc_active_slide(bookSlideList, e.data.book_active_page)
    }
    postMessage({ bookSlideList, active_slide });
}

// async function getBookTree() {
//     return new Promise(res => {
//         res(getBookTree_mock());
//     });
// }



async function getBookSlideList() {
    return new Promise(res => {
        res(getBookSlideList_mock());
    });
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