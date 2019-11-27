import { Store2 } from "../../redux/store";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme, IReader_schema_epub_fontName } from "../../redux/action/reader/readerAction";
import { BookGenerator } from "../../webworker/reader-engine/BookGenerator";
import { LANGUAGES } from "../../enum/language";
import { CmpUtility } from "../_base/CmpUtility";
import { IBookContent, IBookPosIndicator, WasmWorkerHandler } from "../../webworker/reader-engine/MsdBook";
import { AudioBookGenerator } from "../../webworker/reader-engine/AudioBookGenerator";
import { PdfBookGenerator } from "../../webworker/reader-engine/PdfBookGenerator";
// import { appLocalStorage } from "../../service/appLocalStorage";
import { ReaderDownload } from "../../webworker/reader-engine/reader-download/reader-download";
// import { Reader2Worker } from "../../webworker/reader2-worker/Reader2Worker";
// import wasmWorker from 'wasm-worker';


interface IEpubBook_chapters_flat {
    content: IBookContent | undefined;
    clickable: boolean;
    id: string | undefined;
    parentId: string | undefined;
    level: number | undefined;
}
type IEpubBook_chapters_flat_list = IEpubBook_chapters_flat[];
interface IEpubBook_chapters_tree extends IEpubBook_chapters_flat {
    children: IEpubBook_chapters_tree[],
}

export interface IEpubBook_chapters {
    tree: IEpubBook_chapters_tree;
    flat: IEpubBook_chapters_flat_list;
}

export abstract class ReaderUtility {

    private static getEpubBook_theme(theme: IReader_schema_epub_theme): { fontColor: number, bgColor: number } {
        let bgColor = color(255, 255, 255, 0);
        let fontColor = color(0, 0, 0, 255);

        if (theme === 'white') {
        } else if (theme === 'dark') {
            fontColor = color(255, 255, 255, 255);
            // bgColor = color(0, 0, 0, 255);
        } else if (theme === 'green') {
            // bg = color(197, 231, 206, 255);
            fontColor = color(58, 73, 66, 255);
        } else if (theme === 'sepia') {
            // bg = color(239, 219, 189, 255);
            fontColor = color(90, 65, 41, 255);
        }

        return { fontColor, bgColor };
    }

