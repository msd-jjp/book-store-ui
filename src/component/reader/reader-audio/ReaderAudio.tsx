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
import { getLibraryItem/* , getBookFileId */ } from "../../library/libraryViewTemplate";
// import { CmpUtility } from "../../_base/CmpUtility";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { AudioBookGenerator, IChapterDetail } from "../../../webworker/reader-engine/AudioBookGenerator";
import { ReaderUtility, IEpubBook_chapters } from "../ReaderUtility";
import { IBookPosIndicator, IBookContent } from "../../../webworker/reader-engine/MsdBook";
import { FILE_STORAGE_KEY } from "../../../service/appLocalStorage/FileStorage";
import { IReaderEngine_schema } from "../../../redux/action/reader-engine/readerEngineAction";
import { Utility } from "../../../asset/script/utility";
import { IReader_schema } from "../../../redux/action/reader/readerAction";
import { action_update_reader } from "../../../redux/action/reader";
import { BookService } from "../../../service/service.book";
// import { Utility } from "../../../asset/script/utility";
// import { BookService } from "../../../service/service.book";
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

/* interface IAudioSourceObj {
    timing: { from: number, to: number };
    source: AudioBufferSourceNode | undefined;
} */

interface IProps {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    history: History;
    network_status: NETWORK_STATUS;
    onUserLoggedIn: (user: IUser) => void;
    match: any;
    reader_engine: IReaderEngine_schema;
    reader: IReader_schema;
    update_reader: (reader: IReader_schema) => any;
}

interface IState {
    book: IBook | undefined;
    loading: boolean;
    error: string | undefined;
    isPlaying: boolean;
    volume: {
        val: number;
        mute: boolean;
    };
}

class ReaderAudioComponent extends BaseComponent<IProps, IState> {
    private book_id: string = '';
    private isOriginalFile: 'false' | 'true' = 'false';

    state = {
        book: undefined,
        loading: false,
        error: undefined,
        isPlaying: false,
        volume: {
            val: this.props.reader.audio.volume || 1, // 1
            mute: this.props.reader.audio.mute || false, // false
        }
    };

    private _personService = new PersonService();

    private wavesurfer: WaveSurfer | undefined;
    private is_small_media = false;
    private _libraryItem: ILibrary | undefined;

    constructor(props: IProps) {
        super(props);

        this.book_id = this.props.match.params.bookId;
        this.isOriginalFile = this.props.match.params.isOriginalFile;
    }

    componentWillMount() {
        if (window.innerWidth < 500) {
            this.is_small_media = true;
        }
        if (this.book_id) {
            this._libraryItem = getLibraryItem(this.book_id);
        }
    }

