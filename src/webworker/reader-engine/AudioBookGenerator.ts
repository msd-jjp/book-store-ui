import {
    audioBook, IBookPosIndicator,/* , msdreader */
    WasmWorkerHandler
} from "./MsdBook";

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

}