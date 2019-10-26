import { Store2 } from "../../redux/store";
// import { book } from "../../webworker/reader-engine/MsdBook";
import { getFont, color } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
import { IReader_schema_epub_theme } from "../../redux/action/reader/readerAction";
import { action_set_library_data } from "../../redux/action/library";
import { LibraryService } from "../../service/service.library";
import { getLibraryItem } from "../library/libraryViewTemplate";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { BookGenerator } from "../../webworker/reader-engine/BookGenerator";
import { LANGUAGES } from "../../enum/language";
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

    static async createEpubBook(bookFile: Uint8Array, bookPageSize?: { width: number; height: number; }): Promise<BookGenerator> {
        // debugger;
        // await CmpUtility.waitOnMe(5000);

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

        // await CmpUtility.waitOnMe(3000);
        const reader_epub_theme = ReaderUtility.getEpubBook_theme(reader_epub.theme);

        const _book = new BookGenerator(
            bookFile,
            _bookPageSize.width,
            _bookPageSize.height,
            font,
            reader_epub.fontSize,
            reader_epub_theme.fontColor, // reader_epub.fontColor,
            reader_epub_theme.bgColor // reader_epub.bgColor
        );

        return _book;
        // return new Promise((res, rej) => {
        //     res(_book);
        // });
    }

    static async updateLibraryItem_progress(book_id: string, progress: number) {
        const libData = [...Store2.getState().library.data];
        const _lib = libData.find(lib => lib.book.id === book_id);
        if (!_lib) return;

        _lib.status.reading_started = true;
        _lib.progress = progress;

        Store2.dispatch(action_set_library_data(libData));
    }

    static async updateLibraryItem_progress_server(book_id: string, progress: number) {
        if (Store2.getState().network_status === NETWORK_STATUS.OFFLINE) return;

        const libItem = getLibraryItem(book_id);
        if (!libItem) return;

        const _libraryService = new LibraryService();
        libItem.status.reading_started = true;
        libItem.progress = progress;
        let status_obj = {
            reading_started: libItem.status.reading_started,
            // progess: libItem.progess
        };
        _libraryService.update_status(libItem.id, status_obj, libItem.progress).catch(e => { });
    }

    private static rtlLanguage_list: LANGUAGES[] = [LANGUAGES.PERSIAN, LANGUAGES.ARABIC];
    static isBookRtl(lang: LANGUAGES | undefined): boolean {
        if (!lang) return true;
        else return ReaderUtility.rtlLanguage_list.includes(lang);
    }


}
