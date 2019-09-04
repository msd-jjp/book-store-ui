import { IAPI_ResponseList, BaseService } from "./service.base";

export class UploadService extends BaseService {

    upload(files: any[]): Promise<IAPI_ResponseList<string>> {
        this.axiosTokenInstance.defaults.headers['Content-Type'] = 'multipart/form-data';

        let bodyFormData = new FormData();
        files.forEach(f => {
            bodyFormData.append('files', f);
        })

        return this.axiosTokenInstance.post('/upload', bodyFormData);
    }
}