    private static _createEpubBook_instance: {
        book_id: string;
        bookPageSize: { width: number; height: number; };
        theme: IReader_schema_epub_theme;
        fontSize: number;
        fontName: IReader_schema_epub_fontName;
        book: BookGenerator | PdfBookGenerator;
    } | undefined;
    private static checkEpubBookExist(book_id: string, bookPageSize?: { width: number; height: number; }): boolean {
        const reader_state = { ...Store2.getState().reader };
        const reader_epub = reader_state.epub;

        const existBookObj = ReaderUtility._createEpubBook_instance;
        if (existBookObj) {
            const b_p_size = bookPageSize || reader_epub.pageSize;
            if (
                existBookObj.book_id === book_id
                && existBookObj.bookPageSize.width === b_p_size.width
                && existBookObj.bookPageSize.height === b_p_size.height
                && existBookObj.fontSize === reader_epub.fontSize
                && existBookObj.fontName === reader_epub.fontName
                && existBookObj.theme === reader_epub.theme
            ) {
                return true;
            }
        }
        return false;
    }
    static clearEpubBookInstance() {
        ReaderUtility._createEpubBook_instance = undefined;
    }
    static async createEpubBook(
        book_id: string,
        bookFile: Uint8Array,
        bookPageSize?: { width: number; height: number; },
        isPdf?: boolean
    ): Promise<BookGenerator | PdfBookGenerator> {
        // debugger;
        if (ReaderUtility.checkEpubBookExist(book_id, bookPageSize)) {
            return ReaderUtility._createEpubBook_instance!.book;
        }
        // debugger;

        const reader_state = { ...Store2.getState().reader };
        const reader_epub = reader_state.epub;
        let shouldUpdateReaderState = false;

        let font!: Uint8Array;
        // reader_epub.fontFiles = {};
        if (reader_epub.fontFiles[reader_epub.fontName]) {
            font = new Uint8Array(reader_epub.fontFiles[reader_epub.fontName]!);
        } else {
            const font_arrayBuffer = await getFont(`reader/fonts/${reader_epub.fontName}.ttf`);
            font = new Uint8Array(font_arrayBuffer);
            reader_epub.fontFiles[reader_epub.fontName] = Array.from(font);
            shouldUpdateReaderState = true;
        }

        let _bookPageSize;
        if (bookPageSize) {
            _bookPageSize = bookPageSize;
            reader_epub.pageSize = bookPageSize;
            shouldUpdateReaderState = true;
        } else {
            _bookPageSize = reader_epub.pageSize;
        }

        if (shouldUpdateReaderState) {
            Store2.dispatch(action_update_reader(reader_state));
        }

        const reader_epub_theme = ReaderUtility.getEpubBook_theme(reader_epub.theme);

        // await ReaderUtility.wait_loadReaderEngine();
        // await CmpUtility.waitOnMe(10000); // todo: _DELETE_ME

        let valid_fontSize = reader_epub.fontSize;
        if (valid_fontSize > 50) { valid_fontSize = 50; }
        else if (valid_fontSize < 5) { valid_fontSize = 5; }



        /* const _reader2Worker = new Reader2Worker();
        _reader2Worker.postMessage({
            type: 'generate',
            config: {
                bookFile,
                width: _bookPageSize.width,
                height: _bookPageSize.height,
                font,
                fontSize: valid_fontSize,
                fontColor: reader_epub_theme.fontColor,
                bgColor: reader_epub_theme.bgColor
            }
        });
        _reader2Worker.onmessage((book: BookGenerator) => {
            debugger;
        }); */

        let textBookClass: any; // BookGenerator | PdfBookGenerator | undefined;
        if (isPdf) textBookClass = PdfBookGenerator;
        else textBookClass = BookGenerator;

        /* const _book = new textBookClass( // BookGenerator
            bookFile,
            _bookPageSize.width,
            _bookPageSize.height,
            font,
            valid_fontSize, // reader_epub.fontSize,
            reader_epub_theme.fontColor,
            reader_epub_theme.bgColor
        ); */

        // let w = new Worker("/reader/reader2.js");
        // let ww = new WasmWorkerHandler(w);
        const ww = await ReaderDownload.getReaderWorkerHandler();
        await ReaderUtility.wait_readerEngine_init(ww);
        const _book = await textBookClass.getInstace(
            ww,
            bookFile,
            _bookPageSize.width,
            _bookPageSize.height,
            font,
            valid_fontSize, // reader_epub.fontSize,
            reader_epub_theme.fontColor,
            reader_epub_theme.bgColor
        );

        ReaderUtility._createEpubBook_instance = {
            book_id: book_id,
            book: _book,
            fontName: reader_epub.fontName,
            fontSize: reader_epub.fontSize,
            theme: reader_epub.theme,
            bookPageSize: _bookPageSize
        };

        return _book;
    }

    private static wait_readerEngine_init(ww: WasmWorkerHandler): Promise<any> {
        return new Promise(async (res, rej) => {
            for (let i = 0; i < 100; i++) { // 50
                // await CmpUtility.waitOnMe((i + 1) * 200);
                await CmpUtility.waitOnMe(200);

                const num = await ww.aTestFunc(1).catch(e => {
                    console.log('loading readerEngine', e); // e === Not Initialized
                });

                if (num) {
                    res(true);
                    break;
                }

            }
            rej();
        });
    }

    private static rtlLanguage_list: LANGUAGES[] = [LANGUAGES.PERSIAN, LANGUAGES.ARABIC];
    static isBookRtl(lang: LANGUAGES | undefined): boolean {
        if (!lang) return true;
        else return ReaderUtility.rtlLanguage_list.includes(lang);
    }

    /* private static _check_swiperImg_loaded_timer: any;
    static check_swiperImg_loaded(selector?: string) {
        selector = selector || '.swiper-container .swiper-slide img.page-img';

        if (ReaderUtility._check_swiperImg_loaded_timer) {
            clearTimeout(ReaderUtility._check_swiperImg_loaded_timer);
        }

        ReaderUtility._check_swiperImg_loaded_timer = setTimeout(async () => {

            const img_list = document.querySelectorAll(selector!);
            for (let i = 0; i < img_list.length; i++) {
                if (!img_list[i].getAttribute('src')) {
                    const d_s = img_list[i].getAttribute('data-src');
                    if (d_s) {
                        img_list[i].setAttribute('src', d_s);
                        console.log(await d_s);
                    }
                }
            }

        }, 300);
    } */

