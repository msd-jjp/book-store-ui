import { BookGenerator } from "../reader-engine/BookGenerator";

export interface IReader2_msg extends MessageEvent {
    data: {
        type: 'generate';
        config: {
            bookFile: Uint8Array,
            width: number;
            height: number;
            font: Uint8Array;
            fontSize: number;
            fontColor: number;
            bgColor: number;
        }
    };
}
export interface IReader2_post extends MessageEvent {
    data: BookGenerator;
}

export default onmessage = async function (e: IReader2_msg) {
    if (!e.data) return;
    if (e.data.type === 'generate' && e.data.config) {
        const _book = new BookGenerator(
            e.data.config.bookFile,
            e.data.config.width,
            e.data.config.height,
            e.data.config.font,
            e.data.config.fontSize,
            e.data.config.fontColor,
            e.data.config.bgColor
        );
        postMessage(_book);
    }
}


