
export interface IInternationalization {
    rtl: boolean;
    language: string;
    flag: string;
}
interface IInternationalization_fa extends IInternationalization {
    rtl: true;
    language: 'فارسی';
    flag: 'fa';
}
interface IInternationalization_en extends IInternationalization {
    rtl: false;
    language: 'english';
    flag: 'en';
}
interface IInternationalization_ar extends IInternationalization {
    rtl: true;
    language: 'العربیه';
    flag: 'ar';
}

export type TInternationalization = IInternationalization_en | IInternationalization_fa | IInternationalization_ar;

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
    internationalization: TInternationalization;
}

export const Setup: ISetup = {
    endpoint: '/api', // http://10.0.160.34:7000, '/171.22.27.108', // 
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
        rtl: true,
        language: 'فارسی',
        flag: 'fa',
        /* rtl: false,
    language: 'english',
    flag: 'en', */
    }
};