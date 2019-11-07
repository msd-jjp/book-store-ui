import { audioBook, IBookPosIndicator, msdreader } from "./MsdBook";

export class AudioBookGenerator extends audioBook {
    private _allAtoms_pos: IBookPosIndicator[] | undefined;
    getAllAtoms_pos(): Array<IBookPosIndicator> {
        if (!this._allAtoms_pos) {
            let pos = this.getFirstAtom();
            let lastPos = this.getLastAtom();
            // this._allAtoms_pos = [pos];
            this._allAtoms_pos = [];

            while (pos.atom !== lastPos.atom || pos.group !== lastPos.group) {
                this._allAtoms_pos!.push(pos);
                pos = this.getNextAtom(pos);
            }

            this._allAtoms_pos.push(lastPos);
        }
        return this._allAtoms_pos;
    }

    getFirstAtom(): IBookPosIndicator {
        return {
            group: msdreader.getIndicatorPart(this.firstAtom, 0),
            atom: msdreader.getIndicatorPart(this.firstAtom, 1)
        };
    }
    getLastAtom(): IBookPosIndicator {
        return {
            group: msdreader.getIndicatorPart(this.lastAtom, 0),
            atom: msdreader.getIndicatorPart(this.lastAtom, 1)
        };
    }

    private _fileAtoms_duration: { from: number, to: number }[] | undefined;
    getFileAtoms_duration(): { from: number, to: number }[] {
        if (this._fileAtoms_duration) return this._fileAtoms_duration;

        const allAtoms_pos = this.getAllAtoms_pos();
        this._fileAtoms_duration = [];

        let last_to = 0;
        allAtoms_pos.forEach((atom, atom_i) => {
            const atom_d = this.getAtomDuration(atom);
            this._fileAtoms_duration![atom_i] = { from: last_to, to: last_to + atom_d };
            last_to += atom_d;
        });

        return this._fileAtoms_duration;
    }

}