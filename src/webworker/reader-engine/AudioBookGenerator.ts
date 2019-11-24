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
            // this._allAtoms_pos = [pos];
            this._allAtoms_pos = [];

            while (pos.atom !== lastPos.atom || pos.group !== lastPos.group) {
                this._allAtoms_pos!.push(pos);
                pos = await this.getNextAtom(pos);
            }

            this._allAtoms_pos.push(lastPos);
        }
        return this._allAtoms_pos;
    }

    /* getFirstAtom(): IBookPosIndicator {
        return {
            group: msdreader.getIndicatorPart(this.firstAtom, 0),
            atom: msdreader.getIndicatorPart(this.firstAtom, 1)
        };
    } */
    async getFirstAtom(): Promise<IBookPosIndicator> {
        return {
            group: await this.wasmWorker.getIndicatorPart(this.firstAtom, 0) as number,
            atom: await this.wasmWorker.getIndicatorPart(this.firstAtom, 1) as number
        };
    }
    /* getLastAtom(): IBookPosIndicator {
        return {
            group: msdreader.getIndicatorPart(this.lastAtom, 0),
            atom: msdreader.getIndicatorPart(this.lastAtom, 1)
        };
    } */
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
        /* allAtoms_pos.forEach((atom, atom_i) => {
            const atom_d = this.getAtomDuration(atom);
            this._fileAtoms_duration![atom_i] = { from: last_to, to: last_to + atom_d };
            last_to += atom_d;
        }); */
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

}