import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
// import { IToken } from "../../../model/model.token";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";

import { Localization } from "../../../config/localization/localization";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { Dropdown } from "react-bootstrap";
import RcSlider from 'rc-slider';
import { ILibrary } from "../../../model/model.library";
import { getLibraryItem } from "../../library/libraryViewTemplate";
import { CmpUtility } from "../../_base/CmpUtility";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { AudioBookGenerator } from "../../../webworker/reader-engine/AudioBookGenerator";
import { ReaderUtility } from "../ReaderUtility";
//
// import * as WaveSurferAll from 'wavesurfer.js';
//
// import WaveSurfer from 'wavesurfer.js';
//
// import ss from'wavesurfer.js/dist/wavesurfer';

// const WaveSurfer = require('wavesurfer.min.js');

// const WaveSurfer: any = {}; // = require('wavesurfer.js');
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline';
// const WaveSurfer = WaveSurferAll.default;
//
const WaveSurfer = require('wavesurfer.js/dist/wavesurfer');
//
// import WaveSurfer from 'wavesurfer.js/src/wavesurfer';
// const WaveSurfer = require('wavesurfer.js/src/wavesurfer');
const TimelinePlugin = require('wavesurfer.js/dist/plugin/wavesurfer.timeline');
const CursorPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.cursor');

interface IProps {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    history: History;
    // token: IToken;
    network_status: NETWORK_STATUS;
    onUserLoggedIn: (user: IUser) => void;
    match: any;
    library: ILibrary_schema;
}

interface IState {
    book: IBook | undefined;
    loading: boolean;
    error: string | undefined;
    playlist: string[];
    isPlaying: boolean;
    active_item: string;
    volume: {
        val: number;
        mute: boolean;
    };
}

class ReaderAudioComponent extends BaseComponent<IProps, IState> {
    private book_id: string = '';

    private playlist = [
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/A%20Birthday%20Present.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/All%20The%20Dead%20Dears.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Ariel.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Battle-Scenet.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Black%20Rock%20In%20Rainy%20Weather.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Daddy.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Departure%20Of%20The%20Ghost.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Fever%20103.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Full%20Fathom%20Five.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Lady%20Lazarus.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Letter%20in%20November.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Lorelei.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Mushrooms.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Nick%20And%20The%20Candle%20Stick.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/November%20Graveyard.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/On%20The%20Decline%20Of%20Oracles.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/On%20The%20Difficulty%20Of%20Conjuring%20Up%20A%20Dryad.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/On%20The%20Plethora%20Of%20Dryads.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Perseus-The%20Triumph%20Of%20Wit%20Over%20Suffering.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Point%20Shirley.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Purdah.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Sow.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/The%20Applicant.ogg',
        'https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/The%20Thin%20People.ogg',
    ];

    state = {
        book: undefined,
        loading: false,
        error: undefined,
        playlist: this.playlist,
        isPlaying: false,
        active_item: this.playlist[0],
        volume: {
            val: 1,
            mute: false
        }
    };

    private _personService = new PersonService();

    private book_page_length = 2500;
    private book_active_page = 372;

    private wavesurfer: WaveSurfer | undefined;
    private _componentWillUnmount = false;
    private is_small_media = false;
    private _libraryItem: ILibrary | undefined;

    constructor(props: IProps) {
        super(props);

        // this._personService.setToken(this.props.token);
        this.book_id = this.props.match.params.bookId;
    }

    componentWillMount() {
        if (window.innerWidth < 500) {
            this.is_small_media = true;
        }
        if (this.book_id) {
            this._libraryItem = getLibraryItem(this.book_id);
        }
    }

