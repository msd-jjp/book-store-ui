import { Store2 } from "../../redux/store";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme, IReader_schema_epub_fontName } from "../../redux/action/reader/readerAction";
import { MsdBookGenerator } from "../../webworker/reader-engine/MsdBookGenerator";
import { LANGUAGES } from "../../enum/language";
import { CmpUtility } from "../_base/CmpUtility";
import { IBookContent, IBookPosIndicator, WasmWorkerHandler } from "../../webworker/reader-engine/MsdBook";
import { AudioBookGenerator } from "../../webworker/reader-engine/AudioBookGenerator";
import { PdfBookGenerator } from "../../webworker/reader-engine/PdfBookGenerator";
import { ReaderDownload } from "../../webworker/reader-engine/reader-download/reader-download";
import { BOOK_TYPES } from "../../enum/Book";

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
        isOriginalFile: boolean;
        bookPageSize: { width: number; height: number; };
        theme: IReader_schema_epub_theme;
        fontSize: number;
        fontName: IReader_schema_epub_fontName;
        zoom: number;
        book: MsdBookGenerator | PdfBookGenerator;
    } | undefined;
    private static checkEpubBookExist(book_id: string, isOriginalFile: boolean, bookPageSize?: { width: number; height: number; }): boolean {
        const reader_state = { ...Store2.getState().reader };
        const reader_epub = reader_state.epub;

        const existBookObj = ReaderUtility._createEpubBook_instance;
        if (existBookObj) {
            const b_p_size = bookPageSize || reader_epub.pageSize;
            if (
                existBookObj.book_id === book_id
                && existBookObj.isOriginalFile === isOriginalFile
                && existBookObj.bookPageSize.width === b_p_size.width
                && existBookObj.bookPageSize.height === b_p_size.height
                && existBookObj.fontSize === reader_epub.fontSize
                && existBookObj.fontName === reader_epub.fontName
                && existBookObj.theme === reader_epub.theme
                && existBookObj.zoom === reader_epub.zoom
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
        isOriginalFile: boolean,
        bookPageSize?: { width: number; height: number; },
        isDocument?: boolean
    ): Promise<MsdBookGenerator | PdfBookGenerator> {
        // debugger;
        if (ReaderUtility.checkEpubBookExist(book_id, isOriginalFile, bookPageSize)) {
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

        let valid_fontSize = reader_epub.fontSize;
        if (valid_fontSize > 50) { valid_fontSize = 50; }
        else if (valid_fontSize < 5) { valid_fontSize = 5; }

        let textBookClass: any; // MsdBookGenerator | PdfBookGenerator | undefined;
        if (isDocument) textBookClass = PdfBookGenerator;
        else textBookClass = MsdBookGenerator;

        const ww = await ReaderDownload.getReaderWorkerHandler();
        if (ww === undefined) throw new Error('WorkerHandler failed possible');
        await ReaderUtility.wait_readerEngine_init(ww);

        const _book: MsdBookGenerator | PdfBookGenerator = await textBookClass.getInstace(
            book_id,
            isOriginalFile,
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
            isOriginalFile: isOriginalFile,
            book: _book,
            fontName: reader_epub.fontName,
            fontSize: reader_epub.fontSize,
            theme: reader_epub.theme,
            bookPageSize: _bookPageSize,
            zoom: reader_epub.zoom
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

    private static _renderViewablePages_isRun = false;
    static async renderViewablePages(bi: MsdBookGenerator | PdfBookGenerator, selector?: string) {
        if (ReaderUtility._renderViewablePages_isRun) return;
        ReaderUtility._renderViewablePages_isRun = true;

        selector = selector || '.swiper-container .swiper-slide img.page-img';

        const img_list: Array<Element> = Array.apply(null, (document.querySelectorAll(selector!) as any)) as Array<Element>;
        const img_pageIndex_list = img_list.map(img => parseInt(img.getAttribute('data-src') as string));

        const img_has_src_list = img_list.map(img => img.getAttribute('src') !== null);
        // console.log('****', img_has_src_list, img_pageIndex_list);
        const isRenderFinished = img_has_src_list.reduce((oldVal, CurrnetVal) => {
            return oldVal && CurrnetVal;
        }, true);

        if (isRenderFinished) {
            ReaderUtility._renderViewablePages_isRun = false;
            return;
        }


        for (let i = 0; i < img_list.length; i++) {
            if (img_has_src_list[i]) continue;
            if (isNaN(img_pageIndex_list[i])) {
                // console.error('isNaN(img_pageIndex_list[i])--------------', i);
                continue;
            }

            try {
                /* let page = await bi.db_getPage_ifExist(img_pageIndex_list[i]);
                if (page === undefined) {
                    page = await bi.getPage(img_pageIndex_list[i]);
                    // page = await bi.getPage(10000000000);
                } */
                const page = await bi.getPage(img_pageIndex_list[i]);

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

    /** not complete, not doing anything */
    /* static async storeBookAllPage(bi: MsdBookGenerator | PdfBookGenerator): Promise<void> {
        if (ReaderUtility._renderViewablePages_isRun) return;
        const all = await bi.getAllPages_pos();
        const lastPageIndex = all.length ? all.length - 1 : -1;
        if (lastPageIndex === -1) return;

        for (let i = 0; i < lastPageIndex; i++) {
            await bi.getPage(i);
        }
    } */

    static calc_bookContentPos_value(bookPosIndicator: IBookPosIndicator): number {
        return bookPosIndicator.group * 1000000 + bookPosIndicator.atom;
    }

    private static _checkEpubBook_chapters_exist: {
        chapters: IEpubBook_chapters;
        book_id: string;
        isOriginalFile: boolean;
    } | undefined;
    private static checkEpubBook_chapters_exist(book_id: string, isOriginalFile: boolean) {
        if (ReaderUtility._checkEpubBook_chapters_exist) {
            if (
                ReaderUtility._checkEpubBook_chapters_exist.chapters
                && ReaderUtility._checkEpubBook_chapters_exist.book_id === book_id
                && ReaderUtility._checkEpubBook_chapters_exist.isOriginalFile === isOriginalFile
            ) {
                return true;
            }
            return false;
        }
        return false;
    }
    static createEpubBook_chapters(book_id: string, isOriginalFile: boolean, chapterList: IBookContent[]): IEpubBook_chapters {
        if (ReaderUtility.checkEpubBook_chapters_exist(book_id, isOriginalFile)) {
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

        // note --> this sort not work 100% (group * 1000000 + atom not always correct)
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
            isOriginalFile,
            chapters: {
                tree: _epubBook_chapters,
                flat: chapterList_flat
            }
        };

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
                // if (!flat_chapters[index - 1].clickable) {
                if (flat_chapters[index - 1].clickable) { //
                    // return;
                    // }
                    let prev_ch = chapters_with_page[index - 1];
                    prev_ch.lastPageIndex = prev_ch.firstPageIndex === obj.firstPageIndex ? obj.firstPageIndex :
                        obj.firstPageIndex ? obj.firstPageIndex - 1 : undefined;
                } //
            }
            if (index === flat_chapters.length - 1) {
                chapters_with_page[index].lastPageIndex = pagePosList.length - 1;
            }
        });
        // debugger;
        return chapters_with_page;
    }

    private static _createAudioBook_instance: {
        book_id: string;
        isOriginalFile: boolean;
        book: AudioBookGenerator;
    } | undefined;
    private static checkAudioBookExist(book_id: string, isOriginalFile: boolean): boolean {
        const existBookObj = ReaderUtility._createAudioBook_instance;
        if (existBookObj) {
            if (
                existBookObj.book_id === book_id
                && existBookObj.isOriginalFile === isOriginalFile
            ) {
                return true;
            }
        }
        return false;
    }
    static clearAudioBookInstance() {
        ReaderUtility._createAudioBook_instance = undefined;
    }
    static async createAudioBook(book_id: string, bookFile: Uint8Array, isOriginalFile: boolean): Promise<AudioBookGenerator> {
        // debugger;
        if (ReaderUtility.checkAudioBookExist(book_id, isOriginalFile)) {
            return ReaderUtility._createAudioBook_instance!.book;
        }

        const ww = await ReaderDownload.getReaderWorkerHandler();
        if (ww === undefined) throw new Error('WorkerHandler failed possible');
        await ReaderUtility.wait_readerEngine_init(ww);
        const _book = await AudioBookGenerator.getInstance(ww, bookFile);

        ReaderUtility._createAudioBook_instance = {
            book_id, isOriginalFile, book: _book
        };

        return _book;
    }

    static is_book_document(bookType: BOOK_TYPES): boolean {
        if (bookType === BOOK_TYPES.Pdf || bookType === BOOK_TYPES.Epub) return true;
        return false;
    }

}
