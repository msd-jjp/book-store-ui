export const en = {
    login: "login",
    register: "register",
    sign_in: 'sign in',
    app_title: 'book store',
    app_title_: 'app title',
    app_logo: 'bookstore',
    brand_name: 'bookstore',
    sign_in_bookstore_account: 'sign in with your bookstore account',
    forgot_password: 'forgot password?',
    msg: {
        ui: {
            msg1: 'action succeeded',
            msg2: 'error occurred',
            msg3: 'registered successfully, we redirect you to login page.',
            msg4: 'password changed successfully, we redirect you to login page.',
            your_rate_submited: 'your rate submited',
            your_comment_submited: 'your comment submited',
            your_comment_will_be_removed_continue: 'your comment will be removed, continue?',
            no_network_connection: 'error occurred, please check your network connection and try again',
            new_vesion_available_update: 'new vesion of app is available, you can update it.',
            item_will_be_removed_continue: 'item will be removed continue?',
            your_purchase_completed: 'your purchase is completed',
            your_collection_will_be_removed_continue: 'deleting a collection will not remove the books contained within the collection.',
            your_collection_will_be_downloaded_continue: 'all the book in the collection will be downloaded.',
            file_could_not_be_uploaded: 'the file could not be uploaded.',
            one_img_upload_allowed_remove_existing_one: "one img upload allowed, remove existing one",
            login_again: 'login again',
            sync_error: 'error occured while syncing',
            logout_erase_user_data_warning: 'log out will erase all user information from this device.',
            book_file_not_found_download_it: 'book file not found, please download it.',
            reader_epub_error_occurred: 'error occurred while showing book',
            reader_audio_error_occurred: 'error occurred while playing book',
            change_password_successful: 'password successfully changed',
            downloading_reader_security_content: 'downloading security content, please try later',
            initing_reader_security_content: 'initing security content, please try later',
            reader_security_content_failed: 'security content failed, please reload app',
            clear_general_content: 'cached files like: html, default images, js will be removed.',
            book_x_file_not_exist: 'book {0} has no file to download',
            book_x_file_problem: "book {0} has corrupted file and it can't download",
            device_key_not_found_reload: 'your device not registered yet, make sure you have stable internet and reload app',
            you_reached_maximum_active_device: 'you reached maximum active device, please remove at least one of them',
        },
        back: {
            user_already_exists: 'user already exists',
            no_valid_activation_code: 'your activation code has expired, please click resend to reseive new one.',
            wrong_activation_code: 'activation code is invalid',
            already_has_valid_key: 'sending sms will active for you in {0} second',
            message_not_sent: 'error occuerd while sending sms, please try again.',
            cell_no_required: 'cell number is required',
            message_sent: 'message sent to cell number successfully',
            username_exists: 'username already exists.please choose another one',
            signup_token_not_exists: 'Your registration has expired, please start the registration process from the beginning.',
            invalid_signup_token: 'Your registration has expired, please start the registration process from the beginning.',
            token_invalid: 'login again',
            token_expired: 'token expired',
            delete_failed: 'deleting failed',
            get_failed: 'getting failed',
            auth_decoding_failed: 'Authentication decoding failed',
            commit_failed: 'commiting to database failed',
            no_auth: 'you are not logged in',
            invalid_username: 'username or password is not valid',
            invalid_enum: 'enum is not correct  type',
            not_found: 'entity not found',
            invalid_persons: 'there is invalid person id in list',
            addition_error: 'adding model to database failed',
            username_cellno_required: 'for retrieving password username or cell number must send',
            invalid_user: "the user by this data doesn't exist",
            invalid_password: 'password is invalid',
            invalid_code: 'the code is invalid',

            filter_required: 'filter object is not in data',
            upload_failed: 'uploading files encountered a problem',
            invalid_entity: 'entity is not right instance of Class',
            access_denied: 'user has not access to this action',
            already_liked: 'user already liked this comment',
            comment_not_found: 'comment not found',
            already_reported: ' user already reported the comment',
            report_not_found: 'report by this user for this comment not found',
            parent_not_found: 'parent object cant found',
            follow_denied: 'user cant follow him/her self',
            already_follows: 'user already follows target',
            missing_requiered_field: 'missing requiered field',
            already_rated: 'user already rated to book',
            already_exists: 'entity already exists',
            credit_debit_error: 'credit and debit can not have amount at the same time',
            no_price_found: 'there is no price for this book in our tables',
            discount_is_float: 'discount should be sent in float format',
            insufficiant_balance: 'your account value is lower than your reciept',
            user_has_no_account: 'user has no account',
            order_invoiced: 'order is invoiced and not deletable',
            commit_error: 'error while commiting in db',
            person_has_books: 'person already has roles for books',
            book_not_in_lib: 'book is not in users library and cannot add to a collection',
            online_book_count_limitation: 'online book count limitation',

            recheck_information: ".خطایی در دادههای ارسالی وجود دارد، لطفا اطلاعات را بررسی کنید و دوباره ارسال نمایید. (درخواست پرداخت)",
            analyzing_error: "خطایی در تحلیل دادههای در سرور کیپو بوجود آمده است، دقایقی دیگر امتحان فرمایید.",
            server_connection_error: "امکان برقراری ارتباط با سرور کیپو میسر نمیباشد.",
            sending_data_error: "خطایی در دادههای ارسالی وجود دارد، لطفا اطلاعات را بررسی کنید و دوباره ارسال نمایید. (بررسی تایید پرداخت)",
            payment_canceled: "پرداخت توسط کاربر لغو شده یا با مشکل مواجه شده است",
            buyer_cell_no_error: "شماره تماس فروشنده مورد نظر مورد تایید نمیباشد.",
            minimum_payment_error: "حداقل مبلغ پرداخت 1,000 ریال میباشد.",
            maximum_payment_error: "حداکثر مبلغ پرداخت 30,0000,000 ریال میباشد.",
            payment_serial_error: "شناسه پرداخت ارسالی مورد تایید نمیباشد."
        }
    },
    validation: {
        minLength: 'min length {value} character',
        mobileFormat: 'mobile format is not valid',
        smsCodeFormat: 'code is not valid.',
        confirmPassword: 'confirm password not match password.',
        emailFormat: 'email format is not valid',
        phoneFormat: 'phone format is not valid',
    },
    username: 'username',
    password: 'password',
    name: 'name',
    lastname: 'last name',
    phone: 'phone',
    address: 'address',
    mobile: 'mobile',
    email: 'email',
    confirm_password: 'confirm password',
    old_password: 'old password',
    new_password: 'new password',
    confirm_new_password: 'confirm new password',
    invalid_value: 'invalid value',
    required_field: 'required field',
    Show_password: 'Show password',
    login_agree_msg: {
        a: 'By tapping "Sign in" you agree to the {0} {1}',
        b: 'Bookstore Content',
        c: 'and Software Terms of Use'
    },
    new_to_Bookstore: 'new to Bookstore?',
    need_free_bookstore_account: "You'll need a free Bookstore account to sign in.",
    register_your_mobile_number: 'Register your mobile number',
    submit: 'submit',
    already_have_bookstore_account: 'already have bookstore account?',
    verification_code_sended_via_sms_submit_here: 'verification code sended via sms, submit here.',
    verification_code: 'verification code',
    create_an_account: 'create an account',
    send_again: 'send again',
    send_again_activationCode: 'send again activation code',
    in: 'in',
    second: 'second',
    search: 'search',
    home: 'home',
    library: 'library',
    store: 'store',
    more: 'more',
    recomended_for_you: 'recomended for you',
    new_release_in_bookstore: 'new release in bookstore',
    more_by_writer: 'more by {0}',
    helen_hardet: 'helen hardet',
    it_will_be_launched_soon: 'it will be launched soon.',

    read_now: 'read now',
    view_in_store: 'view in store',
    add_to_collection: 'add to collection',
    mark_as_read: 'mark as read',
    share_progress: 'share progress',
    recommend_this_book: 'recommend this book',
    remove_from_device: 'remove from device',
    remove_from_home: 'remove from home',
    loading_with_dots: 'loading...',
    retry: 'retry',
    title: 'title',
    return: 'return',
    insert_username_or_mobile: 'insert your username or mobile number',
    reset_password: 'reset password',
    add_to_list: 'add to list',
    log_out: 'log out',
    sync: 'sync',
    syncing: 'syncing',
    syncing_with_dots: 'syncing...',
    last_synced_on: 'last synced on',
    read_listen_with_audible: 'read & listen with audible',
    book_update: 'book update',
    reading_insights: 'reading insights',
    settings: 'settings',
    info: 'info',
    help_feedback: 'help and feedback',
    about_bookstore_edition: 'about the bookstore edition',
    Length: 'Length',
    pages: 'pages',
    from_the_editor: 'from the editor',
    about_this_item: 'about this item',

    description: 'description',
    product_description: 'product description',
    review: 'review',
    reviews: 'reviews',
    review_s: 'reviews',
    about_the_author: 'about the author',
    features_details: 'features details',
    product_details: 'product details',
    publication_date: 'publication date',
    publisher: 'publisher',
    language: 'language',
    bookstore_sales_rank: 'bookstore sales rank',
    follow: 'follow',
    unfollow: 'unfollow',
    customer_review: 'customer review',
    customer_vote_s: 'customer votes',
    read_reviews_that_mention: 'read reviews that mention',
    see_more: 'see more',
    see_less: 'see less',
    top_reviews: 'top reviews',
    verified_purchase: 'verified_purchase',
    format: 'format',
    bookstore_edition: 'bookstore_edition',
    people_found_this_helpful: 'people found this helpful',
    people_found_this_helpful_1: 'person found this helpful',
    people_report_this: 'people report this',
    people_report_this_1: 'person report this',
    helpful: 'helpful',
    report: 'report',
    see_all_n_reviews: 'see all {0} reviews',
    write_a_review: 'write a review',
    n_out_of_m_stars: '{0} out of {1} stars',
    bookstore_books: 'bookstore books',
    best_seller: 'best seller',
    more_to_explore: 'more to explore',
    all: 'all',
    downloaded: 'downloaded',
    more_reviews: 'more reviews',
    thank_you_for_your_feedback: 'thank you for your feedback',
    inspired_by_your_wishlist: 'inspired by your wishlist',
    uncollected: 'uncollected',
    of: 'of',
    from: 'from',
    to: 'to',
    customer_reviews: 'customer reviews',
    by_writerName: 'by',
    agent: 'agent',
    previous: 'previous',
    next: 'next',
    no_item_found: 'no item found',
    category: {
        category: 'category',
        new: 'new release',
        best_seller: 'best seller',
        recommended: 'recommended',
        wishlist: 'wishlist',

        romance: 'romance',
        classic: 'classic',
        comedy: 'comedy',
        drama: 'drama',
        historical: 'historical',
        religious: 'religious',
        science: 'science',
        social: 'social',
    },
    load_more: 'load more',
    book_isben: 'asin',
    your_comment: 'your comment',
    remove: 'remove',
    your_report_submited: 'your report submited',
    vote: 'vote',
    vote_s: 'vote',
    votes: 'votes',
    remove_from_list: 'remove from list',
    recent_reviews: 'recent reviews',
    minute: 'minute',
    hour: 'hour',
    remove_comment: 'remove comment',
    close: 'close',
    app_info: 'app info',
    version: 'version',
    version_mode: 'version mode',
    trial_mode: 'trial mode',
    trial: 'trial',
    dont_want_now: "i don't want now",
    update: 'update',
    shopping_cart: 'shopping cart',
    remove_from_wish_list: 'remove from wish list',
    add_to_wish_list: 'add to wish list',
    remove_from_cart_list: 'remove from shopping cart',
    add_to_cart_list: 'add to shopping cart',
    your_shopping_cart_is_empty: 'your shopping cart is empty',
    book_type: 'book type',
    genre_type_list: {
        Comedy: "comedy",
        Drama: "drama",
        Romance: "romance",
        Social: "social",
        Religious: "religious",
        Historical: "historical",
        Classic: "classic",
        Science: "science",
    },
    book_type_list: {
        DVD: 'DVD',
        Audio: 'Audio',
        Hard_Copy: 'Hard_Copy',
        Pdf: 'Pdf',
        Epub: 'Epub'
    },
    role_type_list: {
        Author: 'Author',
        Writer: 'Writer',
        Translator: 'Translator',
        Press: 'Press',
        Contributer: 'Contributer',
        Designer: 'Designer',
    },
    buy: 'buy',
    price: 'price',
    total_price: 'total price',
    recalculate: 'recalculate',
    view_detail: 'view detail',
    cancel: 'cancel',
    ok: 'ok',
    create: 'create',
    new_collection: 'new collection',
    collection_name: 'collection name',
    create_new_collection: 'create new collection',
    remove_collection: 'remove collection',
    delete_collection_: 'delete collection?',
    rename_collection: 'rename collection',
    rename: 'rename',
    download_collection: 'download collection',
    download_collection_: 'download collection?',
    download: 'download',
    downloading: 'downloading',
    add: 'add',
    selected: 'selected',
    select_all: 'select all',
    deselect_all: 'deselect all',
    profile: "profile",
    profile_image: "profile image",
    exist_in_library: 'exist in library',
    preview: "preview",
    drag_and_drop: "drag and drop",
    choose_image: 'choose image',
    n_min_left_in_chapter: '{0} min left in chapter',
    n_min_left_in_book: '{0} min left in book',
    book_from_your_library: 'book from your library',
    your_recent_item_appear_manage_remove: 'your recent item will appear here. you can manage or remove it anytime.',
    go_to_library: 'go to library',
    shop_in_store: 'shop in store',
    sure_you_want_log_out: 'are you sure you want to log out?',
    readed_: 'read',
    close_book: 'close book',
    goto: 'go to',
    go: 'go',
    enter_location: 'enter location',
    you_are_reading_loaction_n: 'you are currently reading at loaction {0}.',
    purchase_history: 'purchase history',
    purchase_date: 'purchase date',
    page_not_found: 'page not found',
    detail: 'detail',
    count: 'count',
    unit_price: 'unit price',
    type: 'type',
    text_size: 'text size',
    theme: 'theme',
    font: 'font',
    reader_theme_obj: {
        white: 'white',
        dark: 'dark',
        green: 'green',
        sepia: 'sepia',
    },
    font_obj: {
        iransans: 'iransans',
        nunito: 'nunito',
        zar: 'zar',
    },
    account_balance: 'account balance',
    increase_credit: 'increase credit',
    payment: 'payment',
    existing_credit: 'existing credit',
    increase_amount_rial: 'increase amount(rial)',
    min_increase_amount_rial_is: 'min increase amount is {0} rial',
    payment_status_obj: {
        successful: 'payment was successful.',
        'payment-canceled': 'payment canceled.',
        unknown: 'error occurred in payment.',
        'payment-amount-invalid': 'payment amount is invalid.',

    },
    payment_result: 'payment result',
    language_obj: {
        PERSIAN: 'persian',
        ENGLISH: 'english',
        ARABIC: 'arabic',
        FRENCH: 'french',
        GERMAN: 'german',
        SPANISH: 'spanish',
    },
    change_password: 'change password',
    storage: 'storage',
    clear_general_content: 'clear general content',
    clear_content_security_system: 'clear content security system',
    state: 'state',
    reset_reader: 'reset reader',
    confirm: 'confirm',
    javscript_file: 'javscript file',
    webassembly_file: 'webassembly file',
    clear: 'clear',
    unknown: 'unknown',
    operating_system: 'operating system',
    browser: 'browser',
    device: 'device',
    active_device_list: 'active device list',
}