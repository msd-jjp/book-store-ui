import { ReaderUtils } from "./ReaderUtils";

export default onmessage = async function (e) {
    // if (!e.data.book_id || !e.data.library) return;
    // if (!e.data.book_active_page) return;
    let bookSlideList = await ReaderUtils.getBookSlideList();
    let active_slide;
    if (e.data.book_active_page) {
        active_slide = ReaderUtils.calc_active_slide(bookSlideList, e.data.book_active_page)
    }
    postMessage({ bookSlideList, active_slide });
}
