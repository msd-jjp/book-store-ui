
export abstract class Utility {
    static get_encode_auth(data: { username: string; password: string; }, separator: string = '_:_:_'): string {
        let username_password_str = data.username + separator + data.password;
        let hash = btoa(unescape(encodeURIComponent(username_password_str)));
        return hash;
    }

    static get_decode_auth(hash: string, separator: string = '_:_:_'): { username: string; password: string; } {
        let decode = atob(unescape(encodeURIComponent(hash)));
        let list = decode.split(separator);
        return { username: list[0], password: list[1] };
    }

}