    componentDidMount() {
        if (!this._libraryItem) {
            this.props.history.replace(`/dashboard`);
            return;
        }

        // this.setBook_byId(/* this.book_id */);
        this.updateUserCurrentBook_client();
        this.updateUserCurrentBook_server();
        // this.initAudio();
        this.generateReader();
    }
    componentWillUnmount() {
        // this._componentWillUnmount = true;
        // this.wavesurfer!.xhr
        console.log('wavesurfer!.destroy');
        try {
            if (this.wavesurfer) {
                this.wavesurfer.cancelAjax();
                this.wavesurfer.destroy();
            }
        } catch (e) {
            // note Firefox bug
            console.error('componentWillUnmount wavesurfer!.destroy', e);
        }
    }

    updateUserCurrentBook_client() {
        const book = this._libraryItem!.book;
        this.setState({ ...this.state, book: book });

        let logged_in_user = { ...this.props.logged_in_user! };
        if (logged_in_user.person.current_book && logged_in_user.person.current_book.id === this.book_id) {
            return;
        }
        logged_in_user.person.current_book = book;
        this.props.onUserLoggedIn(logged_in_user);
    }
    async updateUserCurrentBook_server() {
        if (!this.book_id) return;
        if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
        if (this.props.logged_in_user!.person.current_book &&
            this.props.logged_in_user!.person.current_book.id === this.book_id) {
            return;
        }

        await this._personService.update(
            { current_book_id: this.book_id },
            this.props.logged_in_user!.person.id
        ).catch(e => {
            // this.handleError({ error: e.response });
        });
    }

    audio_header_render() {
        return (
            <div className="audio-header">
                <div className="row">
                    <div className="col-12">
                        <div className="icon-wrapper">
                            <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer go-back"
                                onClick={() => this.goBack()}
                            ></i>

                            <h5 className="book-title mb-0 text-center">{this.getBookTitle()}</h5>
                            {/* <i className="fa fa-bars text-dark p-2 cursor-pointer"
                onClick={() => this.showSidebar()}
              ></i> */}


                        </div>
                    </div>
                </div>
            </div>
        )
    }

    getBookTitle(): string {
        const book: IBook | undefined = this.state.book;
        if (!book) return '';
        return book!.title;
    }

    bookFileNotFound_notify() {
        const notifyBody: string = Localization.msg.ui.book_file_not_found_download_it;
        const config: ToastOptions = { autoClose: Setup.notify.timeout.warning, onClose: this.goBack.bind(this) };
        toast.warn(notifyBody, this.getNotifyConfig(config));
    }

    readerError_notify() {
        const notifyBody: string = Localization.msg.ui.reader_epub_error_occurred;
        const config: ToastOptions = { autoClose: Setup.notify.timeout.warning, onClose: this.goBack.bind(this) };
        toast.error(notifyBody, this.getNotifyConfig(config));
    }

    private async generateReader() {
        await CmpUtility.waitOnMe(0);
        await this.createBook();
        if (!this._bookInstance) return;
        // this.initAudio();
        this.initAudio2();
    }

    private _bookInstance!: AudioBookGenerator;
    private async createBook() {
        const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
        if (!bookFile) {
            //   this.setState({ page_loading: false });
            this.setState({ loading: false });
            this.bookFileNotFound_notify();
            return;
        }

        try {
            this._bookInstance = await ReaderUtility.createAudioBook(this.book_id, bookFile);
        } catch (e) {
            console.error(e);
            //   this.setState({ page_loading: false });
            this.setState({ loading: false });
            this.readerError_notify();
        }
    }

