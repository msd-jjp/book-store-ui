
import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { Setup } from './setup';

interface ILocalization extends LocalizedStringsMethods {
    login: string;
    register: String;
    sign_in: string;
    app_title: string;
}

export let Localization: ILocalization = new LocalizedStrings({
    fa: {
        login: "ورود",
        register: "ثبت نام",
        sign_in: 'ورود',
        app_title:'فروشگاه کتاب'
    },
    en: {
        login: "login",
        register: "register",
        sign_in: 'sign in',
        app_title:'book store'
    }
});

Localization.setLanguage(Setup.internationalization.flag);
