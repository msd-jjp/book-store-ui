
import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { Setup } from '../setup';
import { fa } from './fa';
import { en } from './en';
import { ar } from './ar';

interface ILocalization extends LocalizedStringsMethods {
    [key: string]: any; // todo
    login: string;
    register: String;
    sign_in: string;
    app_title: string;
    app_logo: string;
    brand_name: string;
    sign_in_bookstore_account: string;
    forgot_password: string;
    msg: {
        ui: {
            [key: string]: any; // todo
            msg1: string;
            msg2: string;
            msg3: string;
            msg4: string;
        },
        back: {
            [key: string]: any; // todo
            msg1: string;
            msg2: string;
            msg3: string;
            msg4: string;
            msg5: string;
            msg6: string;
            msg7: string;
            msg8: string;
            msg9: string;
            msg10: string;
            msg11: string;
            msg12: string;
            msg13: string;
            msg14: string;
            msg15: string;
            msg16: string;
            msg17: string;
            msg18: string;
            msg19: string;
            msg20: string;
            invalid_persons: string;
            addition_error: string;
            username_cellno_required: string;
            invalid_user: string;
            invalid_code: string;
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
    send_again_activationCode: string;
    in: string;
    second: string;
    search: string;
    home: string;
    library: string;
    store: string;
    more: string;
    recomended_for_you: string;
    new_release_in_bookstore: string;
    more_by_writer: string;
    helen_hardet: string;
    it_will_be_launched_soon: string;

    read_now: string;
    view_in_store: string;
    add_to_collection: string;
    mark_as_read: string;
    share_progress: string;
    recommend_this_book: string;
    remove_from_device: string;
    remove_from_home: string;
    loading_with_dots: string;
    retry: string;
    title: string;
    return: string;
    insert_username_or_mobile: string;
    reset_password: string;
    add_to_list: string;
    log_out: string;
    sync: string;
    read_listen_with_audible: string;
    book_update: string;
    reading_insights: string;
    settings: string;
    info: string;
    help_feedback: string;
    about_bookstore_edition: string;
    Length: string;
    pages: string;
    from_the_editor: string;
    about_this_item: string;

    description: string;
    product_description: string;
    review: string;
    about_the_author: string;
    features_details: string;
    product_details: string;
    publication_date: string;
    language:string;
    bookstore_sales_rank:string;
    follow:string;
    customer_review:string;
    read_reviews_that_mention:string;
    see_more:string;
    top_reviews:string;
    verified_purchase:string;
    format:string;
    bookstore_edition:string;
    people_found_this_helpful:string;
    helpful:string;
    report:string;
    see_all_n_reviews:string;
    write_a_review:string;
}

export let Localization: ILocalization = new LocalizedStrings({
    fa: fa,
    en: en,
    ar: ar
});

Localization.setLanguage(Setup.internationalization.flag);
