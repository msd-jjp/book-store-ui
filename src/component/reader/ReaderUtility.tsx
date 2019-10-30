import { Store2 } from "../../redux/store";
// import { book } from "../../webworker/reader-engine/MsdBook";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme, IReader_schema_epub_fontName } from "../../redux/action/reader/readerAction";
// import { action_set_library_data } from "../../redux/action/library";
// import { LibraryService } from "../../service/service.library";
// import { getLibraryItem } from "../library/libraryViewTemplate";
// import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { BookGenerator } from "../../webworker/reader-engine/BookGenerator";
import { LANGUAGES } from "../../enum/language";
import { CmpUtility } from "../_base/CmpUtility";
import { IBookContent } from "../../webworker/reader-engine/MsdBook";
// import { ILibrary } from "../../model/model.library";
// import { CmpUtility } from "../_base/CmpUtility";

export abstract class ReaderUtility {

    // static getEpubBook_theme(): IReader_schema_epub_theme {
    //     console.log('..........................................getEpubBook_theme..........................................');
    //     return Store2.getState().reader.epub.theme;
    // }

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

        // const readerEngine_loaded = 
        await ReaderUtility.wait_loadReaderEngine();
        // if (!readerEngine_loaded) return;

        let valid_fontSize = reader_epub.fontSize;
        if (valid_fontSize > 50) { valid_fontSize = 50; }
        else if (valid_fontSize < 5) { valid_fontSize = 5; }

        const _book = new BookGenerator(
            bookFile,
            _bookPageSize.width,
            _bookPageSize.height,
            font,
            reader_epub.fontSize,
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
                console.log('window.Module.asm', (window as any).Module._malloc);
                res(true);
                return;
            };

            for (let i = 0; i < 50; i++) {
                await CmpUtility.waitOnMe((i + 1) * 200);
                if ((window as any).Module && (window as any).Module.asm && (window as any).Module.asm._malloc) {
                    // if ((window as any).Module && (window as any).Module._malloc) {
                    console.log('window.Module.asm', (window as any).Module._malloc);
                    res(true);
                    break;
                };
            }
            rej();
        });
    }

    // static async updateLibraryItem_progress_client(book_id: string, progress: number) {
    //     const libData = [...Store2.getState().library.data];
    //     const _lib = libData.find(lib => lib.book.id === book_id);
    //     if (!_lib) return;

    //     // _lib.status.reading_started = true;
    //     _lib.progress = progress;

    //     Store2.dispatch(action_set_library_data(libData));
    // }

    // static async updateLibraryItem_progress_server(book_id: string, progress: number) {
    //     if (Store2.getState().network_status === NETWORK_STATUS.OFFLINE) return;

    //     const libItem = getLibraryItem(book_id);
    //     if (!libItem) return;

    //     const _libraryService = new LibraryService();
    //     // libItem.status.reading_started = true;
    //     // libItem.progress = progress;
    //     // let status_obj = {
    //     //     reading_started: libItem.status.reading_started,
    //     //     // progess: libItem.progess
    //     // };
    //     // _libraryService.update_status(libItem.id, status_obj, libItem.progress).catch(e => { });
    //     _libraryService.update_progress(libItem.id, progress).catch(e => { });
    // }

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

    private static _epubBook_chapters: {
        chapter: IBookContent | undefined, clickable: boolean,
        children: { chapter: IBookContent | undefined, children: [], clickable: boolean }[],
    } | undefined;
    static createEpubBook_chapters(chapterList: IBookContent[]) {
        debugger;
        const list = [...chapterList];
        this._epubBook_chapters = { clickable: false, chapter: undefined, children: [] };
        const length = list.length;

        for (let i = 0; i < length; i++) {
            const ch = list.shift();
            if (ch!.parentIndex === 65535) {
                this._epubBook_chapters.chapter = ch;

            } else {
                let _ch_obj = this._epubBook_chapters;
                for (let i = 0; i < ch!.parentIndex; i++) {
                    if (_ch_obj.children[_ch_obj.children.length - 1]) {
                        _ch_obj = _ch_obj.children[_ch_obj.children.length - 1];
                    }
                }
                const ca = (ch!.pos.atom === -1 && ch!.pos.group === -1) ? false : true;
                _ch_obj.children.push({
                    chapter: ch,
                    clickable: ca,
                    children: []
                });
            }
        }

        return this._epubBook_chapters;
    }

}
