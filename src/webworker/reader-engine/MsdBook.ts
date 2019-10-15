var Module = (window as any).Module;
var msdreader = {
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
      Module.cwrap('gotoBookPosIndicator', 'number', ['number', 'number'])

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
    debugger;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.fontSize = fontSize;
    this.fontHeapPtr = copyBufferToHeap(font);
    this.rendererFormatPtr = msdreader.getRendererFormat(
        textFColor, textBColor, textFColor, textBColor, this.fontSize,
        this.fontHeapPtr, font.length);
    debugger;
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
    debugger;
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
  gotoPos(indicator: {group: number, atom: number}) {
    // has memory leakage
    // be careful of using it
    if (this.renderedPagePtr) {
      // to free current BookPos
      msdreader.deleteRenderedPage(this.renderedPagePtr);
    }
    this.currentBookPosIndicator = msdreader.gotoBookPosIndicator(
        indicator.group || 0, indicator.atom || 0)
  }
}
