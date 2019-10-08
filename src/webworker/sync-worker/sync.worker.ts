
export interface IReceiveData {

}

export interface ISendData {

}

export interface IReceiveMessageEvent extends MessageEvent {
    data: IReceiveData;
}

export interface ISendMessageEvent extends MessageEvent {
    data: ISendData;
}

export default onmessage = async function (e: IReceiveMessageEvent) {
    if (!e.data) return;
    debugger;

    // if (e.data.type === 'start' && e.data._libraryService) {
    //     _fetchData = new FetchData(/* e.data.token */e.data._libraryService);
    //     _fetchData.start_fetchingData();
    // }

    // if (e.data.type === 'stop') {
    //     _fetchData && _fetchData.stop_fetchingData();
    // }

    // postMessage({  });
}
