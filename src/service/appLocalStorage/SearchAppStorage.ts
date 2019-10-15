import { appLocalStorage, TCollectionName, TCollectionData } from ".";
import { IBook } from "../../model/model.book";
import { IComment } from "../../model/model.comment";

export class SearchAppStorage {
    // static findById<TCollectionData>(collectionName: TCollectionName, id: string):TCollectionData |null{
    static findById(collectionName: TCollectionName, id: string): any {
        return appLocalStorage[collectionName].findOne({ id: id });
        // appLocalStorage.books.find({ $eq: { id: bookId } });
    }

    static search_by_query_book(
        searchPayload: { limit: number, offset: number, filter?: Object }
    ): IBook[] {
        return appLocalStorage.clc_book.chain()
            .where((book: IBook) => {
                if (searchPayload.filter) {
                    return SearchAppStorage.search_by_query_book_filter(book, searchPayload);
                }
                return false;
            })
            // .simplesort('creation_date', false)//, false
            .sort(SearchAppStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

    private static search_by_query_book_filter(
        book: IBook, searchData: { limit: number, offset: number, filter?: Object }
    ): boolean {
        // let book: IBook = { ...book };
        let filter: any = { ...searchData.filter };
        if (filter.tag) {
            return !!(book.tags && book.tags.includes(filter.tag));

        } else if (filter.genre) {
            return book.genre.includes(filter.genre);

        } else if (filter.writer) { // todo: && filter.book_id // writer || person_id
            if (filter.book_id) {
                if (book.id === filter.book_id) {
                    return false;
                }
            }
            let hasThisWriter = false;
            /* let writers = book.roles.filter(r => r.role === BOOK_ROLES.Writer);
            for (let i = 0; i < writers.length; i++) {
                if (writers[i].person.id === filter.writer) { // writer || person_id
                    hasThisWriter = true;
                    break;
                }
            } */
            for (let i = 0; i < book.roles.length; i++) {
                if (book.roles[i].person.id === filter.writer) { // writer || person_id
                    hasThisWriter = true;
                    break;
                }
            }
            return hasThisWriter;
        } else {
            return false;
        }
    }

    static search_by_query_comment(
        book_id: string, searchPayload: { limit: number, offset: number, filter?: Object }
    ): IComment[] {
        return appLocalStorage.clc_comment.chain()
            .where((comment: IComment) => {
                return comment.book_id === book_id;
            })
            // .simplesort('creation_date')//, false
            .sort(SearchAppStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

    private static asc_sort_creation_date(obj1: TCollectionData, obj2: TCollectionData): number {
        if (obj1.creation_date === obj2.creation_date) return 0;
        if (obj1.creation_date > obj2.creation_date) return -1;
        if (obj1.creation_date < obj2.creation_date) return 1;
        return 0;
    }

    static search_by_phrase_book(
        searchPayload: { limit: number, offset: number, filter: { search_phrase: string } }
    ): IBook[] {
        return appLocalStorage.clc_book.chain()
            .find({ title: { '$contains': searchPayload.filter.search_phrase } })
            // .where((book: IBook) => {
            //     return book.title.includes(searchPayload.filter.search_phrase);
            //     // return false;
            // })
            .sort(SearchAppStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }
}