    private static _renderViewablePages_isRun = false;
    static async renderViewablePages(bi: BookGenerator | PdfBookGenerator, selector?: string) {
        if (ReaderUtility._renderViewablePages_isRun) return;
        ReaderUtility._renderViewablePages_isRun = true;
        debugger;
        selector = selector || '.swiper-container .swiper-slide img.page-img';

        const img_list: Array<Element> = Array.apply(null, (document.querySelectorAll(selector!) as any)) as Array<Element>;
        const img_pageIndex_list = img_list.map(img => parseInt(img.getAttribute('data-src') as string));

        const img_has_src_list = img_list.map(img => img.getAttribute('src') !== null);
        console.log(img_has_src_list, img_pageIndex_list);
        const isRenderFinished = img_has_src_list.reduce((oldVal, CurrnetVal) => {
            return oldVal && CurrnetVal;
        }, true);

        if (isRenderFinished) {
            ReaderUtility._renderViewablePages_isRun = false;
            return;
        }
        debugger;

        for (let i = 0; i < img_list.length; i++) {
            if (img_has_src_list[i]) continue;
            if (isNaN(img_pageIndex_list[i])) {
                // console.error('isNaN(img_pageIndex_list[i])--------------', i);
                continue;
            }

            try {
                let page = await bi.db_getPage_ifExist(img_pageIndex_list[i]);
                if (page === undefined) {
                    page = await bi.getPage(img_pageIndex_list[i]);
                }

                page && img_list[i].setAttribute('src', page);
            } catch (e) {
                if (e !== 'WASM BUSY') {
                    // toast render problem
                    console.log('e !== WASM BUSY', e);
                    ReaderUtility._renderViewablePages_isRun = false;
                    return;
                }
                break;
            }

        }

        setTimeout(ReaderUtility.renderViewablePages, 100, bi, selector);
        ReaderUtility._renderViewablePages_isRun = false;
    }

    private static check_swiperImg_with_delay_timer: any;
    static async check_swiperImg_with_delay_DELETE_ME(bi: BookGenerator | PdfBookGenerator, selector?: string) {
        selector = selector || '.swiper-container .swiper-slide img.page-img';

        if (ReaderUtility.check_swiperImg_with_delay_timer) {
            clearTimeout(ReaderUtility.check_swiperImg_with_delay_timer);
        }

        ReaderUtility.check_swiperImg_with_delay_timer = setTimeout(async () => {

            for (let t = 0; t < 10; t++) {
                let _continue = false;

                const img_list = document.querySelectorAll(selector!);
                for (let i = 0; i < img_list.length; i++) {

                    const has_src = img_list[i].getAttribute('src') !== null;
                    _continue = _continue || has_src === false;

                    if (!has_src) {
                        // console.log('---------------t', t, Date.now() / 1000);
                        // await CmpUtility.waitOnMe(3000);
                        const d_s = img_list[i].getAttribute('data-src');
                        if (d_s) {

                            // for (let t = 0; t < 10; t++) {
                            let d_s_page = bi.getPage_ifExist(parseInt(d_s));
                            if (!d_s_page) {
                                try {
                                    d_s_page = await bi.getPage(parseInt(d_s));
                                } catch (e) {
                                    console.log('d_s_page = await bi.getPage(parseInt(d_s));', d_s);
                                }
                            }
                            if (!d_s_page) {
                                console.log('check_swiperImg_with_delay', d_s, false);
                                await CmpUtility.waitOnMe(100);
                            } else {
                                console.log('check_swiperImg_with_delay', d_s, true);
                                img_list[i].setAttribute('src', d_s_page);
                                break;
                            }

                        }
                    }
                }

                if (!_continue) {
                    console.log('_continue --> breaked on: ', t, _continue);
                    break;
                }
            }

        }, 300);
    }

