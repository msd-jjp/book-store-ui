import { Store2 } from "../../redux/store";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme, IReader_schema_epub_fontName } from "../../redux/action/reader/readerAction";
import { BookGenerator } from "../../webworker/reader-engine/BookGenerator";
import { LANGUAGES } from "../../enum/language";
import { CmpUtility } from "../_base/CmpUtility";
import { IBookContent } from "../../webworker/reader-engine/MsdBook";
// import { Reader2Worker } from "../../webworker/reader2-worker/Reader2Worker";

export interface IEpubBook_chapters {
    chapter: IBookContent | undefined;
    clickable: boolean;
    id: string | undefined;
    parentId: string | undefined;
    children: IEpubBook_chapters[],
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
        epubBook_chapters: IEpubBook_chapters;
        book_id: string
    } | undefined;
    private static checkEpubBook_chapters_exist(book_id: string) {
        if (ReaderUtility._checkEpubBook_chapters_exist) {
            if (
                ReaderUtility._checkEpubBook_chapters_exist.epubBook_chapters &&
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
            return ReaderUtility._checkEpubBook_chapters_exist!.epubBook_chapters;
        }

        let chapterList_flat = chapterList.map(ibc => {
            return {
                ibc: ibc,
                id: ibc.pos.group * 1000000 + ibc.pos.atom + '-' + ibc.parentIndex,
                parentId: (ibc.parentIndex === 65535) ? undefined :
                    (chapterList[ibc.parentIndex])
                        ? chapterList[ibc.parentIndex].pos.group * 1000000 + chapterList[ibc.parentIndex].pos.atom + '-' + chapterList[ibc.parentIndex].parentIndex
                        : undefined
            }
        });

        const searchTree = (ch: IEpubBook_chapters, id: string): IEpubBook_chapters | null => {
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

        const _epubBook_chapters: IEpubBook_chapters | undefined
            = { clickable: false, chapter: undefined, children: [], id: undefined, parentId: undefined };

        if (chapterList_flat[0].ibc.parentIndex === 65535) {
            _epubBook_chapters.chapter = chapterList_flat[0].ibc;
            _epubBook_chapters.id = chapterList_flat[0].id;
            _epubBook_chapters.parentId = chapterList_flat[0].parentId;
        }
        chapterList_flat.forEach(ch => {
            if (ch.ibc.parentIndex !== 65535) {
                if (!ch.parentId) return;
                const p_ch = searchTree(_epubBook_chapters!, ch.parentId);
                p_ch && p_ch.children.push({
                    chapter: ch.ibc,
                    parentId: ch.parentId,
                    id: ch.id,
                    clickable: (ch.ibc.pos.atom === -1 && ch.ibc.pos.group === -1) ? false : true,
                    children: []
                });
            }
        });

        return _epubBook_chapters;
    }

}
