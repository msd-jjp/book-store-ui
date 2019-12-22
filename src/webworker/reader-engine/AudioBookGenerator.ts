import {
    audioBook, IBookPosIndicator,/* , msdreader */
    WasmWorkerHandler,
    IBookContent
} from "./MsdBook";
import { IEpubBook_chapters } from "../../component/reader/ReaderUtility";

export interface IChapterDetail { from: number | undefined, to: number | undefined, id: string | undefined }

export class AudioBookGenerator extends audioBook {
    private _allAtoms_pos: IBookPosIndicator[] | undefined;
    async getAllAtoms_pos(): Promise<Array<IBookPosIndicator>> {
        if (!this._allAtoms_pos) {
            let pos = await this.getFirstAtom();
            let lastPos = await this.getLastAtom();
            this._allAtoms_pos = [];

            while (pos.atom !== lastPos.atom || pos.group !== lastPos.group) {
                this._allAtoms_pos!.push(pos);
                pos = await this.getNextAtom(pos);
            }

            this._allAtoms_pos.push(lastPos);
        }
        return this._allAtoms_pos;
    }

    async getFirstAtom(): Promise<IBookPosIndicator> {
        return {
            group: await this.wasmWorker.getIndicatorPart(this.firstAtom, 0) as number,
            atom: await this.wasmWorker.getIndicatorPart(this.firstAtom, 1) as number
        };
    }

    async getLastAtom(): Promise<IBookPosIndicator> {
        return {
            group: await this.wasmWorker.getIndicatorPart(this.lastAtom, 0) as number,
            atom: await this.wasmWorker.getIndicatorPart(this.lastAtom, 1) as number
        };
    }

    private _fileAtoms_duration: { from: number, to: number }[] | undefined;
    async getFileAtoms_duration(): Promise<{ from: number, to: number }[]> {
        if (this._fileAtoms_duration) return this._fileAtoms_duration;

        const allAtoms_pos = await this.getAllAtoms_pos();
        this._fileAtoms_duration = [];

        let last_to = 0;

        for (let i = 0; i < allAtoms_pos.length; i++) {
            const atom = allAtoms_pos[i];
            const atom_d = await this.getAtomDuration(atom);
            this._fileAtoms_duration![i] = { from: last_to, to: last_to + atom_d };
            last_to += atom_d;
        }

        return this._fileAtoms_duration;
    }

    static async getInstance(wasmWorker: WasmWorkerHandler, bookbuf: Uint8Array): Promise<AudioBookGenerator> {
        let bookheapPtr = await wasmWorker.copyBufferToHeap(bookbuf);
        let bookPtr = await wasmWorker.getBookFromBuf(bookheapPtr, bookbuf.length);
        await wasmWorker.freeHeap(bookheapPtr);
        let bookPlayerPtr = await wasmWorker.getBookPlayer(bookPtr);
        let firstAtom = await wasmWorker.getFirstAtom(bookPtr);
        let lastAtom = await wasmWorker.getLastAtom(bookPtr);
        let rtn = new AudioBookGenerator(wasmWorker);
        rtn.bookPtr = bookPtr as number;
        rtn.firstAtom = firstAtom as number;
        rtn.lastAtom = lastAtom as number;
        rtn.bookPlayerPtr = bookPlayerPtr as number
        return rtn;
    }

    /**
     * @param time number in milisecond
     * @returns atomDetail
     */
    async getAtomDetailByTime(time: number)
        : Promise<{ atom: IBookPosIndicator, index: number, fromTo: { from: number, to: number } } | undefined> {

        const fileAtoms_duration = await this.getFileAtoms_duration();
        if (!fileAtoms_duration || !fileAtoms_duration.length) return;
        let atom_index = undefined;
        let atomFromTo = undefined;
        for (let i = 0; i < fileAtoms_duration.length; i++) {
            atomFromTo = fileAtoms_duration[i];
            if (atomFromTo.from <= time && atomFromTo.to >= time) {
                atom_index = i;
                break;
            }
        }
        let atom: IBookPosIndicator | undefined;
        if (atom_index || atom_index === 0) {
            const atomList = await this.getAllAtoms_pos();
            if (!atomList || !atomList.length) return;
            atom = atomList[atom_index];
            if (!atom) return;
            return { atom, index: atom_index, fromTo: atomFromTo! };
        }
    }
    /**
     * @param index number: atom index
     * @returns atomDetail
     */
    async getAtomDetailByIndex(index: number)
        : Promise<{ atom: IBookPosIndicator, index: number, fromTo: { from: number, to: number } } | undefined> {

        const fileAtoms_duration = await this.getFileAtoms_duration();
        if (!fileAtoms_duration || !fileAtoms_duration.length) return;
        let atomFromTo = fileAtoms_duration[index];
        let atom: IBookPosIndicator | undefined;
        const atomList = await this.getAllAtoms_pos();
        if (!atomList || !atomList.length) return;
        atom = atomList[index];
        if (!atom) return;
        return { atom, index, fromTo: atomFromTo! };
    }