    static calc_bookContentPos_value(bookPosIndicator: IBookPosIndicator): number {
        return bookPosIndicator.group * 1000000 + bookPosIndicator.atom;
    }

    private static _checkEpubBook_chapters_exist: {
        chapters: IEpubBook_chapters;
        book_id: string
    } | undefined;
    private static checkEpubBook_chapters_exist(book_id: string) {
        if (ReaderUtility._checkEpubBook_chapters_exist) {
            if (
                ReaderUtility._checkEpubBook_chapters_exist.chapters &&
                ReaderUtility._checkEpubBook_chapters_exist.book_id === book_id
            ) {
                return true;
            }
            return false;
        }
        return false;
    }
    static createEpubBook_chapters(book_id: string, chapterList: IBookContent[]): IEpubBook_chapters {
        if (ReaderUtility.checkEpubBook_chapters_exist(book_id)) {
            return ReaderUtility._checkEpubBook_chapters_exist!.chapters;
        }

        let chapterList_flat: IEpubBook_chapters_flat_list = chapterList.map(ibc => {
            return {
                content: ibc,
                clickable: (ibc.pos.atom === -1 && ibc.pos.group === -1) ? false : true,
                // id: ibc.pos.group * 1000000 + ibc.pos.atom + '-' + ibc.parentIndex,
                id: ReaderUtility.calc_bookContentPos_value(ibc.pos) + '-' + ibc.parentIndex,
                parentId: (ibc.parentIndex === 65535) ? undefined :
                    (chapterList[ibc.parentIndex])
                        // ? chapterList[ibc.parentIndex].pos.group * 1000000 + chapterList[ibc.parentIndex].pos.atom + '-' + chapterList[ibc.parentIndex].parentIndex
                        ? ReaderUtility.calc_bookContentPos_value(chapterList[ibc.parentIndex].pos) + '-' + chapterList[ibc.parentIndex].parentIndex
                        : undefined,
                level: undefined
            }
        });

        // todo --> this sort not work 100% (group * 1000000 + atom not always correct)
        chapterList_flat.sort((a, b) => {
            // const a_num = a.content!.pos.group * 1000000 + a.content!.pos.atom;
            // const b_num = b.content!.pos.group * 1000000 + b.content!.pos.atom;
            const a_num = ReaderUtility.calc_bookContentPos_value(a.content!.pos);
            const b_num = ReaderUtility.calc_bookContentPos_value(b.content!.pos);
            if (a_num < b_num) {
                return -1;
            } else if (a_num > b_num) {
                return 1;
            }
            return 0;
        });

        const searchTree = (ch: IEpubBook_chapters_tree, id: string): IEpubBook_chapters_tree | null => {
            if (ch.id === id) {
                return ch;
            } else if (ch.children.length) {
                let i;
                let result = null;
                for (i = 0; result === null && i < ch.children.length; i++) {
                    result = searchTree(ch.children[i], id);
                }
                return result;
            }
            return null;
        }

        const _epubBook_chapters: IEpubBook_chapters_tree | undefined
            = { clickable: false, content: undefined, children: [], id: undefined, parentId: undefined, level: undefined };

        if (chapterList_flat[0].content!.parentIndex === 65535) {
            _epubBook_chapters.content = chapterList_flat[0].content;
            _epubBook_chapters.id = chapterList_flat[0].id;
            _epubBook_chapters.parentId = chapterList_flat[0].parentId;
            _epubBook_chapters.level = 0;
        }
        chapterList_flat.forEach(ch => {
            if (ch.content!.parentIndex !== 65535) {
                if (!ch.parentId) return;
                const p_ch = searchTree(_epubBook_chapters!, ch.parentId);
                if (!p_ch) return;
                ch.level = (p_ch.level || p_ch.level === 0) ? p_ch.level + 1 : undefined
                p_ch.children.push({
                    content: ch.content,
                    parentId: ch.parentId,
                    id: ch.id,
                    clickable: (ch.content!.pos.atom === -1 && ch.content!.pos.group === -1) ? false : true,
                    children: [],
                    level: ch.level
                });
            }
        });

        ReaderUtility._checkEpubBook_chapters_exist = {
            book_id,
            chapters: {
                tree: _epubBook_chapters,
                flat: chapterList_flat
            }
        }

        return {
            tree: _epubBook_chapters,
            flat: chapterList_flat
        };
    }


