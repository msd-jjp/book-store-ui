import { calc_active_slide } from "./mock";
import { getBookSlideList, SampleMockClass } from "./reader.worker";

export default onmessage = async function (e) {
    // if (!e.data.book_id || !e.data.library) return;
    // if (!e.data.book_active_page) return;
    if (!e.data.book_active_page) return;
    debugger;
    let bookSlideList = await SampleMockClass.getBookSlideList();
    let active_slide;
    if (e.data.book_active_page) {
        active_slide = calc_active_slide(bookSlideList, e.data.book_active_page)
    }
    postMessage({ bookSlideList, active_slide });
}
