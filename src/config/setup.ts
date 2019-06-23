interface IInternationalization_fa {
    rtl: true;
    language: 'فارسی';
    flag: 'fa';
}
interface IInternationalization_en {
    rtl: false;
    language: 'english';
    flag: 'en';
}

interface ISetup {
    endpoint: string;
    documentTitle: string;
    notify: {
        timeout: {
            error: number;
            success: number;
            warning: number;
            info: number;
            default: number;
        };
    };
    recordDefaultLoadLength: 10;
    internationalization: IInternationalization_en | IInternationalization_fa;
}

export const Setup: ISetup = {
    endpoint: '/api', // http://10.0.160.34:7000
    documentTitle: 'Book Store',
    notify: {
        timeout: {
            error: 4000,
            success: 2500,
            warning: 3000,
            info: 3000,
            default: 3000,
        }
    },
    recordDefaultLoadLength: 10,
    internationalization: {
        rtl: false,
        language: 'english',
        flag: 'en',
    }
};