    static getPageIndex_byChapter(chapterPos: IBookPosIndicator, pagePosList: number[], isPdf: boolean): number | undefined {
        if (!chapterPos /* || !pagePosList.length */) {
            return;
        }

        if (isPdf) {
            return chapterPos.group !== -1 ? chapterPos.group : undefined;
        }

        if (!pagePosList.length) {
            return;
        }

        // const chapterId = chapterPos.group * 1000000 + chapterPos.atom;
        const chapterId = ReaderUtility.calc_bookContentPos_value(chapterPos);
        let pageIndex = undefined;
        for (var i = 0; i < pagePosList.length; i++) {
            if (pagePosList[i] === chapterId) {
                pageIndex = i;
                break;
            } else if (pagePosList[i] > chapterId) {
                pageIndex = i - 1;
                break;
            }
        }

        if (pageIndex && pageIndex < 0) return;

        if (pageIndex === undefined && pagePosList.length) {
            pageIndex = pagePosList.length - 1;
        }

        return pageIndex;
    }

    static calc_chapters_pagesIndex(pagePosList: number[], flat_chapters: IEpubBook_chapters_flat_list, isPdf: boolean)
        : { firstPageIndex: number | undefined, lastPageIndex: number | undefined }[] | undefined {

        if (!pagePosList.length) return;

        const chapters_with_page: { firstPageIndex: number | undefined, lastPageIndex: number | undefined }[] = [];
        // debugger;
        flat_chapters.forEach((ch, index) => {
            if (!ch.clickable) {
                chapters_with_page.push({ firstPageIndex: undefined, lastPageIndex: undefined });
                return;
            }

            const obj: { firstPageIndex: number | undefined, lastPageIndex: number | undefined } = {
                firstPageIndex: ReaderUtility.getPageIndex_byChapter(ch.content!.pos, pagePosList, isPdf),
                lastPageIndex: undefined
            };

            chapters_with_page.push(obj);

            if (index !== 0) {
                if (!flat_chapters[index - 1].clickable) {
                    return;
                }
                let prev_ch = chapters_with_page[index - 1];
                prev_ch.lastPageIndex = prev_ch.firstPageIndex === obj.firstPageIndex ? obj.firstPageIndex :
                    obj.firstPageIndex ? obj.firstPageIndex - 1 : undefined;
            }
            if (index === flat_chapters.length - 1) {
                chapters_with_page[index].lastPageIndex = pagePosList.length - 1;
            }
        });
        // debugger;
        return chapters_with_page;
    }

    static async createAudioBook(book_id: string, bookFile: Uint8Array): Promise<AudioBookGenerator> {
        debugger;
        //todo: check book exist

        // await ReaderUtility.wait_loadReaderEngine();
        // await CmpUtility.waitOnMe(10000); // todo: _DELETE_ME

        // return new AudioBookGenerator(bookFile);

        // createWorkerContent
        /* const wasmFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.WASM_BOOK_ID);
        const readerFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.READER2_BOOK_ID);
        debugger;

        var readerFile_string = new TextDecoder("utf-8").decode(readerFile);
        const blob = ReaderUtility.createWorkerContent(readerFile_string);

        let w = new Worker(blob); // "/reader/reader2.js"
        w.postMessage({ bin: wasmFile });
        let ww = new WasmWorkerHandler(w); */

        const ww = await ReaderDownload.getReaderWorkerHandler();
        await ReaderUtility.wait_readerEngine_init(ww);
        return await AudioBookGenerator.getInstance(ww, bookFile);
    }

    // static createWorkerContent(content: string) {
    //     let blob;
    //     if (Blob) {
    //         blob = new Blob([content], { type: 'application/javascript' });
    //     } else {
    //         let BlobBuilder = (window as any).BlobBuilder || (window as any).WebKitBlobBuilder || (window as any).MozBlobBuilder;
    //         blob = new BlobBuilder();
    //         blob.append(content);
    //         blob = blob.getBlob();
    //     }
    //     return URL.createObjectURL(blob);
    // }

}
