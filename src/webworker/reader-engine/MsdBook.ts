var Module = (window as any).Module;
export var msdreader = {
  deleteBookPosIndicator:
      Module.cwrap('deleteBookPosIndicator', 'number', ['number']),
  getBookFromBuf:
      Module.cwrap('getBookFromBuf', 'number', ['number', 'number']),
  getBookGroupsCount: Module.cwrap('getBookGroupsCount', 'number', ['number']),
  getBookAtomsCount: Module.cwrap('getBookAtomsCount', 'number', ['number']),
  getRendererFormat: Module.cwrap(
      'getRendererFormat', 'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
  getBookRenderer: Module.cwrap(
      'getBookRenderer', 'number', ['number', 'number', 'number', 'number']),
  getRendererFormatTextColor:
      Module.cwrap('getRendererFormatTextColor', 'number', ['number']),
  getImageofPageResult:
      Module.cwrap('getImageofPageResult', 'number', ['number']),
  renderNextPage:
      Module.cwrap('renderNextPage', 'number', ['number', 'number']),
  renderBackPage:
      Module.cwrap('renderBackPage', 'number', ['number', 'number']),

  getIndicatorPart:
      Module.cwrap('getIndicatorPart', 'number', ['number', 'number']),
  initBookIndicator: Module.cwrap('initBookIndicator', 'number', []),
  BookNextPart: Module.cwrap('BookNextPart', 'number', ['number', 'number']),
  getFontBuffer: Module.cwrap('getFontBuffer', 'number', ['number']),
  getFontBufferLen: Module.cwrap('getFontBufferLen', 'number', ['number']),
  getBookIndicatorPartOfPageResult:
      Module.cwrap('getBookIndicatorPartOfPageResult', 'number', ['number']),
  is_last_atom: Module.cwrap('is_last_atom', 'number', ['number', 'number']),
  is_first_atom: Module.cwrap('is_first_atom', 'number', ['number', 'number']),
  getBookType: Module.cwrap('getBookType', 'number', ['number']),
  deleteRenderedPage: Module.cwrap('deleteRenderedPage', 'number', ['number']),
  deleteBytePoniter: Module.cwrap('deleteBytePoniter', 'number', ['number']),
  getBookTotalAtoms: Module.cwrap('getBookTotalAtoms', 'number', ['number']),
  getBookProgress: Module.cwrap('getBookProgress', 'number', ['number']),
  gotoBookPosIndicator:
      Module.cwrap('gotoBookPosIndicator', 'number', ['number', 'number']),
  getBookPosIndicators:
      Module.cwrap('getBookPosIndicators', 'number', ['number']),
  getBookContentAt:
      Module.cwrap('getBookContentAt', 'number', ['number', 'number']),
  getBookContentLength:
      Module.cwrap('getBookContentLength', 'number', ['number']),
  renderNextPages:
      Module.cwrap('renderNextPages', 'number', ['number', 'number', 'number']),
  getBookPlayer: Module.cwrap('getBookPlayer', 'number', ['number']),
  getVoiceDuration: Module.cwrap(
      'getVoiceDuration', 'number', ['number', 'number', 'number']),
  deleteBookPlayer: Module.cwrap('deleteBookPlayer', 'number', ['number']),
  getVoiceAtomWrapper:
      Module.cwrap('getVoiceAtomWrapper', 'number', ['number', 'number']),
  deleteVoiceAtomWrapper:
      Module.cwrap('deleteVoiceAtomWrapper', 'number', ['number']),
  getVoiceSampleRate: Module.cwrap('getVoiceSampleRate', 'number', ['number']),
  getVoiceChannelsCount:
      Module.cwrap('getVoiceChannelsCount', 'number', ['number']),
  get10Seconds: Module.cwrap('get10Seconds', 'number', ['number', 'number']),
  getFirstAtom: Module.cwrap('getFirstAtom', 'number', ['number']),
  getLastAtom: Module.cwrap('getLastAtom', 'number', ['number']),
  getVoiceAtomWrapperDuration:
      Module.cwrap('getVoiceAtomWrapperDuration', 'number', ['number']),
  renderDocPage: Module.cwrap(
      'renderDocPage', 'number', ['number', 'number', 'number', 'number']),
  getPageCount: Module.cwrap('getPageCount', 'number', 'number'),

};

function copyBufferToHeap(u8buffer: Uint8Array): number {
  let ptr = Module._malloc(u8buffer.length);
  Module.HEAPU8.set(u8buffer, ptr);
  return ptr;
};

function freeHeap(ptr: number) {
  Module._free(ptr);
};

function getDWORDSize(ptr: number): number {
  let size = 0;
  for (let i = 3; i > -1; i--) {
    size = (size << 8) + Module.HEAPU8[ptr + i];
  }
  return size;
};

function getWORDSize(ptr: number): number {
  let size = 0;
  for (let i = 1; i > -1; i--) {
    size = (size << 8) + Module.HEAPU8[ptr + i];
  }
  return size;
};
function extractFromHeapBytes(size: number, ptr: number): Uint8Array {
  return Module.HEAPU8.slice(ptr, ptr + size);
};
function

_arrayBufferToBase64(buffer: Uint8Array): string {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
export interface IBookPosIndicator {
  group: number, atom: number
}
;
export interface IBookContent {
  pos: IBookPosIndicator, text: string, parentIndex: number
}
export class audioBook {
  bookPtr = null;
  firstAtom = null;
  lastAtom = null;
  _bookDuration: number = 0;
  bookPlayerPtr = null;
  loadedVoiceAtomPos: IBookPosIndicator = {group: -1, atom: -1};
  loadedAtomVoiceWrapper = null;
  constructor(bookbuf: Uint8Array) {
    let bookheapPtr = copyBufferToHeap(bookbuf);
    this.bookPtr = msdreader.getBookFromBuf(bookheapPtr, bookbuf.length);
    freeHeap(bookheapPtr);
    this.bookPlayerPtr = msdreader.getBookPlayer(this.bookPtr);

    this.firstAtom = msdreader.getFirstAtom(this.bookPtr);
    this.lastAtom = msdreader.getLastAtom(this.bookPtr);
  }
  getTotalDuration() {
    if (this._bookDuration) return this._bookDuration;
    this._bookDuration = msdreader.getVoiceDuration(
        this.bookPlayerPtr, this.firstAtom, this.lastAtom);
    return this._bookDuration;
  }
  bookType() {
    return msdreader.getBookType(this.bookPtr);
  }
  getFirstAtom(): IBookPosIndicator {
    return {
      group: msdreader.getIndicatorPart(this.firstAtom, 0),
      atom: msdreader.getIndicatorPart(this.lastAtom, 1)
    };
  }
  getNextAtom(atomPos: IBookPosIndicator): IBookPosIndicator {
    let caPos = msdreader.gotoBookPosIndicator(atomPos.group, atomPos.atom);
    if (msdreader.is_last_atom(this.bookPtr, caPos)) {
      msdreader.deleteBookPosIndicator(caPos);
      throw new Error('No Next Atom');
    }
    let naPos = msdreader.BookNextPart(this.bookPtr, caPos);
    let rtn: IBookPosIndicator = {group: 0, atom: 0};
    rtn.atom = msdreader.getIndicatorPart(naPos, 1);
    rtn.group = msdreader.getIndicatorPart(naPos, 0);
    msdreader.deleteBookPosIndicator(naPos);
    return rtn;
  }
  getAtomDuration(atomPos: IBookPosIndicator): number {
    let caPos = msdreader.gotoBookPosIndicator(atomPos.group, atomPos.atom);
    let rtn = msdreader.getVoiceDuration(this.bookPlayerPtr, caPos, caPos);
    msdreader.deleteBookPosIndicator(caPos);
    return rtn;
  }
  getDurationForTwoAtoms(
      sAtomPos: IBookPosIndicator, eAtomPos: IBookPosIndicator): number {
    let saPos = msdreader.gotoBookPosIndicator(sAtomPos.group, sAtomPos.atom);
    let eaPos = msdreader.gotoBookPosIndicator(eAtomPos.group, eAtomPos.atom);
    let rtn = msdreader.getVoiceDuration(this.bookPlayerPtr, saPos, eaPos);
    msdreader.deleteBookPosIndicator(saPos);
    msdreader.deleteBookPosIndicator(eaPos);
    return rtn;
  }
  loadVoiceAtom(atomPos: IBookPosIndicator) {
    if (atomPos !== this.loadedVoiceAtomPos) {
      if (this.loadedAtomVoiceWrapper != null) {
        msdreader.deleteVoiceAtomWrapper(this.loadedAtomVoiceWrapper);
        this.loadedAtomVoiceWrapper = null;
      }
      let caPos = msdreader.gotoBookPosIndicator(atomPos.group, atomPos.atom);
      this.loadedAtomVoiceWrapper =
          msdreader.getVoiceAtomWrapper(this.bookPlayerPtr, caPos);
      msdreader.deleteBookPosIndicator(caPos);
    }
  }
  getLoadedVoiceAtomSampleRate(): number {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return msdreader.getVoiceSampleRate(this.loadedAtomVoiceWrapper);
  }
  getLoadedVoiceAtomChannels(): number {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return msdreader.getVoiceChannelsCount(this.loadedAtomVoiceWrapper);
  }
  getLoadedVoiceAtomDuration(): number {
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    return msdreader.getVoiceAtomWrapperDuration(this.loadedAtomVoiceWrapper);
  }
  getLoadedVoiceAtom10Second(startMilliSecond: number): Array<Float32Array> {
    // debugger;
    if (this.loadedAtomVoiceWrapper == null)
      throw new Error('no loaded atom found.');
    let rtn =
        msdreader.get10Seconds(this.loadedAtomVoiceWrapper, startMilliSecond);
    let size = getDWORDSize(rtn);
    let bys = Module.HEAP16.subarray((rtn + 4) / 2, (rtn + size) / 2);
    msdreader.deleteBytePoniter(rtn);
    let chansCount = this.getLoadedVoiceAtomChannels();
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
  fontHeapPtr: number;
  fontSize = 42;
  rendererFormatPtr = null;
  bookPtr = null;
  screenWidth = 300;
  screenHeight = 300;
  lastBookPosIdicator = null;
  currentBookPosIndicator = null;
  bookRendererPtr = null;
  renderedPagePtr = null;
  /**
   *
   * @param {base64 string of book} bookbin
   * @param {* Uint8Array of font } font
   * @param {* integer of font size} fontSize
   * @param {* text Fore Color} textFColor
   * @param {* Background color} textBColor
   */
  constructor(
      bookbuf: Uint8Array, screenWidth: number, screenHeight: number,
      font: Uint8Array, fontSize: number, textFColor: number,
      textBColor: number) {
    // debugger;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.fontSize = fontSize;
    this.fontHeapPtr = copyBufferToHeap(font);
    this.rendererFormatPtr = msdreader.getRendererFormat(
        textFColor, textBColor, textFColor, textBColor, this.fontSize,
        this.fontHeapPtr, font.length);
    // debugger;
    let bookheapPtr = copyBufferToHeap(bookbuf);
    this.bookPtr = msdreader.getBookFromBuf(bookheapPtr, bookbuf.length);
    freeHeap(bookheapPtr);  // free heap from bin buffer;

    this.bookRendererPtr = msdreader.getBookRenderer(
        this.bookPtr, this.rendererFormatPtr, screenWidth, screenHeight);
    let bookIndicatorPtr = msdreader.initBookIndicator();
    this.currentBookPosIndicator =
        msdreader.BookNextPart(this.bookPtr, bookIndicatorPtr);
    msdreader.deleteBookPosIndicator(bookIndicatorPtr);
  }

  renderNextPage() {
    debugger;
    if (msdreader.is_last_atom(this.bookPtr, this.currentBookPosIndicator))
      throw new Error('EOF');

    let NextPage = msdreader.renderNextPage(
        this.bookRendererPtr, this.currentBookPosIndicator);
    if (this.renderedPagePtr) {
      msdreader.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
        msdreader.getBookIndicatorPartOfPageResult(NextPage);
    let img = msdreader.getImageofPageResult(NextPage);
    let imageSize = getDWORDSize(img);
    let pngData = extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    msdreader.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }


  renderPrevPage() {
    // debugger;
    if (msdreader.is_first_atom(this.bookPtr, this.currentBookPosIndicator))
      throw new Error('BEG');

    let NextPage = msdreader.renderBackPage(
        this.bookRendererPtr, this.currentBookPosIndicator);
    if (this.renderedPagePtr) {
      msdreader.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
        msdreader.getBookIndicatorPartOfPageResult(NextPage);
    let img = msdreader.getImageofPageResult(NextPage);
    let imageSize = getDWORDSize(img);
    let pngData = extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    msdreader.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }
  renderNPages(fromInd: IBookPosIndicator, n: number): Array<string> {
    let indic = msdreader.gotoBookPosIndicator(fromInd.group, fromInd.atom);
    if (msdreader.is_last_atom(this.bookPtr, indic)) {
      msdreader.deleteBookPosIndicator(indic);
      throw new Error('EOF');
    }

    let pagesPtr = msdreader.renderNextPages(this.bookRendererPtr, indic, n);
    msdreader.deleteBookPosIndicator(indic);
    if (pagesPtr == null) {
      throw new Error('BAD POINTER');
    }
    let len = getDWORDSize(pagesPtr);
    let pageCount = (len - 4) / 4;
    let images = [];
    for (let i = 0; i < pageCount; i++) {
      let imgPtr = getDWORDSize(pagesPtr + 4 + i * 4);
      let imageSize = getDWORDSize(imgPtr);
      let pngData = extractFromHeapBytes(imageSize - 4, imgPtr + 4);
      let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
      images.push(pic);
      msdreader.deleteBytePoniter(imgPtr);
    }
    msdreader.deleteBytePoniter(pagesPtr);
    return images;
  }
  bookType() {
    return msdreader.getBookType(this.bookPtr);
  }
  areWeAtEnd() {
    return msdreader.is_last_atom(this.bookPtr, this.currentBookPosIndicator);
  }
  areWeAtStart() {
    return msdreader.is_first_atom(this.bookPtr, this.currentBookPosIndicator);
  }

  getProgress() {
    let atomC = msdreader.getBookTotalAtoms(this.bookPtr);
    let p =
        msdreader.getBookProgress(this.bookPtr, this.currentBookPosIndicator);
    return p / atomC;
  }
  getCurrentBookIndicator() {
    let g = msdreader.getIndicatorPart(this.currentBookPosIndicator, 0);
    let a = msdreader.getIndicatorPart(this.currentBookPosIndicator, 1);
    return {group: g, atom: a};
  }
  gotoPos(indicator: IBookPosIndicator) {
    // has memory leakage
    // be careful of using it
    if (this.renderedPagePtr) {
      // to free current BookPos
      msdreader.deleteRenderedPage(this.renderedPagePtr);
    }
    this.currentBookPosIndicator = msdreader.gotoBookPosIndicator(
        indicator.group || 0, indicator.atom || 0)
  }
  getListOfPageIndicators(): Array<IBookPosIndicator> {
    // debugger;
    let res = msdreader.getBookPosIndicators(this.bookRendererPtr);
    let len = getDWORDSize(res);
    let c = Math.floor((len - 4) / 8);
    let pages = [];
    for (let i = 0; i < c; i++) {
      let g = getDWORDSize(res + 4 + i * 8);
      let a = getDWORDSize(res + 4 + i * 8 + 4);
      pages.push({group: g, atom: a})
    }
    msdreader.deleteBytePoniter(res);
    return pages;
  }
  RenderSpecPage(pos: IBookPosIndicator): string {
    let indic = msdreader.gotoBookPosIndicator(pos.group, pos.atom);
    if (msdreader.is_last_atom(this.bookPtr, indic)) throw new Error('EOF');

    let NextPage = msdreader.renderNextPage(this.bookRendererPtr, indic);
    msdreader.deleteBookPosIndicator(indic);
    if (this.renderedPagePtr) {
      msdreader.deleteRenderedPage(this.renderedPagePtr);
    }
    this.lastBookPosIdicator = this.currentBookPosIndicator;
    this.currentBookPosIndicator =
        msdreader.getBookIndicatorPartOfPageResult(NextPage);
    let img = msdreader.getImageofPageResult(NextPage);
    let imageSize = getDWORDSize(img);
    let pngData = extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    msdreader.deleteBytePoniter(img);
    this.renderedPagePtr = NextPage;
    return pic;
  }

  contentAt(itemIndex: number): IBookContent {
    let r = msdreader.getBookContentAt(this.bookPtr, itemIndex);
    if (r === 0) throw new Error('bad Index');
    let size = getDWORDSize(r);
    let gindex = getDWORDSize(r + 4);
    let aindex = getDWORDSize(r + 4 + 4);
    let parentindex = getWORDSize(r + 4 + 4 + 4);
    let sbuf = extractFromHeapBytes(size - 4 - 4 - 4 - 2, r + 4 + 4 + 4 + 2);
    let s = new TextDecoder('utf-8').decode(sbuf);
    return {
      pos: {group: gindex, atom: aindex}, text: s, parentIndex: parentindex
    }
  }
  contentLength() {
    return msdreader.getBookContentLength(this.bookPtr);
  }
  getContentList(): Array<IBookContent> {
    let rtn: Array < IBookContent >= [];
    let cLen = this.contentLength();
    for (let i = 0; i < cLen; i++) rtn.push(this.contentAt(i));
    return rtn;
  }
  renderDocPage(page: number, zoom: number): string {
    // debugger;
    let indic = msdreader.gotoBookPosIndicator(-1, page);
    // should manually check that page is in renderable pages;

    // if (msdreader.is_last_atom(this.bookPtr, indic)) throw new Error('EOF');
    let img = msdreader.renderDocPage(this.bookRendererPtr, indic, zoom, 0);

    msdreader.deleteBookPosIndicator(indic);
    // msdreader.deleteRenderedPage(indic);
    let imageSize = getDWORDSize(img);
    let pngData = extractFromHeapBytes(imageSize - 4, img + 4);
    let pic = 'data:image/png;base64,' + _arrayBufferToBase64(pngData);
    msdreader.deleteBytePoniter(img);
    return pic;
  }
  getPageCount(): number {
    return msdreader.getPageCount(this.bookRendererPtr);
  }
}
