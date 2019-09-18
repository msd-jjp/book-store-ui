import { AppGuid } from "../../../asset/script/guid";

export function getBookTree_mock(): { chapter_list: { title: string; pages: string[] }[] } {
    const book_tree: { chapter_list: { title: string; pages: string[] }[] } = {
        chapter_list: [],
    };
    for (let i = 0; i < 18; i++) {
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
            ]
        });
    }

    return book_tree;
}

export function getBookSlideList_mock(): {
    isTitle: boolean;
    chapterTitle: string;
    pages: string[];
}[] {

    let slideList: {
        id: string;
        isTitle: boolean;
        chapterTitle: string;
        pages: string[];
    }[] = [];


    let bookTree = getBookTree_mock();
    bookTree.chapter_list.forEach(chapter => {
        slideList.push({
            id: AppGuid.generate(),
            isTitle: true,
            chapterTitle: chapter.title,
            pages: []
        });
        chapter.pages.forEach((page, page_index) => {
            let slide_index: any = Math.floor(page_index / 3) + 1;
            if (slideList[slide_index]) {
                slideList[slide_index].pages.push(page);
            } else {
                slideList.push({
                    id: AppGuid.generate(),
                    isTitle: false,
                    chapterTitle: chapter.title,
                    pages: [page]
                });
            }


            // if (page_index === 0) {
            //     // slideList.push({
            //     //     isTitle: true,
            //     //     chapterTitle: chapter.title,
            //     //     pages: []
            //     // });
            //     slideList.push({
            //         isTitle: false,
            //         chapterTitle: chapter.title,
            //         pages: [page]
            //     });
            // }/* else if (page_index ===1) {
            //     slideList.push({
            //             isTitle: false,
            //             chapterTitle: chapter.title,
            //             pages: [page]
            //         });
            //     // let slide_index:any = Math.floor(page_index/3);
            //     // page[slide_index]=page[slide_index] ||[]
            // } */else {
            //     let slide_index: any = Math.floor(page_index / 3) + 1;
            //     slideList[slide_index].pages.push(page);
            // }
        });
        // slideList.push({
        //     isTitle: true,
        //     chapterTitle: chapter.title,
        //     pages: []
        // });

    });

    return slideList;
}

export function calc_active_slide(bookSlideList: any | {
    isTitle: boolean;
    chapterTitle: string;
    pages: string[];
}[], book_active_page: number) {
    return 2;
}