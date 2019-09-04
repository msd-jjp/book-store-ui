export const AppRegex = {
    // mobile: '',
    mobile_iran: /^(\+98|0)?9\d{9}$/,
    username: '',
    password: '',
    nationalCode: '',
    // phone: '',

    number: /^-?\d*(\.\d+)?$/,
    integer: /^\d+$/,
    mobile: /^((\+|00)?\d{1,3})?[1-9][0-9]{9}$/,
    phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
    website: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/,
    zipCode: '',
    smsCode: /^\d{4}$/,
    email:/^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>().,;\s@"]+.{0,1})+[^<>().,;:\s@"]{2,})$/,
}