    /**
     * @param index number: atom index
     * @returns atomDetail
     */
    /* async getAtomDetailByAtom(atom: IBookPosIndicator)
        : Promise<{ atom: IBookPosIndicator, index: number, fromTo: { from: number, to: number } } | undefined> {

        const fileAtoms_duration = await this.getFileAtoms_duration();
        if (!fileAtoms_duration || !fileAtoms_duration.length) return;
        const atomList = await this.getAllAtoms_pos();
        if (!atomList || !atomList.length) return;
        debugger;
        // todo if atom not match 
        const index = atomList.findIndex(at => at.atom === atom.atom && at.group === atom.group);
        if (index === -1) {
            return;
        }
        const fromTo = fileAtoms_duration[index];
        return { atom, index, fromTo };
    } */

    private _allChapters: IBookContent[] | undefined;
    async getAllChapters(): Promise<Array<IBookContent>> {
        if (!this._allChapters) this._allChapters = await this.getContentList();
        return this._allChapters;
    }

    private _chapters_duration: IChapterDetail[] | undefined;
    async getChaptersDuration(flat_chapters: IEpubBook_chapters['flat'])
        : Promise<IChapterDetail[]> {
        // debugger;
        if (!this._chapters_duration) {
            const atomList = await this.getAllAtoms_pos();
            const fileAtoms_duration = await this.getFileAtoms_duration();
            // if (!atomList || !atomList.length) return;
            const list: IChapterDetail[] = [];

            for (let i = 0; i < flat_chapters.length; i++) {
                const chp = flat_chapters[i];
                const chpNext = flat_chapters[i + 1];
                let obj: IChapterDetail = { from: undefined, to: undefined, id: chp.id };
                const startAtomIndex = atomList.findIndex(
                    at => at.atom === chp.content!.pos.atom && at.group === chp.content!.pos.group);

                if (startAtomIndex !== -1) {
                    const startAtomDuration = fileAtoms_duration[startAtomIndex];
                    obj['from'] = startAtomDuration.from;
                    if (chpNext) {
                        const next_startAtomIndex = atomList.findIndex(
                            at => at.atom === chpNext.content!.pos.atom && at.group === chpNext.content!.pos.group);
                        const endAtomDuration = fileAtoms_duration[next_startAtomIndex - 1];
                        obj['to'] = endAtomDuration.to;
                    } else {
                        const endAtomDuration = fileAtoms_duration[fileAtoms_duration.length - 1];
                        obj['to'] = endAtomDuration.to;
                    }
                }

                list.push(obj);
            }
            this._chapters_duration = list;
        }
        return this._chapters_duration;
    }

    /** 
     * @param index chapter index
     */
    async getChapterDetailByIndex(index: number, flat_chapters: IEpubBook_chapters['flat'])
        : Promise<{ index: number, detail: IChapterDetail } | undefined> {
        // debugger;
        const chps = await this.getChaptersDuration(flat_chapters);
        if (!chps) return;
        const detail = chps[index];
        if (!detail) return;
        return { index, detail };
    }

    /** 
     * @param index chapter atom
     */
    async getChapterDetailByAtom(atom: IBookPosIndicator, flat_chapters: IEpubBook_chapters['flat'])
        : Promise<{ index: number, detail: IChapterDetail } | undefined> {
        // debugger;
        let chapterIndex: number | undefined = undefined;
        for (let i = 0; i < flat_chapters.length; i++) {
            const chp = flat_chapters[i];
            if (atom.atom === chp.content!.pos.atom && atom.group === chp.content!.pos.group) {
                chapterIndex = i;
                break;
            }
        }
        if (chapterIndex === undefined) return;
        return this.getChapterDetailByIndex(chapterIndex, flat_chapters);
    }

    /** 
     * @param time in milisecond
     */
    async getChapterDetailByTime(time: number, flat_chapters: IEpubBook_chapters['flat'])
        : Promise<{ index: number, detail: IChapterDetail } | undefined> {
        const chps = await this.getChaptersDuration(flat_chapters);
        if (!chps) return;
        let chapterIndex: number | undefined = undefined;
        for (let i = 0; i < chps.length; i++) {
            const ch = chps[i];
            if (ch.from !== undefined && ch.from <= time && ch.to !== undefined && ch.to >= time) {
                chapterIndex = i;
                break;
            }
        }
        if (chapterIndex === undefined) return;
        return this.getChapterDetailByIndex(chapterIndex, flat_chapters);
    }

}