    private initAudio2() {
        const fileTotalDuration = this._bookInstance.getTotalDuration();
        const allAtoms_pos = this._bookInstance.getAllAtoms_pos();
        let trackTotalDuration = 0;
        allAtoms_pos.forEach(atom=>{
            trackTotalDuration += this._bookInstance.getAtomDuration(atom);
        });
        debugger;

        const obj: any = { // WaveSurfer.WaveSurferParams = {
            // const obj: WaveSurfer.WaveSurferParams = {
            container: '#waveform',
            waveColor: '#01aaa480', //'#A8DBA8',
            progressColor: '#01aaa4', // '#3B8686',
            // backend: 'MediaElement',
            backend: 'WebAudio',
            // height: 208,
            height: 320,
            barWidth: 1,
            cursorWidth: 1,
            cursorColor: '#015e5b', // '#4a74a5',


            // partialRender:true,
            // splitChannels:true,
            // mediaControls: true,
            // audioContext:

            duration: trackTotalDuration / 1000,


            // responsive: true,
            // rtl: true,
            plugins: [
                // _waveSurfer_timeline.create({
                TimelinePlugin.create({
                    container: "#wave-timeline",
                    height: 16,
                }),
                CursorPlugin.create({
                    showTime: true,
                    opacity: .5,
                    customShowTimeStyle: {
                        'background-color': '#000',
                        color: '#fff',
                        padding: '2px',
                        'font-size': '10px'
                    },
                })
            ]
        };
        // const wvs: WaveSurfer = WaveSurfer.create(obj);
        // this.wavesurfer = WaveSurfer.create(obj);
        // const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
        // debugger;


        
        // debugger;
        // const firstAtom = this._bookInstance.getFirstAtom();
        this._bookInstance.loadVoiceAtom(allAtoms_pos[0]); // firstAtom

        let srate = this._bookInstance.getLoadedVoiceAtomSampleRate();
        let chans = this._bookInstance.getLoadedVoiceAtomChannels();
        console.log(this._bookInstance.getLoadedVoiceAtomDuration());
        let atom_10_1 = this._bookInstance.getLoadedVoiceAtom10Second(0);
        let atom_10_2 = this._bookInstance.getLoadedVoiceAtom10Second(10000);
        let atom_10_3 = this._bookInstance.getLoadedVoiceAtom10Second(20000);
        let atom_10_4 = this._bookInstance.getLoadedVoiceAtom10Second(30000);
        /* let audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)(
            {
                sampleRate: srate
            }
        );
        let audioBuffer = audioCtx.createBuffer(chans, b[0].length, srate);
        for (let i = 0; i < chans; i++) {
            audioBuffer.copyToChannel(b[i], i, 0);
        } */

        // var source = audioCtx.createBufferSource();

        // obj.audioContext = source.context;
        // obj.audioContext = this.getAudioContext(srate);

        this.wavesurfer = WaveSurfer.create(obj);
        // wvs.loadBlob(new Blob([bookFile!]));
        // this.wavesurfer!.loadBlob(new Blob([bookFile!]));
        // this.wavesurfer!.loadBlob(new Blob([bookFile!]));
        // this.wavesurfer!.loa
        // this.wavesurfer!.loadDecodedBuffer(audioBuffer);
        // this.wavesurfer!.loadArrayBuffer(audioBuffer);
        // this.wavesurfer!.loadDecodedBuffer(b);

        // let bbb = Array.prototype.slice.call(b);
        // Float32Array.prototype.buffer
        // new b().prototype.buffer

        // const audioBuffer_1 = this.getaudioBuffer(srate, chans, atom_10_1);
        // const audioBuffer_2 = this.getaudioBuffer(srate, chans, [...atom_10_1, ...atom_10_2]);
        // const audioBuffer_3 = this.getaudioBuffer(srate, chans, [...atom_10_1, ...atom_10_2, ...atom_10_3]);
        // const audioBuffer_4 = this.getaudioBuffer(srate, chans, [...atom_10_1, ...atom_10_2, ...atom_10_3, ...atom_10_4]);
        // const audioBuffer_5 = this.getaudioBuffer_(srate, chans, atom_10_4);

        // const audioBuffer_6 = this.getaudioBuffer(
        //     srate,
        //     chans,
        //     [
        //         // Float32Array.from([...new Array(441000), ...atom_10_2[0]])
        //         // Float32Array.from([... Float32Array.from(new Array(441000)), ...atom_10_1[0]])
        //         // [...Float32Array.from(new Array(441000))].concat
        //         Float32Array.from([...new Float32Array(441000),...atom_10_1[0]]),
        //         Float32Array.from([...new Float32Array(441000),...atom_10_1[1]])
        //     ]
        // );

        this.wavesurfer!.backend.setPeaks([], trackTotalDuration / 1000);
        // this.wavesurfer!.backend.audioContext = this._audioContext;
        // this.wavesurfer!.backend.currentTime = 30;
        // this.wavesurfer!.loadDecodedBuffer(audioBuffer_5);
        // setTimeout(() => {
        //     // this.pause();
        //     // this.wavesurfer!.loadDecodedBuffer(audioBuffer_c);
        //     // this.wavesurfer!.appendDecodedBuffer(audioBuffer_c);
        // }, 13000);
        debugger;

        this.wavesurfer!.on('audioprocess', () => { this.updateTimer(); });
        this.wavesurfer!.on('seek', () => { this.updateTimer(); });

        // let aa = this.wavesurfer!.backend;
        // let peaks = [
        //     0.0218, 0.0183, 0.0165, 0.0198, 0.2137, 0.2888, 0.2313, 0.15, 0.2542, 0.2538, 0.2358, 0.1195, 0.1591, 0.2599, 0.2742, 0.1447, 0.2328, 0.1878, 0.1988, 0.1645, 0.1218, 0.2005, 0.2828, 0.2051, 0.1664, 0.1181, 0.1621, 0.2966, 0.189, 0.246, 0.2445, 0.1621, 0.1618, 0.189, 0.2354, 0.1561, 0.1638, 0.2799, 0.0923, 0.1659, 0.1675, 0.1268, 0.0984, 0.0997, 0.1248, 0.1495, 0.1431, 0.1236, 0.1755, 0.1183, 0.1349, 0.1018, 0.1109, 0.1833, 0.1813, 0.1422, 0.0961, 0.1191, 0.0791, 0.0631, 0.0315, 0.0157, 0.0166, 0.0108
        // ];
        // peaks = peaks.map(x => x + 1.5);
        // this.wavesurfer!.backend.setPeaks(peaks, totalDuration / 1000);
        // this.wavesurfer!.backend.setPeaks([], totalDuration / 1000);
        debugger;

        /* function load(url, peaks) {
            wavesurfer.backend.setPeaks(peaks);
            wavesurfer.drawBuffer();
            wavesurfer.getArrayBuffer(url, data => wavesurfer.loadArrayBuffer(data));
        } */
        const ax_ = this.getAudioContext(srate);
        const audioBuffer_min = this.getaudioBuffer(ax_, srate, 1, [new Float32Array(1)]);
        this.wavesurfer!.loadDecodedBuffer(audioBuffer_min);

        setTimeout(() => {
            debugger;
            // this._audioContext!
            // const ax = this.wavesurfer!.backend.getAudioContext();
            const ax = this.getAudioContext(srate);
            const source = ax.createBufferSource();
            const audioBuffer_6 = this.getaudioBuffer(ax, srate, chans, atom_10_4);
            // this.wavesurfer!.loadDecodedBuffer(audioBuffer_6);
            source.buffer = audioBuffer_6;
            source.connect(ax.destination);

            this.wavesurfer!.setCurrentTime(30);
            this.play();

            source.start();

            // source1.onended = (e) => {
            //     source1.stop();
            //     source1.disconnect()
            // };
        }, 3000);

    }

