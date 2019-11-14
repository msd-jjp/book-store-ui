import { IPerson } from "../../model/model.person";
import { IBook } from "../../model/model.book";
import { BOOK_ROLES, BOOK_TYPES } from "../../enum/Book";
// import { appLocalStorage } from "../../service/appLocalStorage";
import { Store2 } from "../../redux/store";
import { action_change_app_flag } from "../../redux/action/internationalization";
import { appLocalStorage } from "../../service/appLocalStorage";

// import React from 'react';

export abstract class CmpUtility {
    static image_pre_url = '/api/serve-files';
    static defaultBookImagePath = "/static/media/img/icon/default-book.png";
    static brokenBookImagePath = "/static/media/img/icon/broken-book.png";
    static bookSizeImagePath = "/static/media/img/icon/book-size.png";
    static defaultAvatarImagePath = "/static/media/img/icon/avatar.png";
    static avatarSizeImagePath = "/static/media/img/icon/avatar.png";
    static brokenAvatarImagePath = "/static/media/img/icon/broken-avatar.png";

    static getImageUrl(imageId: string): string {
        return CmpUtility.image_pre_url + '/' + imageId;
    }

    static imageOnError(e: any, defaultImagePath: string) {
        if (e.target.src !== window.location.origin + defaultImagePath) {
            e.target.src = defaultImagePath;
        }
    }

    static bookImageOnError(e: any) {
        return CmpUtility.imageOnError(e, CmpUtility.brokenBookImagePath);
    }

    static personImageOnError(e: any) {
        return CmpUtility.imageOnError(e, CmpUtility.brokenAvatarImagePath);
    }

    static getPersonFullName(person: IPerson): string {
        let name = person.name || '';
        let last_name = person.last_name || '';
        name = name ? name + ' ' : '';
        return (name + last_name).trim();
    }

    static getPersonFullName_reverse_with_comma(person: IPerson, isPersian = false): string {
        let name = person.name || '';
        let last_name = person.last_name || '';
        if (last_name && name) {
            const comma = isPersian ? '،' : ',';
            last_name = last_name + comma + ' ';
        }
        return (last_name + name); // .trim();
    }

    static getBook_firstImg(book: IBook): string {
        const img_path =
            (book.images && book.images.length && CmpUtility.getImageUrl(book.images[0]))
            ||
            CmpUtility.defaultBookImagePath;
        return img_path;
    }

    static getPerson_avatar(person: IPerson): string {
        const img_path =
            (person.image && CmpUtility.getImageUrl(person.image))
            ||
            CmpUtility.defaultAvatarImagePath;
        return img_path;
    }

    static getBook_role_fisrt_fullName(book: IBook, role: BOOK_ROLES): string {
        const roleList = book.roles.filter(
            r => r.role === BOOK_ROLES[role]
        );
        let fullName = '';
        if (roleList && roleList.length && roleList[0].person) {
            fullName = CmpUtility.getPersonFullName(roleList[0].person);
        }
        return fullName;
    }

    static getBook_role_fisrt_fullName_reverse_with_comma(book: IBook, role: BOOK_ROLES, isPersian?: boolean): string {
        const roleList = book.roles.filter(
            r => r.role === BOOK_ROLES[role]
        );
        let fullName = '';
        if (roleList && roleList.length && roleList[0].person) {
            fullName = CmpUtility.getPersonFullName_reverse_with_comma(roleList[0].person, isPersian);
        }
        return fullName;
    }

    static gotoTop() {
        window.scrollTo(0, 0);
    }

    static getBookTypeIconUrl(bookType: BOOK_TYPES, reverseColor = true) {
        const iconPath = "/static/media/img/icon/book-type/";
        const iconFileName = bookType.toLowerCase().replace('_', '-');
        const postFix = reverseColor ? '-o' : '';
        return (iconPath + iconFileName + postFix + '.svg');
    }

    static waitOnMe(timer: number = 500): Promise<boolean> {
        return new Promise((res, rej) => {
            setTimeout(function () {
                res(true);
            }, timer);
        });
    }

    /**
     * render all cmp with dispatch action_change_app_flag.
     */
    static refreshView() {
        const int = { ...Store2.getState().internationalization };
        Store2.dispatch(action_change_app_flag(int));
    }

    static async removeBookFileFromDevice(book_id_s: string | string[], mainFile: boolean) {
        await appLocalStorage.removeBookFileById(book_id_s, mainFile);

        CmpUtility.refreshView();
    }

}
