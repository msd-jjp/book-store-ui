importScripts('/reader/reader.js');
import { MsdBookGenerator } from "../reader-engine/MsdBookGenerator";

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
    data: MsdBookGenerator;
}

export default onmessage = async function (e: IReader2_msg) {
    debugger;
    if (!e.data) return;
    if (e.data.type === 'generate' && e.data.config) {
        const _book = {};
        // new MsdBookGenerator(
        //     e.data.config.bookFile,
        //     e.data.config.width,
        //     e.data.config.height,
        //     e.data.config.font,
        //     e.data.config.fontSize,
        //     e.data.config.fontColor,
        //     e.data.config.bgColor
        // );
        postMessage(_book);
    }
}


