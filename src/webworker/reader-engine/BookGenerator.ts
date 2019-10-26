import { book, IBookPosIndicator, IBookContent } from "./MsdBook";

export class BookGenerator extends book {
    getAllPages(): Array<IBookPosIndicator> {
        return this.getListOfPageIndicators();
    }
    getAllChapters(): Array<IBookContent> {
        return this.getContentList();
    }

}