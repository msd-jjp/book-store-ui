
import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { Setup } from './setup';

interface ILocalization extends LocalizedStringsMethods {
    login: string;
    register: String;
}

export let Localization: ILocalization = new LocalizedStrings({
    fa: {
        login: "ورود",
        register: "ثبت نام"
    },
    en: {
        login: "login",
        register: "register"
    }
});

Localization.setLanguage(Setup.internationalization.flag);
