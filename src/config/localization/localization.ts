
import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { Setup } from '../setup';
import { fa } from './fa';
import { en } from './en';

interface ILocalization extends LocalizedStringsMethods {
    login: string;
    register: String;
    sign_in: string;
    app_title: string;
    app_logo: string;
    sign_in_bookstore_account: string;
    forgot_password: string;
    msg: {
        msg1: string;
    };
    validation: {
        minLength: string;
    },
    username: string;
    password: string;
    name: string;
    lastname: string;
    phone: string;
    address: string;
    mobile: string;
    confirm_password: string;
    invalid_value: string;
    required_field: string;
    Show_password: string;
    login_agree_msg: {
        a: string;
        b: string;
        c: string;
    };
    new_to_Bookstore: string;
    need_free_bookstore_account: string;
}

export let Localization: ILocalization = new LocalizedStrings({
    fa: fa,
    en: en
});

Localization.setLanguage(Setup.internationalization.flag);
