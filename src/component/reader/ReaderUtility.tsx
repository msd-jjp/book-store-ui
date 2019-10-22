import { Store2 } from "../../redux/store";
import { book } from "../../webworker/reader-engine/MsdBook";
import { getFont } from "../../webworker/reader-engine/tools";
import { action_update_reader } from "../../redux/action/reader";
// import { CmpUtility } from "../_base/CmpUtility";

export abstract class ReaderUtility {

    static async createEpubBook(bookFile: Uint8Array, bookPageSize?: { width: number; height: number; }): Promise<book> {
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

        const _book = new book(
            bookFile,
            _bookPageSize.width,
            _bookPageSize.height,
            font,
            reader_epub.fontSize,
            reader_epub.fontColor,
            reader_epub.bgColor
        );

        return _book;
        // return new Promise((res, rej) => {
        //     res(_book);
        // });
    }

}
