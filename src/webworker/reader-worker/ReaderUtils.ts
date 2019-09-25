import { AppGuid } from "../../asset/script/guid";
// import { Store2 } from "../../redux/store";
// import { LibraryService } from "../../service/service.library";
// import { IToken } from "../../model/model.token";

interface IBookTree { chapter_list: { title: string; pages: string[] }[] }
interface IBookSlide {
    id: string;
    isTitle: boolean;
    chapterTitle: string;
    pages: { url: string; number: number }[];
}

export class ReaderUtils {
    static getBookTree_mock(): IBookTree {
        // SampleFetch.fetchLibrary();

        const book_tree: IBookTree = {
            chapter_list: [],
        };
        for (let i = 0; i < 19; i++) {
            book_tree.chapter_list.push({
                title: `chapter ${i + 1}`,
                pages: [
                    `/static/media/img/sample-book-page/page-${1}.jpg`,
                    `/static/media/img/sample-book-page/page-${2}.jpg`,
                    `/static/media/img/sample-book-page/page-${3}.jpg`,
                    `/static/media/img/sample-book-page/page-${4}.jpg`,
                    `/static/media/img/sample-book-page/page-${5}.jpg`,
                    `/static/media/img/sample-book-page/page-${6}.jpg`,
                    `/static/media/img/sample-book-page/page-${7}.jpg`,
                    `/static/media/img/sample-book-page/page-${8}.jpg`,
                    `/static/media/img/sample-book-page/page-${1}.jpg`,
                    `/static/media/img/sample-book-page/page-${2}.jpg`,
                    `/static/media/img/sample-book-page/page-${3}.jpg`,
                    `/static/media/img/sample-book-page/page-${4}.jpg`,
                    `/static/media/img/sample-book-page/page-${5}.jpg`,
                    `/static/media/img/sample-book-page/page-${6}.jpg`,
                    `/static/media/img/sample-book-page/page-${7}.jpg`,
                    `/static/media/img/sample-book-page/page-${8}.jpg`,
                    `/static/media/img/sample-book-page/page-${1}.jpg`,
                    `/static/media/img/sample-book-page/page-${2}.jpg`,
                    `/static/media/img/sample-book-page/page-${3}.jpg`,
                    `/static/media/img/sample-book-page/page-${4}.jpg`,
                    `/static/media/img/sample-book-page/page-${5}.jpg`,
                    `/static/media/img/sample-book-page/page-${6}.jpg`,
                    `/static/media/img/sample-book-page/page-${7}.jpg`,
                    `/static/media/img/sample-book-page/page-${8}.jpg`,
                    `/static/media/img/sample-book-page/page-${1}.jpg`,
                    `/static/media/img/sample-book-page/page-${2}.jpg`,
                    `/static/media/img/sample-book-page/page-${3}.jpg`,
                    `/static/media/img/sample-book-page/page-${4}.jpg`,
                    `/static/media/img/sample-book-page/page-${5}.jpg`,
                    `/static/media/img/sample-book-page/page-${6}.jpg`,
                    `/static/media/img/sample-book-page/page-${7}.jpg`,
                    `/static/media/img/sample-book-page/page-${8}.jpg`,
                ]
            });
        }

        return book_tree;
    }
    static getBookSlideList_mock(): IBookSlide[] {

        let slideList: IBookSlide[] = [];

        let bookTree = ReaderUtils.getBookTree_mock();

        bookTree.chapter_list.forEach((chapter, chapter_index) => {
            slideList.push({
                id: AppGuid.generate(),
                isTitle: true,
                chapterTitle: chapter.title,
                pages: []
            });

            let lastPageNumber = 0;
            if (slideList.length && slideList.length > 1 && slideList[slideList.length - 1 - 1].pages.length) {
                const lastSlide = slideList[slideList.length - 1 - 1];
                const lastSlide_lastPage = lastSlide.pages[lastSlide.pages.length - 1];
                lastPageNumber = lastSlide_lastPage.number;
            }

            for (let i = 0; i < chapter.pages.length;) {
                const newPage = [];
                for (let j = i; j < i + 3; j++) {
                    if (chapter.pages[j]) {
                        let pageNumber = /* (chapter_index + 1) * */ (j + 1) + lastPageNumber;
                        newPage.push({ url: chapter.pages[j], number: pageNumber });
                    }
                }
                slideList.push({
                    id: AppGuid.generate(),
                    isTitle: false,
                    chapterTitle: chapter.title,
                    pages: [...newPage]
                });
                i += 3;
            }
        });

        return slideList;
    }
    static calc_active_slide(bookSlideList: IBookSlide[], book_active_page: number) {
        let activeSlide = 0;
        for (let i = 0; i < bookSlideList.length; i++) {
            let current_slide = bookSlideList[i];

            for (let j = 0; j < current_slide.pages.length; j++) {
                let current_page = current_slide.pages[j];
                if (current_page.number === book_active_page) {
                    activeSlide = i;
                    break;
                }
            }
            if (activeSlide) {
                break;
            }
        }
        // console.log(Store_cart());
        return activeSlide;
    }

    static async getBookSlideList(): Promise<IBookSlide[]> {
        return new Promise(res => {
            res(ReaderUtils.getBookSlideList_mock());
        });
    }
}



// function Store_cart() {
//     return Store2.getState().cart;
// }

// export class SampleFetch {
//     private static _libraryService = new LibraryService();

//     // constructor(token: IToken) {
//     //     SampleFetch._libraryService.setToken(token);
//     // }

//     static setToken(token: IToken) {
//         SampleFetch._libraryService.setToken(token);
//     }

//     static async fetchLibrary(token: IToken) {
//         SampleFetch.setToken(token);

//         await this._libraryService.getAll().then(res => {
//             console.log(res.data);
//         }).catch(error => { console.log(error.response); });
//     }
// }