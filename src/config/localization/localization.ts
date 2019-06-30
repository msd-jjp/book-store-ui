
import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { Setup } from '../setup';
import { fa } from './fa';
import { en } from './en';

interface ILocalization extends LocalizedStringsMethods {
    [key: string]: any;
    login: string;
    register: String;
    sign_in: string;
    app_title: string;
    app_logo: string;
    sign_in_bookstore_account: string;
    forgot_password: string;
    msg: {
        ui: {
            msg1: string;
            msg2: string;
            msg3: string;
        },
        back: {
            msg1: string;
            msg2: string;
        }
    };
    validation: {
        minLength: string;
        mobileFormat: string;
        smsCodeFormat: string;
        confirmPassword: string;
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
    register_your_mobile_number: string;
    submit: string;
    already_have_bookstore_account: string;
    verification_code_sended_via_sms_submit_here: string;
    verification_code: string;
    create_an_account: string;
    send_again: string;
    in: string;
    second: string;
}

export let Localization: ILocalization = new LocalizedStrings({
    fa: fa,
    en: en
});

Localization.setLanguage(Setup.internationalization.flag);