    async componentDidMount() {
        // if (!this._libraryItem) {
        if ((this.isOriginalFile === 'true' && !this._libraryItem) || !this.book_id) {
            this.props.history.replace(`/dashboard`);
            return;
        }

        await this.updateUserCurrentBook_client();
        this.updateUserCurrentBook_server();
        this.generateReader();
    }
    componentWillUnmount() {
        // this._componentWillUnmount = true;
        // this.wavesurfer!.xhr
        // console.log('wavesurfer!.destroy');
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

    async updateUserCurrentBook_client() {
        let book;
        if (this._libraryItem) {
            book = this._libraryItem.book;
        } else {
            const _bookService = new BookService();
            const res = await _bookService.get(this.book_id, true).catch(e => { });
            if (res) book = res.data;
        }
        this.setState({ ...this.state, book: book });

        if (this.isOriginalFile !== 'true') return;

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
        /* if (this.props.logged_in_user!.person.current_book &&
            this.props.logged_in_user!.person.current_book.id === this.book_id) {
            return;
        } */
        if (this.isOriginalFile !== 'true') return;

        await this._personService.update(
            { current_book_id: this.book_id },
            this.props.logged_in_user!.person.id
        ).catch(e => { });
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    getBookTitle(): string {
        const book: IBook | undefined = this.state.book;
        if (book === undefined) return '';
        return book!.title;
    }

    bookFileNotFound_notify() {
        this.goBack();
        setTimeout(() => {
            const notifyBody: string = Localization.msg.ui.book_file_not_found_download_it;
            const config: ToastOptions = { autoClose: Setup.notify.timeout.warning };
            toast.warn(notifyBody, this.getNotifyConfig(config));
        }, 300);
    }
    readerError_notify() {
        this.goBack();
        setTimeout(() => {
            const notifyBody: string = Localization.msg.ui.reader_audio_error_occurred;
            const config: ToastOptions = { autoClose: Setup.notify.timeout.warning };
            toast.error(notifyBody, this.getNotifyConfig(config));
        }, 300);
    }

    private async generateReader() {
        if (this.props.reader_engine.status !== 'inited') {
            this.goBack();
            setTimeout(() => { this.readerEngineNotify(); }, 300);
            return;
        }
        await this.createBook();
        if (!this._bookInstance) return;
        this.initAudio();
    }

    private _bookInstance!: AudioBookGenerator;
    private async createBook() {
        this.setState({ loading: true });
        // debugger;
        const collectionName = this.isOriginalFile === 'true' ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE;
        const bookFile = await appLocalStorage.getFileById(collectionName, this.book_id);

        if (!bookFile) {
            this.setState({ loading: false });
            this.bookFileNotFound_notify();
            return;
        }

        try {
            this._bookInstance = await ReaderUtility.createAudioBook(this.book_id, bookFile, this.isOriginalFile === 'true');
        } catch (e) {
            console.error(e);
            this.setState({ loading: false });
            this.readerError_notify();
        }
    }

    private _createBookChapters: IEpubBook_chapters | undefined;
    private async createBookChapters() {
        const bookContent: IBookContent[] = await this._bookInstance.getAllChapters();
        this._createBookChapters = ReaderUtility.createEpubBook_chapters(this.book_id, bookContent);
    }

    private async initAudio() {
        await this.createBookChapters();

        if (this.wavesurfer) {
            this.wavesurfer.destroy();
        }

        const wsParams: any = { // WaveSurfer.WaveSurferParams = {
            // const obj: WaveSurfer.WaveSurferParams = {
            container: '#waveform',
            waveColor: '#01aaa480', //'#A8DBA8',
            progressColor: '#01aaa4', // '#3B8686',
            // backend: 'MediaElement',
            backend: 'WebAudio',
            // height: 208,
            height: 160, // 320
            // barWidth: 1,
            barGap: 0,
            // normalize: true,
            cursorWidth: 1,
            cursorColor: '#015e5b', // '#4a74a5',

            // duration: trackTotalDuration / 1000,
            closeAudioContext: true, //?
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
        /* const peaks = Array.from({ length: Math.ceil(trackTotalDuration / 1000) }, (v, k) => 1);
        this.wavesurfer!.backend.setPeaks(peaks, trackTotalDuration / 1000); */
        // this.wavesurfer!.drawBuffer();

        this.wavesurfer!.on('ready', () => {
            // this.wavesurfer.play();
            // console.log('ready...');
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
            // console.info('play...');
        });
        this.wavesurfer!.on('pause', () => {
            // console.info('pause...');
        });
        this.wavesurfer!.on('finish', () => {
            // console.log('finish...');
            /* this._b_reset_binding();
            this.pause(); */
            this.stepForward(true);
        });
        this.wavesurfer!.on('loading', () => { console.log('loadingggg'); });
        this.wavesurfer!.on('destroy', () => { console.log('destroyyyyyy'); });
        this.wavesurfer!.on('audioprocess', () => { this.updateTimer(); });
        this.wavesurfer!.on('seek', () => { this.updateTimer(undefined, true); });

        /* const audioBuffer_min = this.getaudioBuffer(44100, 1, [new Float32Array(1)]); // srate
        this.wavesurfer!.loadDecodedBuffer(audioBuffer_min); */


        //todo: book progreess position;
        // let bookReadedTime = 0; // 0, 47, 200
        // this.setWavesurferTime(bookReadedTime);
        // this.updateTimer(bookReadedTime);
        this.loadChapter(undefined, 0);

    }

    private _audioContext: AudioContext | undefined;
    private getAudioContext(): AudioContext {
        if (this._audioContext) return this._audioContext;
        const audioCtx: AudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        audioCtx.suspend();
        this._audioContext = audioCtx;
        return this._audioContext;
    }
    private destroyAudioContext() {
        if (this._audioContext) {
            this._audioContext.close();
        }
        this._audioContext = undefined;
        this._gainNode = undefined;
    }

    private getaudioBuffer(sampleRate: number, channel: number, sourceList: Float32Array[]): AudioBuffer {
        const ax = this.getAudioContext();

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
    private getGainNode(): GainNode {
        if (this._gainNode) return this._gainNode;
        const ax = this.getAudioContext();
        this._gainNode = ax.createGain();
        this._gainNode.connect(ax.destination);

        this.updateGainNode(this.state.volume.mute ? 0 : this.state.volume.val);

        return this._gainNode;
    }
    private updateGainNode(vol: number) {
        if (!this._gainNode) return;
        this._gainNode!.gain.value = vol;
        this._gainNode!.gain.setValueAtTime(vol, this.getAudioContext().currentTime);
    }

    private async processCurrentTime(currentTime: number, seek: boolean): Promise<void> {
        // this.runAtom3();
        // return;
        try { this.bindGeneratedAudio(currentTime, seek, 0); } catch (e) { console.error('bindGeneratedAudio(curren...', e); }
    }



    /* private runnig = false;
    private async runAtom3() {
        if (this.runnig) return;
        this.runnig = true;

        console.log('runAtom');
        await this._bookInstance.loadVoiceAtom({ group: 0, atom: 2 });

        for (let i = 0; i < 60;) { // 200 -- 247560
            console.log(i);
            try {
                const voice = await this._bookInstance.getLoadedVoiceAtom10Second(i * 1000);

                const sampleRate = await this.getSampleRate();
                const channels = await this.getChannels();

                const audioCtx = this.getAudioContext();
                const source = audioCtx.createBufferSource();
                source.buffer = this.getaudioBuffer(sampleRate, channels, voice);
                const gainNode = this.getGainNode();
                source.connect(gainNode);

                source.start(i);

                console.log('voice[0].length / sampleRate', voice[0].length / sampleRate);

                i += 10;
            } catch (e) { console.log(e); break; }
        }
    } */


    private _b_progress_to: number | undefined;
    private _b_inProgress: boolean = false;
    private _b_seek_from: number | undefined;
    private _b_audioSourceList: Array<AudioBufferSourceNode> = [];
    private readonly _b_timeToBindNext = 6;
    private _b_audioCtx_time_next: number | undefined;
    /**
     * @param from number in second
     */
    private async bindGeneratedAudio(from: number, seek: boolean, delay: number) {
        from = from + this._b_loaded_chapter_from;

        const audioCtx_time = this.getAudioContext().currentTime;
        const wasPlaying = this.state.isPlaying;

        /* console.log(`
        start bindGeneratedAudio: from ${from}
        , seek: ${seek}'
        , delay: ${delay}
        , _b_inProgress: ${this._b_inProgress}
        , _b_progress_to: ${this._b_progress_to}
        , wasPlaying: ${wasPlaying}
        `); */


        if (seek) {
            this._b_reset_binding();
            this._b_seek_from = from;
        }

        if (this._b_inProgress) return;

        if (!seek && this._b_progress_to !== undefined && delay === 0) {
            // if (from + this._b_timeToBindNext <= this._b_progress_to) return;
            // else if (from = this._b_progress_to) { console.log(from); }
            // else
            if (from + this._b_timeToBindNext >= this._b_progress_to) {
                this.bindGeneratedAudio(this._b_progress_to - this._b_loaded_chapter_from, false, this._b_timeToBindNext);
                return;
            }
            else if (from < this._b_progress_to) return;
            else if (from >= this._b_progress_to) {
                // todo: remove all and get new like seek
                console.error('else if (from >= this._b_progress_to) {');
            }
        }

        if ((!this._b_progress_to || from >= this._b_progress_to) && delay === 0 && wasPlaying) {
            // console.log(`puase REQ** from : ${from} >= this._b_progress_to: ${this._b_progress_to}`);
            // if (wasPlaying) { this.pause(); }
            this.pause();
        }

        this._b_inProgress = true;

        // await Utility.waitOnMe(1000);

        let voice;
        try { voice = await this.getAudioDataByTime(from); } catch (e) {
            console.error('try getAudioByTime(from) failed', e);
        }

        if (this._b_seek_from || this._b_seek_from === 0) {
            if (!seek || this._b_seek_from !== from) {
                // todo play if wasPlaying?????
                return;
            }
            this._b_seek_from = undefined;
        }

        if (!voice || !voice.length) {
            this._b_inProgress = false;
            // todo play if wasPlaying?????
            return;
        } else {

        }

        const voiceTime = await this.connectSource(from, voice, audioCtx_time, delay);
        // console.warn('voiceTime', voiceTime);

        this._b_inProgress = false;

        /* console.log(`
        end bindGeneratedAudio: from ${from}
        , seek: ${seek}'
        , delay: ${delay}
        , _b_inProgress: ${this._b_inProgress}
        , _b_progress_to: ${this._b_progress_to}
        , wasPlaying: ${wasPlaying}
        , state.isPlaying: ${this.state.isPlaying}
        `); */

        if (wasPlaying && this.state.isPlaying === false) {
            this.play();
        }

        if (voiceTime <= this._b_timeToBindNext) {
            this.bindGeneratedAudio(this._b_progress_to! - this._b_loaded_chapter_from, false, voiceTime);
        }
    }

    private _sampleRate: number | undefined;
    private async getSampleRate(): Promise<number> {
        if (this._sampleRate === undefined)
            this._sampleRate = await this._bookInstance.getLoadedVoiceAtomSampleRate();
        return this._sampleRate;
    }
    private clearSampleRate(): void { this._sampleRate = undefined; }
    private _channels: number | undefined;
    private async getChannels(): Promise<number> {
        if (this._channels === undefined)
            this._channels = await this._bookInstance.getLoadedVoiceAtomChannels();
        return this._channels;
    }
    private clearChannels(): void { this._channels = undefined; }

    private _b_loaded_atom: IBookPosIndicator | undefined;
    /**
     * @param from number in second
     */
    private async getAudioDataByTime(from: number): Promise<Float32Array[] | undefined> {


        const atomDetail = await this._bookInstance.getAtomDetailByTime(from * 1000);

        if (!atomDetail) {
            return;
        }
        if (this._b_loaded_atom !== atomDetail.atom) {
            this._b_loaded_atom = atomDetail.atom;
            // console.warn('atomDetail', atomDetail);
            await this._bookInstance.loadVoiceAtom(atomDetail.atom);
        }
        let from_atom = Math.ceil(from * 1000 - atomDetail.fromTo.from);
        if (from_atom < 0) {
            console.warn('from_atom is less than 0 !!: from_atom changed to 0', from_atom, from, atomDetail);
            from_atom = 0;
        }
        const atomActualDuration = await this._bookInstance.getLoadedVoiceAtomDuration();
        // console.warn('atomActualDuration', atomActualDuration);

        let voice: Float32Array[] | undefined;
        if (from_atom < atomActualDuration) {
            voice = await this._bookInstance.getLoadedVoiceAtom10Second(from_atom);
        }
        if (!voice) {
            const atomDetail2 = await this._bookInstance.getAtomDetailByIndex(atomDetail.index + 1);
            if (atomDetail2) {
                this._b_loaded_atom = atomDetail2.atom;
                await this._bookInstance.loadVoiceAtom(atomDetail2.atom);
                voice = await this._bookInstance.getLoadedVoiceAtom10Second(0);
            }
        }
        else {
            /* if (atomActualDuration - from_atom < 11000 && atomActualDuration - from_atom > 10000) {
                const voiceTime = await this.getVoiceTime(voice);
                console.error('atomActualDuration,from_atom, voiceTime: ', atomActualDuration, from_atom, voiceTime);
                if (voiceTime === 10) {
                    console.log('voice', voice);
                    for (let i = 0; i < voice.length; i++) {
                        voice[i] = voice[i].slice(0, Math.floor(voice[0].length / 2));
                    }
                }
            } */
            /* const voiceTime = await this.getVoiceTime(voice);
            if (voiceTime <= this._b_timeToBindNext) {
                const atomDetail2 = await this._bookInstance.getAtomDetailByIndex(atomDetail.index + 1);
                if (atomDetail2) {
                    this._b_loaded_atom = atomDetail2.atom;
                    await this._bookInstance.loadVoiceAtom(atomDetail2.atom);
                    const newVoice = await this._bookInstance.getLoadedVoiceAtom10Second(0);
                    if (newVoice && newVoice.length) {
                        // voice = new Float32Array([...voice, ...newVoice] as any) as any;
                        // const dfvdg = new Float32Array([1,5]);

                        for (let i = 0; i < voice!.length; i++) {
                            voice[i] = Utility.float32Concat(voice[i], newVoice[i]);
                        }
                    }
                }
            } */
        }
        return voice;
    }

    private _b_reset_binding() {
        this._b_seek_from = undefined;
        this._b_audioSourceList.forEach(a_s => {
            try { if (a_s) { a_s.stop(); a_s.disconnect(); } }
            catch (e) { console.error('reset_srcObj  while this._audioSourceList', e); }
        });
        this._b_audioSourceList = [];
        this._b_inProgress = false;
        this._b_audioCtx_time_next = undefined;
        this._b_progress_to = undefined;
    }

    /* private async getVoiceTime(voice: Float32Array[]): Promise<number> {
        const sampleRate = await this.getSampleRate();
        const voiceTime = voice[0].length / sampleRate;
        return voiceTime;
    } */
    private async connectSource(from: number, voice: Float32Array[], audioCtx_time: number, delay: number): Promise<number> { // number,void
        const sampleRate = await this.getSampleRate();
        const channels = await this.getChannels();

        const voiceTime = voice[0].length / sampleRate;

        const audioCtx = this.getAudioContext();
        const source = audioCtx.createBufferSource();
        source.buffer = this.getaudioBuffer(sampleRate, channels, voice);
        const gainNode = this.getGainNode();
        source.connect(gainNode);
        const startTime = this._b_audioCtx_time_next ? this._b_audioCtx_time_next : audioCtx_time + delay;
        source.start(startTime);
        // safari bug: start automaticly on cmpDidMount.
        if (!this.state.isPlaying) {// wasPlaying
            try {
                if (audioCtx.state === 'running') this.pause();
            } catch (e) {
                this.pause();
            }
        }
        this._b_audioCtx_time_next = startTime + voiceTime;
        this._b_progress_to = from + voiceTime;

        this._b_audioSourceList.push(source);

        return voiceTime;
    }







    /* private gotoBegining() {
        this.wavesurfer!.setCurrentTime(0);
    } */

    // private togglePlay() {
    //     this.wavesurfer!.playPause();
    //     this.setState({ isPlaying: this.wavesurfer!.isPlaying() });
    // };
    /* private stop() {
        if (!this.wavesurfer) return;
        this.wavesurfer!.stop();
        this.getAudioContext().suspend();
        this.after_pause();
    }; */
    private play() {
        if (!this.wavesurfer) return;
        this.wavesurfer!.play();
        this.getAudioContext().resume();
        this.after_play();
    };
    private pause() { // force_pause = false --> if(force_pause):prevent play in bindGeneratedAudio;
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

    /* private showLoader() {
        this.setState({ loading: true });
    } */
    private hideLoader() {
        this.setState({ loading: false });
    }

    /* private load_file() {
        // this.setState({ loading: true, error: undefined });
        // this.wavesurfer && this.wavesurfer!.cancelAjax();
        // this.wavesurfer && this.wavesurfer!.load(this.state.active_item);
    } */

    private async updatePlaylistView() {
        await Utility.waitOnMe(100);
        const active_chapter = document.querySelector('.book-chapters .chapter-title.active');
        if (active_chapter) {
            active_chapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
        /* if (this._current_time === formattedTime) {
            return;
        } */
        if (this._current_time !== formattedTime) {
            this._current_time = formattedTime;
            document.getElementById('time-current')!.innerText = formattedTime;
            this.processCurrentTime((currentTime || currentTime === 0) ? currentTime : this.wavesurfer!.getCurrentTime(), seek);
        } else if (seek) {
            this.processCurrentTime((currentTime || currentTime === 0) ? currentTime : this.wavesurfer!.getCurrentTime(), seek);
        }

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
        if (!this._b_loaded_chapterDetail) return;
        if (this._b_loaded_chapterDetail.index === 0) return;
        this.loadChapter(undefined, this._b_loaded_chapterDetail.index - 1);
        this.updatePlaylistView();
    }
    private stepForward(onTrackFinished = false) {
        if (!this._b_loaded_chapterDetail) return;
        if (!this._createBookChapters) return;
        // debugger;
        if (this._b_loaded_chapterDetail.index + 1 >= this._createBookChapters.flat.length) {
            if (onTrackFinished) this.pause();
            return;
        }
        this.loadChapter(undefined, this._b_loaded_chapterDetail.index + 1);
        this.updatePlaylistView();
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
            // this.stop();
            this.stepForward();
        } else {
            this.wavesurfer!.setCurrentTime(currentTime + this.backward_forward_step);
        }
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


    private generateEl(eb_chapters: IEpubBook_chapters['tree']) {
        const isActive = this.isChapterActive(eb_chapters.id);
        return (
            <>
                {/* <ul> */}
                <li
                    className={
                        ((eb_chapters.clickable) ? 'clickable ' : 'disabled ')
                        // + (eb_chapters.content!.text ? '' : 'd-none')
                    }
                // onClick={() => { if (eb_chapters.clickable) this.chapterClicked(eb_chapters.chapter!); }}
                >
                    <div className={
                        "chapter-title d-flex-- justify-content-between align-items-center flex-wrap px-2 py-2 small-- cursor-pointer "
                        // + (eb_chapters.content!.text ? 'd-flex ' : 'd-none ')
                        // + (eb_chapters.clickable ? 'd-flex ' : 'd-none ')
                        + ((eb_chapters.content!.text && eb_chapters.clickable) ? 'd-flex ' : 'd-none ')
                        + (isActive ? 'active ' : 'cursor-pointer-- ')
                    }
                        onClick={() => {
                            if (eb_chapters.clickable) { //  && !isActive
                                if (isActive) {
                                    if (this.state.isPlaying) {
                                        this.pause();
                                    } else {
                                        this.play();
                                    }
                                } else {
                                    this.loadChapter(eb_chapters.content!);
                                }
                            }
                        }}
                    >
                        <span>{eb_chapters.content!.text}</span>
                        {/* &nbsp; */}
                        {/* {eb_chapters.id} */}
                        <i className={"fa fa-music-- fa-play-- "
                            + (isActive ? (this.state.isPlaying ? 'fa-pause' : 'fa-play') : 'd-none')
                        }></i>
                    </div>
                    {/* </li> */}
                    {
                        eb_chapters.children.length ?
                            <ul className="pl-2 mb-2--">
                                {
                                    eb_chapters.children.map((ch, index) => (
                                        <Fragment key={index}>
                                            {this.generateEl(ch)}
                                        </Fragment>
                                    ))
                                }
                            </ul>
                            : ''
                    }
                </li>
                {/* </ul> */}
            </>
        )
    }
    private book_chapter_render(): JSX.Element {
        if (!this._createBookChapters) {
            return <div></div>;
        } else {
            return (
                <div className="book-chapters">
                    <ul className="p-0 pr-2">
                        {this.generateEl(this._createBookChapters.tree)}
                    </ul>
                </div>
            )
        }
    }
    isChapterActive(chapter_id: string | undefined): boolean {
        if (!chapter_id) return false;
        if (!this._b_loaded_chapterDetail) return false;
        return this._b_loaded_chapterDetail.detail.id === chapter_id;
    }

    private _b_loaded_chapter_from = 0;
    private _b_loaded_chapterDetail: { index: number; detail: IChapterDetail; } | undefined;
    // private _b_loaded_chaptersLength: number | undefined;
    private _loadChapter_progress = false;
    private async loadChapter(ibc?: IBookContent, atomIndex?: number) {
        if (this._loadChapter_progress) return;
        if (!this._createBookChapters) return;
        this._loadChapter_progress = true;
        let chapterDetail;
        if (ibc) chapterDetail = await this._bookInstance.getChapterDetailByAtom(ibc.pos, this._createBookChapters.flat);
        else if (atomIndex || atomIndex === 0) chapterDetail = await this._bookInstance.getChapterDetailByIndex(atomIndex, this._createBookChapters.flat);
        if (!chapterDetail) {
            this._loadChapter_progress = false;
            return;
        }
        if (
            (chapterDetail.detail.from === undefined || chapterDetail.detail.to === undefined)
            && (atomIndex || atomIndex === 0)
        ) {
            this._loadChapter_progress = false;
            this.loadChapter(undefined, atomIndex + 1);
            return;
        }
        // debugger;
        // this._b_loaded_chaptersLength = await this._bookInstance.get

        /* this._b_reset_binding();
        const wasPlaying = this.state.isPlaying;
        if (wasPlaying) {
            this.pause();
        } */
        const wasPlaying = this.state.isPlaying;
        if (wasPlaying) {
            this.pause();
        }

        const chapterDuration = (chapterDetail.detail.to! - chapterDetail.detail.from!) / 1000;
        const peaks = Array.from({ length: Math.ceil(chapterDuration) }, (v, k) => 1);
        this.wavesurfer!.backend.setPeaks(peaks, chapterDuration);
        const audioBuffer_min = this.getaudioBuffer(44100, 1, [new Float32Array(1)]);
        this.wavesurfer!.loadDecodedBuffer(audioBuffer_min);

        this._b_loaded_chapterDetail = chapterDetail
        this._b_loaded_chapter_from = chapterDetail.detail.from! / 1000;

        this.setWavesurferTime(0);
        // this.updateTimer(0, true);

        /* if (wasPlaying && this.state.isPlaying === false) {
            this.play();
        } */
        this._loadChapter_progress = false;
        if (wasPlaying && this.state.isPlaying === false) {
            this.play();
        } else {
            /** rebuild playlist: active item will update */
            this.setState({});
        }
    }
    private playlist_render() {
        return (
            <>
                <div className="row-- playlist mb-2 py-2">
                    {/* <div className="col-12"> */}
                    {/* <div className="audio-list list-group list-group-flush">
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
                    </div> */}
                    {/* <br /> */}
                    {/* <div> */}
                    {this.book_chapter_render()}
                    {/* </div> */}
                    {/* </div> */}
                </div>
            </>
        )
    }

    /* private progress_bar_render() {
        return (
            <>
                <div className="progress mt-n3 mx-2" id="progress-bar" dir="ltr">
                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-system">0%</div>
                </div>
            </>
        )
    } */

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

    private onAfterSliderChange(value: number) {
        const reader_state = { ...this.props.reader };
        const reader_audio = reader_state.audio;
        reader_audio.volume = value;
        reader_audio.mute = false;
        this.props.update_reader(reader_state);
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

        const reader_state = { ...this.props.reader };
        const reader_audio = reader_state.audio;
        reader_audio.mute = isMute;
        this.props.update_reader(reader_state);
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
                        onAfterChange={(v) => this.onAfterSliderChange(v)}
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
        update_reader: (reader: IReader_schema) => dispatch(action_update_reader(reader)),
    };
};

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        network_status: state.network_status,
        reader_engine: state.reader_engine,
        reader: state.reader,
    };
};

export const ReaderAudio = connect(state2props, dispatch2props)(ReaderAudioComponent);
