// var Module = (window as any).Module;
function _arrayBufferToBase64(buffer: Uint8Array): string {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

interface IWorkerCallback {
  id: string, callback: (msg: MessageEvent) => void;
}
export class WasmWorkerHandler {
  worker: any = null;
  handlers: Array<IWorkerCallback> = [];
  constructor(worker: Worker) {
    // debugger;
    this.worker = worker;
    worker.postMessage({ target: 'worker-init' });

    this.worker.onmessage = this.onmessage.bind(this);
    this.handlers = [];
  }
  onmessage(msg: MessageEvent) {
    // debugger;
    let items = this.handlers.filter(x => x.id === msg.data.id);
    this.handlers = this.handlers.filter(x => items.indexOf(x) === -1);
    if (items.length > 0) {
      for (let item of items) {
        item.callback(msg);
      }
    }
  }
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
  async general_call(funcname: string, args: Array<any>) {
    let arr = [];
    for (let i of args) arr.push(i);

    let _id = this.uuidv4();
    this.worker.postMessage(
      { target: 'custom', funcname: funcname, args: arr, id: _id })
    return new Promise(
      (resolve, reject) => {
        this.handlers.push({
          id: _id,
          callback: (msg) => {
            if (msg.data.exception)
              reject(msg.data.error);
            else
              resolve(msg.data.result);
          }
        })

      })
  }

  async aTestFunc(n: any) {
    return this.general_call('_aTestFunc', [n]);
  }
  async deleteBookPosIndicator(p: any) {
    return this.general_call('_deleteBookPosIndicator', [p]);
  }
  async getBookFromBuf(p: any, n: any): Promise<number> {
    return this.general_call('_getBookFromBuf', [p, n]) as Promise<number>;
  }
  async getBookGroupsCount(p: any) {
    return this.general_call('_getBookGroupsCount', [p]);
  }
  async getBookAtomsCount(p: any) {
    return this.general_call('_getBookAtomsCount', [p]);
  }
  async getRendererFormat(
    a1: any, a2: any, a3: any, a4: any, a5: any, a6: any,
    a7: any): Promise<number> {
    return this.general_call(
      '_getRendererFormat', [a1, a2, a3, a4, a5, a6, a7]) as
      Promise<number>;
  }
  async getBookRenderer(a1: any, a2: any, a3: any, a4: any): Promise<number> {
    return this.general_call('_getBookRenderer', [a1, a2, a3, a4]) as
      Promise<number>;
  }
  async getRendererFormatTextColor(a1: any) {
    return this.general_call('_getRendererFormatTextColor', [a1]);
  }
  async getImageofPageResult(a1: any): Promise<number> {
    return this.general_call('_getImageofPageResult', [a1]) as Promise<number>;
  }
  async renderNextPage(a1: any, a2: any): Promise<number> {
    return this.general_call('_renderNextPage', [a1, a2]) as Promise<number>;
  }
  async renderBackPage(a1: any, a2: any): Promise<number> {
    return this.general_call('_renderBackPage', [a1, a2]) as Promise<number>;
  }
  async getIndicatorPart(a1: any, a2: any) {
    return this.general_call('_getIndicatorPart', [a1, a2]);
  }
  async initBookIndicator() {
    return this.general_call('_initBookIndicator', []);
  }
  async BookNextPart(a1: any, a2: any): Promise<number> {
    return this.general_call('_BookNextPart', [a1, a2]) as Promise<number>;
  }
  async getFontBuffer(a1: any) {
    return this.general_call('_getFontBuffer', [a1]);
  }
  async getFontBufferLen(a1: any) {
    return this.general_call('_getFontBufferLen', [a1]);
  }
  async getBookIndicatorPartOfPageResult(a1: any): Promise<number> {
    return this.general_call('_getBookIndicatorPartOfPageResult', [a1]) as Promise<number>;
  }
  async is_last_atom(a1: any, a2: any) {
    return this.general_call('_is_last_atom', [a1, a2]);
  }
  async is_first_atom(a1: any, a2: any) {
    return this.general_call('_is_first_atom', [a1, a2]);
  }
  async getBookType(a1: any) {
    return this.general_call('_getBookType', [a1]);
  }
  async deleteRenderedPage(a1: any) {
    return this.general_call('_deleteRenderedPage', [a1]);
  }
  async deleteBytePoniter(a1: any) {
    return this.general_call('_deleteBytePoniter', [a1]);
  }
  async getBookTotalAtoms(a1: any): Promise<number> {
    return this.general_call('_getBookTotalAtoms', [a1]) as Promise<number>;
  }
  async getBookProgress(a1: any, a2: number): Promise<number> {
    return this.general_call('_getBookProgress', [a1, a2]) as Promise<number>;
  }
  async gotoBookPosIndicator(a1: any, a2: any): Promise<number> {
    return this.general_call('_gotoBookPosIndicator', [a1, a2]) as Promise<number>;
  }
  async getBookPosIndicators(a1: any): Promise<number> {
    return this.general_call('_getBookPosIndicators', [a1]) as Promise<number>;
  }
  async getBookContentAt(a1: any, a2: any): Promise<number> {
    return this.general_call('_getBookContentAt', [a1, a2]) as Promise<number>;
  }
  async getBookContentLength(a1: any): Promise<number> {
    return this.general_call('_getBookContentLength', [a1]) as Promise<number>;
  }
  async renderNextPages(a1: any, a2: any, a3: any): Promise<number> {
    return this.general_call('_renderNextPages', [a1, a2, a3]) as Promise<number>;
  }
  async getBookPlayer(a1: any) {
    return this.general_call('_getBookPlayer', [a1]);
  }
  async getVoiceDuration(a1: any, a2: any, a3: any) {
    return this.general_call('_getVoiceDuration', [a1, a2, a3]);
  }
  async deleteBookPlayer(a1: any) {
    return this.general_call('_deleteBookPlayer', [a1]);
  }
  async getVoiceAtomWrapper(a1: any, a2: any) {
    return this.general_call('_getVoiceAtomWrapper', [a1, a2]);
  }
  async deleteVoiceAtomWrapper(a1: any) {
    return this.general_call('_deleteVoiceAtomWrapper', [a1]);
  }
  async getVoiceSampleRate(a1: any) {
    return this.general_call('_getVoiceSampleRate', [a1]);
  }
  async getVoiceChannelsCount(a1: any) {
    return this.general_call('_getVoiceChannelsCount', [a1]);
  }
  async get10Seconds(a1: any, a2: any) {
    return this.general_call('_get10Seconds', [a1, a2]);
  }
  async getFirstAtom(a1: any) {
    return this.general_call('_getFirstAtom', [a1]);
  }
  async getLastAtom(a1: any) {
    return this.general_call('_getLastAtom', [a1]);
  }
  async getVoiceAtomWrapperDuration(a1: any) {
    return this.general_call('_getVoiceAtomWrapperDuration', [a1]);
  }
  async renderDocPage(a1: any, a2: any, a3: any, a4: any): Promise<number> {
    return this.general_call('_renderDocPage', [a1, a2, a3, a4]) as Promise<number>;
  }
  async getPageCount(a1: any): Promise<number> {
    return this.general_call('_getPageCount', [a1]) as Promise<number>;
  }
  async copyBufferToHeap(buf: Uint8Array): Promise<number> {
    return this.general_call('copyBufferToHeap', [buf]) as Promise<number>;
  }
  async freeHeap(f: any) {
    return this.general_call('freeHeap', [f]);
  }
  async getDWORDSize(m: any): Promise<number> {
    return this.general_call('getDWORDSize', [m]) as Promise<number>;
  }
  async getWORDSize(m: any): Promise<number> {
    return this.general_call('getWORDSize', [m]) as Promise<number>;
  }
  async extractFromHeapBytes(m: any, n: any): Promise<Uint8Array> {
    return this.general_call('extractFromHeapBytes', [m, n]) as Promise<Uint8Array>;
  }
  async subArrayH16(s: any, t: any) {
    return this.general_call('subArrayH16', [s, t]);
  }
}


export interface IBookPosIndicator {
  group: number, atom: number
}
;
export interface IBookContent {
  pos: IBookPosIndicator, text: string, parentIndex: number
}
export class audioBook {
  bookPtr: number = 0;
  firstAtom: number = 0;
  lastAtom: number = 0;
  _bookDuration: number = 0;
  bookPlayerPtr: number = 0;
  loadedVoiceAtomPos: IBookPosIndicator = { group: -1, atom: -1 };
  loadedAtomVoiceWrapper?: number = 0;
  wasmWorker: WasmWorkerHandler;
  constructor(worker: WasmWorkerHandler) {
    this.wasmWorker = worker;
    // let bookheapPtr = copyBufferToHeap(bookbuf);
    // this.bookPtr = msdreader.getBookFromBuf(bookheapPtr, bookbuf.length);
    // freeHeap(bookheapPtr);
    // this.bookPlayerPtr = msdreader.getBookPlayer(this.bookPtr);

    // this.firstAtom = msdreader.getFirstAtom(this.bookPtr);
    // this.lastAtom = msdreader.getLastAtom(this.bookPtr);
  }
  static async getInstance(wasmWorker: WasmWorkerHandler, bookbuf: Uint8Array) {
    let bookheapPtr = await wasmWorker.copyBufferToHeap(bookbuf);
    let bookPtr = await wasmWorker.getBookFromBuf(bookheapPtr, bookbuf.length);
    await wasmWorker.freeHeap(bookheapPtr);
    let bookPlayerPtr = await wasmWorker.getBookPlayer(bookPtr);
    let firstAtom = await wasmWorker.getFirstAtom(bookPtr);
    let lastAtom = await wasmWorker.getLastAtom(bookPtr);
    let rtn = new audioBook(wasmWorker);
    rtn.bookPtr = bookPtr as number;
    rtn.firstAtom = firstAtom as number;
    rtn.lastAtom = lastAtom as number;
    rtn.bookPlayerPtr = bookPlayerPtr as number
    return rtn;
  }
  async getTotalDuration() {
    if (this._bookDuration) return this._bookDuration;
    this._bookDuration =
      await this.wasmWorker.getVoiceDuration(
        this.bookPlayerPtr, this.firstAtom, this.lastAtom) as number;
    return this._bookDuration;
  }
  async bookType() {
    return await this.wasmWorker.getBookType(this.bookPtr);
  }
  async getFirstAtom(): Promise<IBookPosIndicator> {
    return {
      group: await this.wasmWorker.getIndicatorPart(this.firstAtom, 0) as
        number,
      atom: await this.wasmWorker.getIndicatorPart(this.lastAtom, 1) as number
    };
  }
  async getNextAtom(atomPos: IBookPosIndicator): Promise<IBookPosIndicator> {
    let caPos =
      await this.wasmWorker.gotoBookPosIndicator(atomPos.group, atomPos.atom);
    if (await this.wasmWorker.is_last_atom(this.bookPtr, caPos)) {
      await this.wasmWorker.deleteBookPosIndicator(caPos);
      throw new Error('No Next Atom');
    }
    let naPos = await this.wasmWorker.BookNextPart(this.bookPtr, caPos);
    let rtn: IBookPosIndicator = { group: 0, atom: 0 };
    rtn.atom = await this.wasmWorker.getIndicatorPart(naPos, 1) as number;
    rtn.group = await this.wasmWorker.getIndicatorPart(naPos, 0) as number;
    await this.wasmWorker.deleteBookPosIndicator(naPos);
    return rtn;
  }
  async getAtomDuration(atomPos: IBookPosIndicator): Promise<number> {
    let caPos =
      await this.wasmWorker.gotoBookPosIndicator(atomPos.group, atomPos.atom);
    let rtn = await this.wasmWorker.getVoiceDuration(
      this.bookPlayerPtr, caPos, caPos);
    await this.wasmWorker.deleteBookPosIndicator(caPos);
    return rtn as number;
  }
  async getDurationForTwoAtoms(
    sAtomPos: IBookPosIndicator,
    eAtomPos: IBookPosIndicator): Promise<number> {
    let saPos = await this.wasmWorker.gotoBookPosIndicator(
      sAtomPos.group, sAtomPos.atom);
    let eaPos = await this.wasmWorker.gotoBookPosIndicator(
      eAtomPos.group, eAtomPos.atom);
    let rtn = await this.wasmWorker.getVoiceDuration(
      this.bookPlayerPtr, saPos, eaPos);
    await this.wasmWorker.deleteBookPosIndicator(saPos);
    await this.wasmWorker.deleteBookPosIndicator(eaPos);
    return rtn as number;
  }
  async loadVoiceAtom(atomPos: IBookPosIndicator) {
    if (atomPos !== this.loadedVoiceAtomPos) {
      if (this.loadedAtomVoiceWrapper != null) {
        await this.wasmWorker.deleteVoiceAtomWrapper(
          this.loadedAtomVoiceWrapper);
        this.loadedAtomVoiceWrapper = 0;
      }
      let caPos = await this.wasmWorker.gotoBookPosIndicator(
        atomPos.group, atomPos.atom);
      this.loadedAtomVoiceWrapper = await this.wasmWorker.getVoiceAtomWrapper(
        this.bookPlayerPtr, caPos) as number;
      await this.wasmWorker.deleteBookPosIndicator(caPos);
    }
  }
  async getLoadedVoiceAtomSampleRate(): Promise<number> {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return await this.wasmWorker.getVoiceSampleRate(
      this.loadedAtomVoiceWrapper) as number;
  }
  async getLoadedVoiceAtomChannels(): Promise<number> {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return await this.wasmWorker.getVoiceChannelsCount(
      this.loadedAtomVoiceWrapper) as number;
  }
  async getLoadedVoiceAtomDuration(): Promise<number> {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return await this.wasmWorker.getVoiceAtomWrapperDuration(
      this.loadedAtomVoiceWrapper) as number;
  }
  async getLoadedVoiceAtom10Second(startMilliSecond: number):
    Promise<Array<Float32Array>> {
    // debugger;
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    let rtn = await this.wasmWorker.get10Seconds(
      this.loadedAtomVoiceWrapper, startMilliSecond) as number;
    let size = await this.wasmWorker.getDWORDSize(rtn) as number;
    let bys = await this.wasmWorker.subArrayH16(
      (rtn + 4) / 2, (rtn + size) / 2) as Int16Array;
    await this.wasmWorker.deleteBytePoniter(rtn);
    let chansCount = await this.getLoadedVoiceAtomChannels();
    let eachChannelItemCount = bys.length / chansCount;
    let finalChannels = new Array(chansCount);
    for (let i = 0; i < chansCount; i++)
      finalChannels[i] = new Float32Array(eachChannelItemCount);
    for (let i = 0; i < bys.length; i++) {
      let chanIndex = i % chansCount;
      let itemIndex = (i - chanIndex) / chansCount;
      finalChannels[chanIndex][itemIndex] = bys[i] / (2 << 15);
    }
    return finalChannels;
  }
};



export class book {
  fontHeapPtr: number = 0;
  fontSize = 42;
  rendererFormatPtr: number = 0;
  bookPtr: number = 0;
  screenWidth = 300;
  screenHeight = 300;
  lastBookPosIdicator: number = 0;
  currentBookPosIndicator: number = 0;
  bookRendererPtr: number = 0;
  renderedPagePtr: number = 0;
  wasmWorker: WasmWorkerHandler;
  /**
   *
   * @param {base64 string of book} bookbin
   * @param {* Uint8Array of font } font
   * @param {* integer of font size} fontSize
   * @param {* text Fore Color} textFColor
   * @param {* Background color} textBColor
   */
  constructor(
    wasmWorker: WasmWorkerHandler, screenWidth: number, screenHeight: number,
    font: Uint8Array, fontSize: number, textFColor: number,
    textBColor: number) {
    this.wasmWorker = wasmWorker;
    // debugger;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.fontSize = fontSize;
  }
  static async getInstace(
    wasmWorker: WasmWorkerHandler, bookbuf: Uint8Array, screenWidth: number,
    screenHeight: number, font: Uint8Array, fontSize: number,
    textFColor: number, textBColor: number): Promise<book> {
    let fontHeapPtr = await wasmWorker.copyBufferToHeap(font);
    let rendererFormatPtr = await wasmWorker.getRendererFormat(
      textFColor, textBColor, textFColor, textBColor, fontSize, fontHeapPtr,
      font.length);
    // debugger;
    let bookheapPtr = await wasmWorker.copyBufferToHeap(bookbuf);
    let bookPtr = await wasmWorker.getBookFromBuf(bookheapPtr, bookbuf.length);
    await wasmWorker.freeHeap(bookheapPtr);  // free heap from bin buffer;

    let bookRendererPtr = await wasmWorker.getBookRenderer(
      bookPtr, rendererFormatPtr, screenWidth, screenHeight);
    let bookIndicatorPtr = await wasmWorker.initBookIndicator();
    let currentBookPosIndicator =
      await wasmWorker.BookNextPart(bookPtr, bookIndicatorPtr);
    await wasmWorker.deleteBookPosIndicator(bookIndicatorPtr);
    let rtn = new book(
      wasmWorker, screenWidth, screenHeight, font, fontSize, textFColor,
      textBColor);
    rtn.bookPtr = bookPtr;
    rtn.bookRendererPtr = bookRendererPtr;
    rtn.fontHeapPtr = fontHeapPtr;
    rtn.rendererFormatPtr = rendererFormatPtr;
    rtn.currentBookPosIndicator = currentBookPosIndicator;
    return rtn;
  }
  async renderNextPage() {
    debugger;
    if (await this.wasmWorker.is_last_atom(this.bookPtr, this.currentBookPosIndicator))
      throw new Error('EOF');

    let NextPage = await this.wasmWorker.renderNextPage(
      this.bookRendererPtr, this.currentBookPosIndicator);
    if (this.renderedPagePtr) {
      await this.wasmWorker.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
      await this.wasmWorker.getBookIndicatorPartOfPageResult(NextPage);
    let img = await this.wasmWorker.getImageofPageResult(NextPage);
    let imageSize = await this.wasmWorker.getDWORDSize(img);
    let pngData = await this.wasmWorker.extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    await this.wasmWorker.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }


  async renderPrevPage() {
    // debugger;
    if (await this.wasmWorker.is_first_atom(this.bookPtr, this.currentBookPosIndicator))
      throw new Error('BEG');

    let NextPage = await this.wasmWorker.renderBackPage(
      this.bookRendererPtr, this.currentBookPosIndicator);
    if (this.renderedPagePtr) {
      await this.wasmWorker.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
      await this.wasmWorker.getBookIndicatorPartOfPageResult(NextPage);
    let img = await this.wasmWorker.getImageofPageResult(NextPage);
    let imageSize = await this.wasmWorker.getDWORDSize(img);
    let pngData = await this.wasmWorker.extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    await this.wasmWorker.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }
  async renderNPages(fromInd: IBookPosIndicator, n: number): Promise<Array<string>> {
    let indic = await this.wasmWorker.gotoBookPosIndicator(fromInd.group, fromInd.atom);
    if (await this.wasmWorker.is_last_atom(this.bookPtr, indic)) {
      await this.wasmWorker.deleteBookPosIndicator(indic);
      throw new Error('EOF');
    }

    let pagesPtr = await this.wasmWorker.renderNextPages(this.bookRendererPtr, indic, n);
    await this.wasmWorker.deleteBookPosIndicator(indic);
    if (pagesPtr == null) {
      throw new Error('BAD POINTER');
    }
    let len = await this.wasmWorker.getDWORDSize(pagesPtr);
    let pageCount = (len - 4) / 4;
    let images = [];
    for (let i = 0; i < pageCount; i++) {
      let imgPtr = await this.wasmWorker.getDWORDSize(pagesPtr + 4 + i * 4);
      let imageSize = await this.wasmWorker.getDWORDSize(imgPtr);
      let pngData = await this.wasmWorker.extractFromHeapBytes(imageSize - 4, imgPtr + 4);
      let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
      images.push(pic);
      await this.wasmWorker.deleteBytePoniter(imgPtr);
    }
    await this.wasmWorker.deleteBytePoniter(pagesPtr);
    return images;
  }
  async bookType() {
    return await this.wasmWorker.getBookType(this.bookPtr);
  }
  async areWeAtEnd() {
    return await this.wasmWorker.is_last_atom(this.bookPtr, this.currentBookPosIndicator);
  }
  async areWeAtStart() {
    return await this.wasmWorker.is_first_atom(this.bookPtr, this.currentBookPosIndicator);
  }

  async getProgress() {
    let atomC = await this.wasmWorker.getBookTotalAtoms(this.bookPtr);
    let p =
      await this.wasmWorker.getBookProgress(this.bookPtr, this.currentBookPosIndicator);
    return p / atomC;
  }
  async getCurrentBookIndicator() {
    let g = await this.wasmWorker.getIndicatorPart(this.currentBookPosIndicator, 0);
    let a = await this.wasmWorker.getIndicatorPart(this.currentBookPosIndicator, 1);
    return { group: g, atom: a };
  }
  async gotoPos(indicator: IBookPosIndicator) {
    // has memory leakage
    // be careful of using it
    if (this.renderedPagePtr) {
      // to free current BookPos
      await this.wasmWorker.deleteRenderedPage(this.renderedPagePtr);
    }
    this.currentBookPosIndicator = await this.wasmWorker.gotoBookPosIndicator(
      indicator.group || 0, indicator.atom || 0)
  }
  async getListOfPageIndicators(): Promise<Array<IBookPosIndicator>> {
    // debugger;
    let res = await this.wasmWorker.getBookPosIndicators(this.bookRendererPtr);
    let len = await this.wasmWorker.getDWORDSize(res);
    let c = Math.floor((len - 4) / 8);
    let pages = [];
    for (let i = 0; i < c; i++) {
      let g = await this.wasmWorker.getDWORDSize(res + 4 + i * 8);
      let a = await this.wasmWorker.getDWORDSize(res + 4 + i * 8 + 4);
      pages.push({ group: g, atom: a })
    }
    await this.wasmWorker.deleteBytePoniter(res);
    return pages;
  }
  async RenderSpecPage(pos: IBookPosIndicator): Promise<string> {
    let indic = await this.wasmWorker.gotoBookPosIndicator(pos.group, pos.atom);
    if (await this.wasmWorker.is_last_atom(this.bookPtr, indic)) throw new Error('EOF');

    let NextPage = await this.wasmWorker.renderNextPage(this.bookRendererPtr, indic);
    await this.wasmWorker.deleteBookPosIndicator(indic);
    if (this.renderedPagePtr) {
      await this.wasmWorker.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
      await this.wasmWorker.getBookIndicatorPartOfPageResult(NextPage);
    let img = await this.wasmWorker.getImageofPageResult(NextPage);
    let imageSize = await this.wasmWorker.getDWORDSize(img);
    let pngData = await this.wasmWorker.extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    await this.wasmWorker.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }

  async contentAt(itemIndex: number): Promise<IBookContent> {
    let r = await this.wasmWorker.getBookContentAt(this.bookPtr, itemIndex);
    if (r === 0) throw new Error('bad Index');
    let size = await this.wasmWorker.getDWORDSize(r);
    let gindex = await this.wasmWorker.getDWORDSize(r + 4);
    let aindex = await this.wasmWorker.getDWORDSize(r + 4 + 4);
    let parentindex = await this.wasmWorker.getWORDSize(r + 4 + 4 + 4);
    let sbuf = await this.wasmWorker.extractFromHeapBytes(size - 4 - 4 - 4 - 2, r + 4 + 4 + 4 + 2);
    let s = new TextDecoder('utf-8').decode(sbuf);
    return {
      pos: { group: gindex, atom: aindex }, text: s, parentIndex: parentindex
    }
  }
  async contentLength(): Promise<number> {
    return await this.wasmWorker.getBookContentLength(this.bookPtr);
  }
  async getContentList(): Promise<Array<IBookContent>> {
    let rtn: Array<IBookContent> = [];
    let cLen = await this.contentLength();
    for (let i = 0; i < cLen; i++) rtn.push(await this.contentAt(i));
    return rtn;
  }
  async renderDocPage(page: number, zoom: number): Promise<string> {
    // debugger;
    let indic = await this.wasmWorker.gotoBookPosIndicator(-1, page);
    // should manually check that page is in renderable pages;

    // if (await this.wasmWorker.is_last_atom(this.bookPtr, indic)) throw new Error('EOF');
    let img = await this.wasmWorker.renderDocPage(this.bookRendererPtr, indic, zoom, 0);

    await this.wasmWorker.deleteBookPosIndicator(indic);
    // await this.wasmWorker.deleteRenderedPage(indic);
    let imageSize = await this.wasmWorker.getDWORDSize(img);
    let pngData = await this.wasmWorker.extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    await this.wasmWorker.deleteBytePoniter(img);
    return pic;
  }
  async getPageCount(): Promise<number> {
    return await this.wasmWorker.getPageCount(this.bookRendererPtr);
  }
}