    private _audioContext: AudioContext | undefined;
    private getAudioContext(sampleRate: number): AudioContext {
        if (this._audioContext) return this._audioContext;
        let audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: sampleRate });
        this._audioContext = audioCtx;
        return this._audioContext!;
    }

    // getaudioBuffer_(sampleRate: number, channel: number, float32Array: Float32Array[]): AudioBuffer {
    //     // let audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: sampleRate });
    //     let audioBuffer = this._audioContext!.createBuffer(channel, float32Array[0].length, sampleRate);
    //     for (let i = 0; i < channel; i++) {
    //         audioBuffer.copyToChannel(float32Array[i], i, 0);
    //     }
    //     return audioBuffer;
    // }
    getaudioBuffer(audioContext: AudioContext, sampleRate: number, channel: number, sourceList: Float32Array[]): AudioBuffer {
        // let audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: sampleRate });
        let audioBuffer = audioContext.createBuffer(channel, sourceList[0].length, sampleRate);
        for (let i = 0; i < channel; i++) {
            audioBuffer.copyToChannel(sourceList[i], i, 0);
        }
        return audioBuffer;
    }

    private initAudio() {
        const progressDiv: any = document.querySelector('#progress-bar');
        const progressBar = progressDiv!.querySelector('.progress-bar');

        const showProgress = (percent: number, xhr: XMLHttpRequest) => {
            // if (this._componentWillUnmount) {
            //     console.log('abort.........', xhr)
            //     xhr && xhr.abort();
            //     return;
            // }
            console.log('showProgress...');
            progressDiv!.style.display = 'block';
            progressBar!.style.width = percent + '%';
            progressBar!.innerText = percent + '%';
        };

        const hideProgress = () => {
            console.log('hideProgress...');
            progressDiv.style.display = 'none';
        };

        // const opt: any = { // WaveSurfer.WaveSurferParams = {
        const wsParams: WaveSurfer.WaveSurferParams = {
            container: '#waveform',
            waveColor: '#01aaa480', //'#A8DBA8',
            progressColor: '#01aaa4', // '#3B8686',
            // backend: 'MediaElement',
            backend: 'WebAudio',
            // height: 208,
            height: 320,
            barWidth: 1,
            cursorWidth: 1,
            cursorColor: '#015e5b', // '#4a74a5',

            // responsive: true,
            // rtl: true,
            plugins: [
                // _waveSurfer_timeline.create({
                TimelinePlugin.create({
                    container: "#wave-timeline",
                    // notchPercentHeight: 100,
                    // unlabeledNotchColor:'ff0000',
                    // primaryColor:'09f311',
                    // secondaryColor:'#d131ef',
                    // primaryColor:'#09f311',
                    // secondaryColor:'#09f311',
                    // secondaryColor:'#ff0000',
                    // primaryFontColor: '#0dc2f9',
                    // primaryFontColor: '#ff0000',
                    // secondaryFontColor: '#f9d10d',
                    // secondaryFontColor: '#ff0000',
                    // rtl: true,
                    // fontSize: 10,
                    // labelPadding: 0
                    // fontFamily: 'farsi',
                    // offset: 20,
                    height: 16,
                }),
                CursorPlugin.create({
                    showTime: true,
                    opacity: .5,
                    customShowTimeStyle: {
                        'background-color': '#000',
                        color: '#fff',
                        padding: '2px',
                        'font-size': '10px'
                    },
                    // showTime:true,
                    // followCursorY: true,
                    // width: 1,
                })
            ]
        };
        this.wavesurfer = WaveSurfer.create(wsParams);
        // this.wavesurfer = new WaveSurfer(opt);
        this.wavesurfer!.on('ready', () => {
            // this.wavesurfer.play();
            console.log('ready...');
            hideProgress();
            // this.toggleLoading();
            this.hideLoader();
        });
        this.wavesurfer!.on('waveform-ready', () => {
            console.log('waveform-ready...');
            hideProgress();
            this.hideLoader();
        });
        // this.wavesurfer.load('example/media/demo.wav');
        // this.toggleLoading();
        // this.wavesurfer.load(music);
        // this.wavesurfer.load('https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Perseus-The%20Triumph%20Of%20Wit%20Over%20Suffering.mp3');
        // this.wavesurfer.loadBlob(music);
        this.wavesurfer!.on('error', (e: any) => {
            if (e.name === "AbortError") { return; }
            const err_res = this.handleError({ error: e, toastOptions: { toastId: 'player_error' } }); // {}
            this.setState({ error: err_res.body, loading: false });
            console.error('error -->>', e);
        });

        this.wavesurfer!.on('play', function () {
            console.info('play...');
        });
        this.wavesurfer!.on('pause', () => {
            console.info('pause...');
        });

        this.wavesurfer!.on('finish', () => {
            console.log('finish...');
            // this.gotoBegining();
            // this.wavesurfer!.pause();
            // this.pause();
            // this.after_pause();
            this.stop();
        });


        this.wavesurfer!.on('loading', showProgress);
        this.wavesurfer!.on('destroy', hideProgress);

        this.wavesurfer!.on('audioprocess', () => { this.updateTimer(); });
        this.wavesurfer!.on('seek', () => { this.updateTimer(); });

        this.updateTimer(0);

        this.load_file();
    }

    private gotoBegining() {
        this.wavesurfer!.setCurrentTime(0);
    }

    // private togglePlay() {
    //     this.wavesurfer!.playPause();
    //     this.setState({ isPlaying: this.wavesurfer!.isPlaying() });
    // };
    private stop() {
        this.wavesurfer!.stop();
        this.after_pause();
    };
    private play() {
        this.wavesurfer!.play();
        this.after_play();
    };
    private pause() {
        this.wavesurfer!.pause();
        this.after_pause();
    };
    private after_play() {
        this.setState({ isPlaying: true });
    }
    private after_pause() {
        this.setState({ isPlaying: false });
    }

    private showLoader() {
        this.setState({ loading: true });
    }
    private hideLoader() {
        this.setState({ loading: false });
    }

    private load_file() {
        // this.showLoader();
        this.setState({ loading: true, error: undefined });
        // try {
        // console.log(this.wavesurfer!.cancelAjax);
        // console.log(this.wavesurfer!.load);
        this.wavesurfer && this.wavesurfer!.cancelAjax();
        // this.wavesurfer!.load(this.state.active_item, undefined, 'auto', 560000);
        this.wavesurfer && this.wavesurfer!.load(this.state.active_item);
        // } catch (e) { console.log('load_file', e); }
    }

    private retry_loading() {
        this.load_file();
    }

    private setCurrentSong(url: string, scrollIntoView = false) {
        // this.toggleLoading();
        this.setState({ loading: true, active_item: url, isPlaying: false }, () => {
            // try {
            this.load_file();
            // } catch (e) { console.log('setCurrentSong', e) }

            if (scrollIntoView) {
                const active_audio_item = document.querySelector('.audio-item.active');
                if (active_audio_item) {
                    active_audio_item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
        // this.wavesurfer!.load(url);
        // console.log(this.wavesurfer!.getCurrentTime());
        this.updateTimer(0);
    }
    private _current_time = '';
    private updateTimer(currentTime?: number) {
        let formattedTime = '00:00:00';
        if (currentTime || currentTime === 0) {
            formattedTime = this.secondsToTimeFormatter(currentTime);
        } else {
            formattedTime = this.secondsToTimeFormatter(this.wavesurfer!.getCurrentTime());
        }
        if (this._current_time === formattedTime) {
            return;
        }
        this._current_time = formattedTime;
        document.getElementById('time-current')!.innerText = formattedTime;
        // console.log(formattedTime);
    }
    private secondsToTimeFormatter(seconds: number) {
        seconds = Math.floor(seconds);
        let h: number | string = Math.floor(seconds / 3600);
        let m: number | string = Math.floor((seconds - (h * 3600)) / 60);
        let s: number | string = seconds - (h * 3600) - (m * 60);

        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        return h + ':' + m + ':' + s;
    }

    private stepBackward() {
        const active_item_index = this.state.playlist.indexOf(this.state.active_item);
        let new_index = -1;
        if (active_item_index > -1 && active_item_index - 1 >= 0) {
            new_index = active_item_index - 1;
        }
        if (new_index < 0) return;
        this.setCurrentSong(this.state.playlist[new_index], true);
    }
    private stepForward() {
        const active_item_index = this.state.playlist.indexOf(this.state.active_item);
        let new_index = 0;
        if (active_item_index > -1 && active_item_index + 1 <= this.state.playlist.length - 1) {
            new_index = active_item_index + 1;
        }
        // if (active_item_index === new_index) return;
        // if (new_index === 0 && loop === false) return;
        if (new_index === 0) return;
        this.setCurrentSong(this.state.playlist[new_index], true);
    }
    private backward_forward_step = 10;
    private backward() {
        const currentTime = this.wavesurfer!.getCurrentTime();
        let seekTo = 0;
        if (currentTime - this.backward_forward_step > 0) {
            seekTo = currentTime - this.backward_forward_step;
        }
        this.wavesurfer!.setCurrentTime(seekTo);
    }
    private forward() {
        const totalTime = this.wavesurfer!.getDuration();
        const currentTime = this.wavesurfer!.getCurrentTime();
        // const remainingTime = totalTime - currentTime;
        if (currentTime + this.backward_forward_step >= totalTime && this.wavesurfer!.isPlaying) {
            this.stop();
        }

        this.wavesurfer!.setCurrentTime(currentTime + this.backward_forward_step);
    }

    private setPlayerVolume(vol: number) {
        this.wavesurfer!.setVolume(vol);
    }

    private playlist_render() {
        return (
            <>
                <div className="row-- playlist mb-2 py-2">
                    {/* <div className="col-12"> */}
                    <div className="audio-list list-group list-group-flush">
                        {this.state.playlist.map((url, url_index) => {
                            return (
                                <Fragment key={url_index}>
                                    <div className={
                                        "audio-item list-group-item "
                                        + (this.state.active_item === url ? 'active' : '')
                                        + ' '
                                        + (this.state.loading ? 'disabled' : '')
                                    }
                                        onClick={() => this.setCurrentSong(url)}
                                    // disabled={this.state.loading}
                                    >
                                        {
                                            this.state.active_item === url ?
                                                <i className="fa fa-music mr-2"></i> : ''
                                        }
                                        {url}
                                    </div>
                                </Fragment>
                            )
                        })}
                    </div>
                    {/* </div> */}
                </div>
            </>
        )
    }

    private progress_bar_render() {
        return (
            <>
                <div className="progress mt-n3 mx-2" id="progress-bar" dir="ltr">
                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-system">0%</div>
                </div>
            </>
        )
    }

    private player_render() {
        return (
            <>
                <div className="row player">
                    <div className="col-12 mb-2">
                        <ContentLoader gutterClassName="gutter-15" colorClassName="system" show={this.state.loading}></ContentLoader>
                        <div className={this.state.error ? '' : 'd-none'}>
                            {this.state.error}
                            <div onClick={() => this.retry_loading()}>{Localization.retry}</div>
                        </div>

                        <div className={`waveform-container ` + (this.state.isPlaying ? '' : 'is-pause')}>
                            <div className="waveform-wrapper">
                                <div id="waveform" className="waveform"></div>
                            </div>
                            <div id="wave-timeline" className={`wave-timeline ` + (this.state.loading ? 'd-none' : '')} ></div>
                        </div>
                        {/* {this.progress_bar_render()} */}
                    </div>

                    <div className="col-12">
                        <div className="current-time text-system text-center" id="time-current"></div>
                    </div>
                </div>
            </>
        )
    }

    private audio_body_render() {
        return (
            <>
                <div className="audio-body py-2">
                    {this.playlist_render()}
                    {this.player_render()}
                </div>
            </>
        )
    }

    private onSliderChange(value: number) {

        // this.setState({ volume: { val: value, mute: value === 0 ? true : false } }, () => {
        this.setState({ volume: { val: value, mute: false } }, () => {
            this.wavesurfer!.setMute(false);
            this.setPlayerVolume(value);
            // this.wavesurfer!.setMute(false);

            // console.log('cas', this.wavesurfer!.getMute(), this.wavesurfer!.getVolume(), value);
        });
        // console.log('cas 2', this.wavesurfer!.getMute(), this.wavesurfer!.getVolume(), value);

    }

    volume_icon_render(): string {
        let vol_class = 'fa-volume-off';
        if (this.state.volume.val >= .5) {
            vol_class = 'fa-volume-up';
        } else if (this.state.volume.val < .5 && this.state.volume.val !== 0) {
            vol_class = 'fa-volume-down';
        }
        // return 'fa-volume-off';
        // let mute_class = '';
        if (this.state.volume.mute) {
            vol_class = 'fa-volume-off is-muted';
            // mute_class = 'text-danger';
        }

        return vol_class; // + ' ' + mute_class;
    }

    private audio_volume_render() {
        return (
            <>
                {this.slider_render()}
                <div className="toggle-mute cursor-pointer" onClick={() => this.toggleMute()}>
                    <i className={"fa " + this.volume_icon_render()}></i>
                </div>
            </>
        )
    }
    toggleMute() {
        this.wavesurfer!.toggleMute();
        this.setState({ volume: { ...this.state.volume, mute: this.wavesurfer!.getMute() } });
    }
    private slider_render() {
        return (
            <>
                <div className="rc-slider-wrapper mb-3--">
                    <RcSlider
                        className="rc-slider-system"
                        min={0}
                        max={1}
                        vertical={!this.is_small_media}
                        defaultValue={this.state.volume.val}
                        onChange={(v) => this.onSliderChange(v)}
                        value={this.state.volume.val}
                        step={.01}
                        disabled={this.state.loading}
                    />
                </div>
            </>
        )
    }

    private audio_footer_render() {
        return (
            <>
                <div className="audio-footer">
                    <div className="row">
                        <div className={
                            "audio-control col-12 mb-3-- py-3 d-flex justify-content-center "
                            // + (this.state.loading ? 'opacity-5sss' : '')
                        } dir="ltr">
                            <button className="btn action-btn mx-2 btn-outline-system"
                                onClick={() => this.stepBackward()} disabled={this.state.loading}>
                                <i className="fa fa-step-backward"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-system"
                                onClick={() => this.backward()} disabled={this.state.loading}>
                                <i className="fa fa-backward"></i>
                            </button>

                            <button className={"btn action-btn mx-2 btn-outline-system " + (this.state.isPlaying ? 'd-none' : '')}
                                onClick={() => this.play()} disabled={this.state.loading}>
                                <i className="fa fa-play"></i>
                            </button>
                            <button className={"btn action-btn mx-2 btn-outline-system " + (this.state.isPlaying ? '' : 'd-none')}
                                onClick={() => this.pause()} disabled={this.state.loading}>
                                <i className="fa fa-pause"></i>
                            </button>

                            <button className="btn action-btn mx-2 btn-outline-system"
                                onClick={() => this.forward()} disabled={this.state.loading}>
                                <i className="fa fa-forward"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-system"
                                onClick={() => this.stepForward()} disabled={this.state.loading}>
                                <i className="fa fa-step-forward"></i>
                            </button>

                            <div className={"volume-dd-container " + (this.is_small_media ? 'is-small-media' : '')}>
                                <Dropdown className="volume-dd " drop={this.is_small_media ? 'left' : 'up'}>
                                    <Dropdown.Toggle
                                        as="button"
                                        id="dropdown-volume-btn"
                                        className="btn action-btn mx-2-- action-btn-volume"
                                        disabled={this.state.loading}
                                    >
                                        <i className={"fa " + this.volume_icon_render()}></i>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="border-0 rounded-0-- shadow2">
                                        {this.audio_volume_render()}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }

    private goBack() {
        if (this.props.history.length > 1) { this.props.history.goBack(); }
        else { this.props.history.push(`/dashboard`); }
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-12 px-0">
                        <div className="reader-audio-wrapper mt-3-- mb-5--">
                            {this.audio_header_render()}
                            {this.audio_body_render()}
                            {this.audio_footer_render()}
                        </div>
                    </div>
                </div>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        );
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
    };
};

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        // token: state.token,
        network_status: state.network_status,
        library: state.library,
    };
};

export const ReaderAudio = connect(state2props, dispatch2props)(ReaderAudioComponent);
