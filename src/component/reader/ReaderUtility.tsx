import { Store2 } from "../../redux/store";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme, IReader_schema_epub_fontName } from "../../redux/action/reader/readerAction";
import { BookGenerator } from "../../webworker/reader-engine/BookGenerator";
import { LANGUAGES } from "../../enum/language";
import { CmpUtility } from "../_base/CmpUtility";
import { IBookContent, IBookPosIndicator } from "../../webworker/reader-engine/MsdBook";
// import { Reader2Worker } from "../../webworker/reader2-worker/Reader2Worker";

interface IEpubBook_chapters_flat {
    content: IBookContent | undefined;
    clickable: boolean;
    id: string | undefined;
    parentId: string | undefined;
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
        book: BookGenerator;
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
    static async createEpubBook(
        book_id: string,
        bookFile: Uint8Array,
        bookPageSize?: { width: number; height: number; }
    ): Promise<BookGenerator> {
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

        await ReaderUtility.wait_loadReaderEngine();

        let valid_fontSize = reader_epub.fontSize;
        if (valid_fontSize > 50) { valid_fontSize = 50; }
        else if (valid_fontSize < 5) { valid_fontSize = 5; }



        // const _reader2Worker = new Reader2Worker();
        // _reader2Worker.postMessage({
        //     type: 'generate',
        //     config: {
        //         bookFile,
        //         width: _bookPageSize.width,
        //         height: _bookPageSize.height,
        //         font,
        //         fontSize: valid_fontSize,
        //         fontColor: reader_epub_theme.fontColor,
        //         bgColor: reader_epub_theme.bgColor
        //     }
        // });
        // _reader2Worker.onmessage((book: BookGenerator) => {
        //     debugger;
        // });



        const _book = new BookGenerator(
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

    private static wait_loadReaderEngine() {
        return new Promise(async (res, rej) => {
            if ((window as any).Module && (window as any).Module.asm && (window as any).Module.asm._malloc) { // stackSave, _malloc
                // if ((window as any).Module && (window as any).Module._malloc) { // stackSave, _malloc
                // console.log('window.Module.asm', (window as any).Module._malloc);
                res(true);
                return;
            };

            for (let i = 0; i < 50; i++) {
                await CmpUtility.waitOnMe((i + 1) * 200);
                if ((window as any).Module && (window as any).Module.asm && (window as any).Module.asm._malloc) {
                    // if ((window as any).Module && (window as any).Module._malloc) {
                    // console.log('window.Module.asm', (window as any).Module._malloc);
                    res(true);
                    break;
                };
            }
            rej();
        });
    }

    private static rtlLanguage_list: LANGUAGES[] = [LANGUAGES.PERSIAN, LANGUAGES.ARABIC];
    static isBookRtl(lang: LANGUAGES | undefined): boolean {
        if (!lang) return true;
        else return ReaderUtility.rtlLanguage_list.includes(lang);
    }

    private static _check_swiperImg_loaded_timer: any;
    static check_swiperImg_loaded(selector?: string) {
        selector = selector || '.swiper-container .swiper-slide img.page-img';

        if (ReaderUtility._check_swiperImg_loaded_timer) {
            clearTimeout(ReaderUtility._check_swiperImg_loaded_timer);
        }

        ReaderUtility._check_swiperImg_loaded_timer = setTimeout(() => {

            const img_list = document.querySelectorAll(selector!);
            for (let i = 0; i < img_list.length; i++) {
                if (!img_list[i].getAttribute('src')) {
                    const d_s = img_list[i].getAttribute('data-src');
                    if (d_s) {
                        img_list[i].setAttribute('src', d_s);
                    }
                }
            }

        }, 300);
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
                id: ibc.pos.group * 1000000 + ibc.pos.atom + '-' + ibc.parentIndex,
                parentId: (ibc.parentIndex === 65535) ? undefined :
                    (chapterList[ibc.parentIndex])
                        ? chapterList[ibc.parentIndex].pos.group * 1000000 + chapterList[ibc.parentIndex].pos.atom + '-' + chapterList[ibc.parentIndex].parentIndex
                        : undefined
            }
        });

        // todo --> this sort not work 100% (group * 1000000 + atom not always correct)
        chapterList_flat.sort((a, b) => {
            const a_num = a.content!.pos.group * 1000000 + a.content!.pos.atom;
            const b_num = b.content!.pos.group * 1000000 + b.content!.pos.atom;
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
            = { clickable: false, content: undefined, children: [], id: undefined, parentId: undefined };

        if (chapterList_flat[0].content!.parentIndex === 65535) {
            _epubBook_chapters.content = chapterList_flat[0].content;
            _epubBook_chapters.id = chapterList_flat[0].id;
            _epubBook_chapters.parentId = chapterList_flat[0].parentId;
        }
        chapterList_flat.forEach(ch => {
            if (ch.content!.parentIndex !== 65535) {
                if (!ch.parentId) return;
                const p_ch = searchTree(_epubBook_chapters!, ch.parentId);
                p_ch && p_ch.children.push({
                    content: ch.content,
                    parentId: ch.parentId,
                    id: ch.id,
                    clickable: (ch.content!.pos.atom === -1 && ch.content!.pos.group === -1) ? false : true,
                    children: []
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


    static getPageIndex_byChapter(chapterPos: IBookPosIndicator, pagePosList: number[]): number | undefined {
        if (!chapterPos || !pagePosList.length) {
            return;
        }
        const chapterId = chapterPos.group * 1000000 + chapterPos.atom;
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

    static calc_chapters_pagesIndex(pagePosList: number[], flat_chapters: IEpubBook_chapters_flat_list)
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
                firstPageIndex: ReaderUtility.getPageIndex_byChapter(ch.content!.pos, pagePosList),
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

}
