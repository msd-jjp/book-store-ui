import { ReaderUtils } from "./ReaderUtils";

interface IReaderMessageEvent extends MessageEvent {
    data: { book_active_page: number };
}

export default onmessage = async function (e: IReaderMessageEvent) {
    // if (!e.data.book_id || !e.data.library) return;
    // if (!e.data.book_active_page) return;
    let bookSlideList = await ReaderUtils.getBookSlideList();
    let active_slide: number | undefined;
    if (e.data.book_active_page) {
        active_slide = ReaderUtils.calc_active_slide(bookSlideList, e.data.book_active_page)
    }
    // ReaderUtils.forLoop(5000000000);
    postMessage({ bookSlideList, active_slide });
}

// export default onmessage as any;
// export default onmessage as typeof Worker;
// export default {} as typeof Worker & (new () => Worker);
// export default {} as typeof Worker; // & (new () => Worker);
