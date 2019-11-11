import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
import { IBook } from "../../../model/model.book";
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
import { IBookPosIndicator } from "../../../webworker/reader-engine/MsdBook";
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

interface IAudioSourceObj {
    timing: { from: number, to: number };
    source: AudioBufferSourceNode | undefined;
}

interface IProps {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    history: History;
    // token: IToken;
    network_status: NETWORK_STATUS;
    onUserLoggedIn: (user: IUser) => void;
    match: any;
    // library: ILibrary_schema;
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
        'chapter1',
        'chapter2',
        'chapter3',
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

        this.updateUserCurrentBook_client();
        this.updateUserCurrentBook_server();
        this.generateReader();
    }
    componentWillUnmount() {
        // this._componentWillUnmount = true;
        // this.wavesurfer!.xhr
        console.log('wavesurfer!.destroy');
        try {
            this.destroyAudioContext();
            if (this.wavesurfer) {
                // this.wavesurfer.cancelAjax();
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
        this.initAudio();
    }

    private _bookInstance!: AudioBookGenerator;
    private async createBook() {
        const bookFile = appLocalStorage.findBookMainFileById(this.book_id); // find book chapter
        if (!bookFile) {
            this.setState({ loading: false });
            this.bookFileNotFound_notify();
            return;
        }

        try {
            this._bookInstance = await ReaderUtility.createAudioBook(this.book_id, bookFile); // pass book chapter
        } catch (e) {
            console.error(e);
            this.setState({ loading: false });
            this.readerError_notify();
        }
    }

    private initAudio() {
        debugger;
        if (this.wavesurfer) {
            this.wavesurfer.destroy();
        }

        // const fileTotalDuration = this._bookInstance.getTotalDuration();
        const allAtoms_pos = this._bookInstance.getAllAtoms_pos();
        let trackTotalDuration = 0;
        allAtoms_pos.forEach(atom => {
            trackTotalDuration += this._bookInstance.getAtomDuration(atom);
        });

        const wsParams: any = { // WaveSurfer.WaveSurferParams = {
            // const obj: WaveSurfer.WaveSurferParams = {
            container: '#waveform',
            waveColor: '#01aaa480', //'#A8DBA8',
            progressColor: '#01aaa4', // '#3B8686',
            // backend: 'MediaElement',
            backend: 'WebAudio',
            // height: 208,
            height: 320,
            // barWidth: 1,
            barGap: 0,
            // normalize: true,
            cursorWidth: 1,
            cursorColor: '#015e5b', // '#4a74a5',

            duration: trackTotalDuration / 1000,
            // closeAudioContext: false,
            // rtl: true,
            plugins: [
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
                    formatTimeCallback: (cursorTime: number) => {
                        return [cursorTime].map(time =>
                            [
                                Math.floor((time % 3600) / 60), // minutes
                                ('00' + Math.floor(time % 60)).slice(-2), // seconds
                                // ('000' + Math.floor((time % 1) * 1000)).slice(-3) // milliseconds
                            ].join(':')
                        );
                    }
                })
            ]
        };

        this.wavesurfer = WaveSurfer.create(wsParams);
        // this.wavesurfer!.backend.setPeaks([], trackTotalDuration / 1000);
        const peaks = Array.from({ length: Math.ceil(trackTotalDuration / 1000) }, (v, k) => 1);
        this.wavesurfer!.backend.setPeaks(peaks, trackTotalDuration / 1000);
        // this.wavesurfer!.drawBuffer();

        this.wavesurfer!.on('ready', () => {
            // this.wavesurfer.play();
            console.log('ready...');
            // hideProgress();
            // this.toggleLoading();
            this.hideLoader();
        });
        this.wavesurfer!.on('waveform-ready', () => {
            console.log('waveform-ready...');
            // hideProgress();
            this.hideLoader();
        });
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
            // this.stop();
            // this.destroy_srcObj(true);
            // this.destroy_srcObj(false);
            // this._audioCtx_currentTime_next = undefined;
            this.reset_srcObj();
            this.pause();
        });
        this.wavesurfer!.on('loading', () => { console.log('loadingggg'); });
        this.wavesurfer!.on('destroy', () => { console.log('destroyyyyyy'); });
        this.wavesurfer!.on('audioprocess', () => { this.updateTimer(); });
        this.wavesurfer!.on('seek', () => { this.updateTimer(undefined, true); });

        const audioBuffer_min = this.getaudioBuffer(44100, 1, [new Float32Array(1)]); // srate
        this.wavesurfer!.loadDecodedBuffer(audioBuffer_min);

        // this.getGainNode();

        //todo: book progreess position;
        let bookReadedTime = 47;
        this.setWavesurferTime(bookReadedTime);
        this.updateTimer(bookReadedTime);
    }

    // todo: remove sampleRate.
    private _audioContextObj: { audioContext: AudioContext | undefined, sampleRate: number | undefined } | undefined;
    private getAudioContext(sampleRate?: number): AudioContext {
        if (this._audioContextObj && (sampleRate ? this._audioContextObj.sampleRate === sampleRate : true)) {
            return this._audioContextObj!.audioContext!;
        }
        let audioCtx: AudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)(
            // { sampleRate: sampleRate }
        );
        audioCtx.suspend();
        this._audioContextObj = { audioContext: audioCtx, sampleRate };
        return this._audioContextObj!.audioContext!;
    }
    private destroyAudioContext() {
        if (this._audioContextObj && this._audioContextObj.audioContext) {
            this._audioContextObj.audioContext.close();
        }
        this._audioContextObj = undefined;
        this._gainNode = undefined;
    }

    private getaudioBuffer(sampleRate: number, channel: number, sourceList: Float32Array[]): AudioBuffer {
        const ax = this.getAudioContext(sampleRate);

        if (!sampleRate || !channel || !sourceList || !sourceList[0] || !sourceList[0].length) { debugger; }

        let audioBuffer = ax.createBuffer(channel, sourceList[0].length, sampleRate);
        for (let i = 0; i < channel; i++) {
            // audioBuffer.copyToChannel(sourceList[i], i, 0);
            if (audioBuffer.copyToChannel) {
                audioBuffer.copyToChannel(sourceList[i], i, 0);

            } else {
                let buffer = audioBuffer.getChannelData(i);
                for (let j = 0; j < buffer.length; j++) {
                    buffer[j] = sourceList[i][j];
                }
            }
        }
        return audioBuffer;
    }

    private _gainNode: GainNode | undefined;
    private getGainNode(sampleRate?: number): GainNode {
        if (this._gainNode) return this._gainNode;
        const ax = this.getAudioContext(sampleRate);
        this._gainNode = ax.createGain();
        this._gainNode.connect(ax.destination);
        return this._gainNode;
    }
    private updateGainNode(vol: number) {
        if (!this._gainNode) return;
        this._gainNode!.gain.value = vol;
        this._gainNode!.gain.setValueAtTime(vol, this.getAudioContext().currentTime);
    }

    private processCurrentTime(currentTime: number, seek: boolean): void {
        console.log('processCurrentTimeeeee: currentTime, seek: ', currentTime, seek);

        const fileAtoms_duration = this._bookInstance.getFileAtoms_duration();
        let currentAtom_index = undefined;

        for (let i = 0; i < fileAtoms_duration.length; i++) {
            const atomFromTo = fileAtoms_duration[i];
            if (atomFromTo.from / 1000 <= currentTime && atomFromTo.to / 1000 >= currentTime) {
                currentAtom_index = i;
                break;
            }
        }

        let currentAtomPos: IBookPosIndicator | undefined;
        if (currentAtom_index || currentAtom_index === 0) {
            currentAtomPos = this._bookInstance.getAllAtoms_pos()[currentAtom_index];

            this.bindVoiceToAudioContext(
                currentAtomPos,
                fileAtoms_duration[currentAtom_index],
                currentTime,
                currentAtom_index,
                true,
                0,
                seek,
                false
            );
        }
    }

    private _audioSourceList: Array<AudioBufferSourceNode | undefined> = [];
    private reset_srcObj() {
        // console.error('reset_srcObj');
        this.destroy_srcObj(true);
        this.destroy_srcObj(false);
        this._audioCtx_currentTime_next = undefined;
        // this.destroyAudioContext();
        // todo error in safari invalid Object
        this._audioSourceList.forEach(a_s => {
            try {
                a_s && a_s.stop();
                a_s && a_s.disconnect();
            } catch (e) {
                console.log('while this._audioSourceList', e);
            }
        });
        this._audioSourceList = []; // todo : add all source here
    }
    private destroy_srcObj(mainSrc: boolean) {
        if (mainSrc) {
            console.log('destroy_srcObj main', this._mainSource_obj && this._mainSource_obj.timing, this._mainSource_obj &&
                this._mainSource_obj.source);

            if (this._mainSource_obj && this._mainSource_obj.source) {
                this._mainSource_obj.source.stop();
                this._mainSource_obj.source.disconnect();
            }
            this._mainSource_obj = undefined;

        } else {
            console.log('destroy_srcObj helper', this._helpSource_obj && this._helpSource_obj.timing, this._helpSource_obj &&
                this._helpSource_obj.source);

            if (this._helpSource_obj && this._helpSource_obj.source) {
                this._helpSource_obj.source.stop();
                this._helpSource_obj.source.disconnect();
            }
            this._helpSource_obj = undefined;
        }
    }
    private _loadedAtomPos: IBookPosIndicator | undefined;
    private _mainSource_obj: IAudioSourceObj | undefined;
    private _helpSource_obj: IAudioSourceObj | undefined;
    private _audioCtx_currentTime_next: number | undefined;
    private async bindVoiceToAudioContext(
        atomPos: IBookPosIndicator,
        atomFromTo: { from: number, to: number },
        fromTime: number,
        atomPos_index: number,
        pauseUntilBind: boolean,
        offset: number,
        seek: boolean,
        helperBinding: boolean,
    ): Promise<void> {

        const audioCtx_currentTime = this.getAudioContext().currentTime;

        await CmpUtility.waitOnMe(0);

        const loadMoreTimer = 6;

        if (seek) {
            // this.destroy_srcObj(true);
            // this.destroy_srcObj(false);
            // this._audioCtx_currentTime_next = undefined;
            this.reset_srcObj();
        }

        if (this._mainSource_obj && !helperBinding) {
            console.log('exist:', fromTime, this._mainSource_obj);
            if (fromTime >= this._mainSource_obj.timing.to) {
                if (this._helpSource_obj) {
                    console.log(
                        'mainSource: ',
                        this._mainSource_obj && this._mainSource_obj.timing,
                        '<-- **switch** -->  helpSource: ',
                        this._helpSource_obj && this._helpSource_obj.timing,
                    );
                    this._mainSource_obj = this._helpSource_obj;
                    this._helpSource_obj = undefined;
                    return;
                } else {
                    console.error('why _helpSource_obj not exist??');
                    this._audioCtx_currentTime_next = undefined;
                }

            } else if (fromTime + loadMoreTimer >= this._mainSource_obj.timing.to) {
                if (this._helpSource_obj) { // && ...
                    return;
                }
                if ((fromTime + loadMoreTimer) * 1000 >= atomFromTo.to) {
                    const allAtoms_pos = this._bookInstance.getAllAtoms_pos();
                    if (allAtoms_pos.length - 1 >= atomPos_index + 1) {
                        const fileAtoms_duration = this._bookInstance.getFileAtoms_duration();
                        this.bindVoiceToAudioContext(
                            allAtoms_pos[atomPos_index + 1],
                            fileAtoms_duration[atomPos_index + 1],
                            this._mainSource_obj.timing.to,
                            atomPos_index + 1,
                            false,
                            loadMoreTimer,
                            false,
                            true
                        );
                    }
                } else {
                    this.bindVoiceToAudioContext(
                        atomPos,
                        atomFromTo,
                        this._mainSource_obj.timing.to,
                        atomPos_index,
                        false,
                        loadMoreTimer,
                        false,
                        true
                    );
                }
                return;
            } else {
                return;
            }
        }

        let newSource: IAudioSourceObj | undefined = { timing: { from: fromTime, to: fromTime + 10 }, source: undefined };

        const isPlaying = this.state.isPlaying;
        if (pauseUntilBind) { if (isPlaying) { this.pause(); } }

        if (this._loadedAtomPos !== atomPos) {
            this._loadedAtomPos = atomPos;
            console.time('____________________________________________loadVoiceAtom');
            this._bookInstance.loadVoiceAtom(atomPos);
            console.timeEnd('____________________________________________loadVoiceAtom');
        }

        let fromTimeInAtom = Math.ceil(fromTime * 1000 - atomFromTo.from);
        if (fromTimeInAtom < 0) {
            console.warn('fromTimeInAtom is less than 0 !!: fromTimeInAtom changed to 0', fromTimeInAtom);
            fromTimeInAtom = 0;
        }
        const atomActualDuration = this._bookInstance.getLoadedVoiceAtomDuration();

        const sampleRate = this._bookInstance.getLoadedVoiceAtomSampleRate();
        const channels = this._bookInstance.getLoadedVoiceAtomChannels();
        let atom_10_sec: Float32Array[] | undefined;
        if (fromTimeInAtom < atomActualDuration) {
            console.log('***getLoadedVoiceAtom10Second:', fromTimeInAtom, atomActualDuration, atomFromTo);
            atom_10_sec = this._bookInstance.getLoadedVoiceAtom10Second(fromTimeInAtom);
        }

        let createAbleSource = true;
        if (!atom_10_sec || !atom_10_sec[0].length) {
            console.error(
                '!!!! atom_10_sec[0].length --> createAbleSource = false',
                atom_10_sec,
                atomFromTo,
                fromTime * 1000 - atomFromTo.from
            );
            createAbleSource = false;
        }

        if (createAbleSource) {
            // const voiceTime = ((fromTime + 10) * 1000 <= atomFromTo.to) ? 10 : ((atomFromTo.to - (fromTime * 1000)) / 1000);
            const voiceTime = atom_10_sec![0].length / sampleRate;
            console.log(
                'active atom detail:',
                atom_10_sec,
                sampleRate,
                atom_10_sec![0].length / sampleRate
            );
            newSource.timing.to = newSource.timing.from + voiceTime;

            const audioCtx = this.getAudioContext(sampleRate);
            const source = audioCtx.createBufferSource();
            source.buffer = this.getaudioBuffer(sampleRate, channels, atom_10_sec!);
            // source.connect(audioCtx.destination);

            const gainNode = this.getGainNode(); // sampleRate
            source.connect(gainNode);
            // gainNode.connect(audioCtx.destination);

            // source.start(audioCtx_currentTime + offset); // audioCtx.currentTime
            const startTime = this._audioCtx_currentTime_next ? this._audioCtx_currentTime_next : audioCtx_currentTime + offset;
            source.start(startTime);
            // safari bug: start automaticly on cmpDidMount.
            if (!isPlaying && pauseUntilBind) {
                try {
                    if (audioCtx.state === 'running') this.pause();
                } catch (e) {
                    this.pause();
                }
            }
            //
            console.warn('source should start at : ', newSource.timing.from);
            this._audioCtx_currentTime_next = startTime + voiceTime;
            console.warn('source should end at : ', newSource.timing.to);
            // source.stop(audioCtx_currentTime + offset + voiceTime); // audioCtx.currentTime
            source.onended = (ev: Event) => {
                console.log(
                    '------source.onended----',
                    fromTime,
                    fromTime + voiceTime,
                    voiceTime,
                );
                // this.pause();
            };

            newSource.source = source;
            this._audioSourceList.push(source);

            if (voiceTime < 10) {
                console.warn('voiceTime < 10 --> load next atom', voiceTime);
                const allAtoms_pos = this._bookInstance.getAllAtoms_pos();
                if (allAtoms_pos.length - 1 >= atomPos_index + 1) {

                    const fileAtoms_duration = this._bookInstance.getFileAtoms_duration();
                    this.bindVoiceToAudioContext(
                        allAtoms_pos[atomPos_index + 1],
                        fileAtoms_duration[atomPos_index + 1],
                        fromTime + voiceTime,
                        atomPos_index + 1,
                        false,
                        voiceTime,
                        false,
                        true
                    );
                }
            }

        } else {
            newSource = undefined;
        }

        if (helperBinding) {
            // this.destroy_srcObj(false);
            this._helpSource_obj = newSource;

        } else {
            // this.destroy_srcObj(true);
            this._mainSource_obj = newSource;
        }

        if (isPlaying && this.state.isPlaying === false) {
            this.play();
        }
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
        this.getAudioContext().suspend();
        this.after_pause();
    };
    private play() {
        this.wavesurfer!.play();
        this.getAudioContext().resume();
        this.after_play();
    };
    private pause() {
        this.wavesurfer!.pause();
        this.getAudioContext().suspend();
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
        // this.setState({ loading: true, error: undefined });
        // this.wavesurfer && this.wavesurfer!.cancelAjax();
        // this.wavesurfer && this.wavesurfer!.load(this.state.active_item);
    }

    // private retry_loading() {
    //     this.load_file();
    // }

    private setCurrentSong(url: string, scrollIntoView = false) {
        if (555) return;
        // this.toggleLoading();
        this.setState({ loading: true, active_item: url, isPlaying: false }, () => {
            this.load_file();

            if (scrollIntoView) {
                const active_audio_item = document.querySelector('.audio-item.active');
                if (active_audio_item) {
                    active_audio_item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
        this.updateTimer(0);
    }
    private _current_time = '';
    private updateTimer(currentTime?: number, seek = false) {
        if (!this.wavesurfer) return;

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
        this.processCurrentTime((currentTime || currentTime === 0) ? currentTime : this.wavesurfer!.getCurrentTime(), seek);
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
        if (!this.wavesurfer) return;
        const currentTime = this.wavesurfer!.getCurrentTime();
        let seekTo = 0;
        if (currentTime - this.backward_forward_step > 0) {
            seekTo = currentTime - this.backward_forward_step;
        }
        this.wavesurfer!.setCurrentTime(seekTo);
    }
    private forward() {
        if (!this.wavesurfer) return;
        const totalTime = this.wavesurfer!.getDuration();
        const currentTime = this.wavesurfer!.getCurrentTime();
        // const remainingTime = totalTime - currentTime;
        if (currentTime + this.backward_forward_step >= totalTime && this.wavesurfer!.isPlaying) {
            this.stop();
        }

        this.wavesurfer!.setCurrentTime(currentTime + this.backward_forward_step);
    }
    private setWavesurferTime(seconds: number) {
        if (!this.wavesurfer) return;
        this.wavesurfer.setCurrentTime(seconds);
    }

    private setPlayerVolume(vol: number) {
        if (!this.wavesurfer) return;

        this.wavesurfer!.setVolume(vol);
        this.updateGainNode(vol);
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
                        {/* <div className={this.state.error ? '' : 'd-none'}>
                            {this.state.error}
                            <div onClick={() => this.retry_loading()}>{Localization.retry}</div>
                        </div> */}

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
        if (!this.wavesurfer) return;

        this.setState({ volume: { val: value, mute: false } }, () => {
            this.wavesurfer!.setMute(false);
            this.setPlayerVolume(value);
        });
    }

    volume_icon_render(): string {
        let vol_class = 'fa-volume-off';
        if (this.state.volume.val >= .5) {
            vol_class = 'fa-volume-up';
        } else if (this.state.volume.val < .5 && this.state.volume.val !== 0) {
            vol_class = 'fa-volume-down';
        }
        if (this.state.volume.mute) {
            vol_class = 'fa-volume-off is-muted';
        }
        return vol_class;
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
        if (!this.wavesurfer) return;

        this.wavesurfer!.toggleMute();
        const isMute = this.wavesurfer!.getMute();
        this.updateGainNode(isMute ? 0 : this.state.volume.val);
        this.setState({ volume: { ...this.state.volume, mute: isMute } });
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
                            <button className="btn action-btn mx-2 btn-outline-system--"
                                onClick={() => this.stepBackward()} disabled={this.state.loading}>
                                <i className="fa fa-step-backward text-system"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-system--"
                                onClick={() => this.backward()} disabled={this.state.loading}>
                                <i className="fa fa-backward text-system"></i>
                            </button>

                            <button className={"btn action-btn mx-2 btn-outline-system " + (this.state.isPlaying ? 'd-none' : '')}
                                onClick={() => this.play()} disabled={this.state.loading}>
                                <i className="fa fa-play"></i>
                            </button>
                            <button className={"btn action-btn mx-2 btn-outline-system " + (this.state.isPlaying ? '' : 'd-none')}
                                onClick={() => this.pause()} disabled={this.state.loading}>
                                <i className="fa fa-pause"></i>
                            </button>

                            <button className="btn action-btn mx-2 btn-outline-system--"
                                onClick={() => this.forward()} disabled={this.state.loading}>
                                <i className="fa fa-forward text-system"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-system--"
                                onClick={() => this.stepForward()} disabled={this.state.loading}>
                                <i className="fa fa-step-forward text-system"></i>
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
        // library: state.library,
    };
};

export const ReaderAudio = connect(state2props, dispatch2props)(ReaderAudioComponent);
