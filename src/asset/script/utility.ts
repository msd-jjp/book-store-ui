
type TClient_OS_name = 'Unknown OS' | 'Windows' | 'MacOS' | 'UNIX' | 'Linux' | 'iOS' | 'Android' | 'Tizen';
export interface IBrowserDetail {
    browserName: string;
    fullVersion: string;
    majorVersion: number;
    appName: string;
    userAgent: string;
    OSName: TClient_OS_name;
}

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

    static mobilecheck(): boolean {
        let check = false;
        let operaWindow: any = window;
        let operaNvg = operaWindow.opera;

        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || operaNvg);
        return check;
    }

    static mobileAndTabletcheck(): boolean {
        let check = false;
        let operaWindow: any = window;
        let operaNvg = operaWindow.opera;

        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || operaNvg);
        return check;
    };

    static detectmobWith_userAgent(): boolean {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    static detectmob_ie(): boolean {
        if (window.innerWidth <= 800 && window.innerHeight <= 600) {
            return true;
        } else {
            return false;
        }
    }

    static round_num_decimals(float: number, fixed: number = 2): number {
        if (!float) return 0;
        const pfixed = Math.pow(10, fixed);
        return Math.round(float * pfixed) / pfixed;
    }

    static noRound_num_decimals(float: number, fixed: number = 2): number {
        if (!float) return 0;
        const pfixed = Math.pow(10, fixed);
        return Math.trunc(float * pfixed) / pfixed; // === parseInt(value) === ~~value
    }

    private static persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    private static arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    static fix_phrase_numbers(str: string) {
        if (typeof str === 'string') {
            for (var i = 0; i < 10; i++) {
                str = str.replace(this.persianNumbers[i], i.toLocaleString()).replace(this.arabicNumbers[i], i.toLocaleString());
            }
        }
        return str;
    };

    /**
     * conver second duration to timer.
     * @param second: duration in second, for example 1 hour = 3600 s.
     * @returns it return time format like 35:06:53 (minute and second alwayes <= 59 & >=0)
     */
    static second_to_timer(second: number): string {
        let hour = Math.floor(second / 3600);
        let min = Math.floor((second - (hour * 3600)) / 60);
        let sec = second - (min * 60) - (hour * 3600);

        return `${Utility.convert_oneDigitNum_to_two(hour)}:${Utility.convert_oneDigitNum_to_two(min)}:${Utility.convert_oneDigitNum_to_two(sec)}`;
    }

    private static convert_oneDigitNum_to_two(number: number): string {
        let num = number.toString();
        if (number < 10) {
            return '0' + num;
        }
        return num;
    }

    static prettifyNumber(number: number): string {
        return number.toLocaleString();
    }

    static byteFileSize(byte: number): string {
        if (!byte && byte !== 0) return '';
        const kb = byte / 1024;
        const mb = kb / 1024;
        let rtn = '';
        if (mb > 0) {
            rtn = Math.round(mb * 100) / 100 + ' MB';
        } else if (kb > 0) {
            rtn = Math.round(kb * 100) / 100 + ' KB';
        } else {
            rtn = Math.round(byte * 100) / 100 + ' B';
        }
        return rtn;
    }

    static waitOnMe(timer: number = 500): Promise<boolean> {
        return new Promise((res, rej) => {
            setTimeout(function () {
                res(true);
            }, timer);
        });
    }

    static float32Concat(first: Float32Array, second: Float32Array): Float32Array {
        const firstLength = first.length;
        const result = new Float32Array(firstLength + second.length);

        result.set(first);
        result.set(second, firstLength);

        return result;
    }

    static getClientOSName(): TClient_OS_name {
        var userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os: TClient_OS_name = "Unknown OS";

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'MacOS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (/Tizen/.test(userAgent)) {
            os = 'Tizen';
        } else if (/Linux/.test(platform)) {
            os = 'Linux';
        } else if (navigator.appVersion.indexOf("X11") !== -1) os = "UNIX";

        return os;
    }

    static browserDetail(): IBrowserDetail {
        // let nVer = navigator.appVersion;
        let nAgt = navigator.userAgent;
        let browserName = navigator.appName;
        let fullVersion = '' + parseFloat(navigator.appVersion);
        let majorVersion = parseInt(navigator.appVersion, 10);
        let nameOffset, verOffset, ix;

        // In Opera 15+, the true version is after "OPR/" 
        if ((verOffset = nAgt.indexOf("OPR/")) !== -1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset + 4);
        }
        // In older Opera, the true version is after "Opera" or after "Version"
        else if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf("Version")) !== -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // Edge
        else if ((verOffset = nAgt.indexOf("Edge")) !== -1) {
            browserName = "Edge";
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // In SamsungBrowser, the true version is after "SamsungBrowser" 
        else if ((verOffset = nAgt.indexOf("SamsungBrowser")) !== -1) {
            browserName = "SamsungBrowser";
            fullVersion = nAgt.substring(verOffset + 15);
        }
        // In Chrome, the true version is after "Chrome" 
        else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 7);
        }
        // In Chrome in IOS, the true version is after "CriOS" 
        else if ((verOffset = nAgt.indexOf("CriOS")) !== -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 6);
        }
        // In Safari, the true version is after "Safari" or after "Version" 
        else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf("Version")) !== -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
        // In Firefox, the true version is after "Firefox" 
        else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset + 8);
        }
        // In most other browsers, "name/version" is at the end of userAgent 
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
            (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(";")) !== -1)
            fullVersion = fullVersion.substring(0, ix);
        if ((ix = fullVersion.indexOf(" ")) !== -1)
            fullVersion = fullVersion.substring(0, ix);

        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        /* let OSName: TClient_OS_name = "Unknown OS";

        if (navigator.appVersion.indexOf("Win") !== -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") !== -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") !== -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") !== -1) OSName = "Linux"; */

        return {
            browserName,
            fullVersion,
            majorVersion,
            appName: navigator.appName,
            userAgent: navigator.userAgent,
            OSName: Utility.getClientOSName()
        }
    }

    static random_int(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static readonly partial_downloadSize = 100000;

}
