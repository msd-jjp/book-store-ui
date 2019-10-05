import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../../model/model.token";
import { ToastContainer } from "react-toastify";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
//
// import * as WaveSurferAll from 'wavesurfer.js';
// import WaveSurfer from 'wavesurfer.js';
// import ss from'wavesurfer.js/dist/wavesurfer';

// const WaveSurfer = require('wavesurfer.min.js');
import { Localization } from "../../../config/localization/localization";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
// const WaveSurfer: any = {}; // = require('wavesurfer.js');
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
// import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline';
// const WaveSurfer = WaveSurferAll.default;
const WaveSurfer = require('wavesurfer.js/dist/wavesurfer');
// import WaveSurfer from 'wavesurfer.js/src/wavesurfer';
// const WaveSurfer = require('wavesurfer.js/src/wavesurfer');
const TimelinePlugin = require('wavesurfer.js/dist/plugin/wavesurfer.timeline');
const CursorPlugin = require('wavesurfer.js/dist/plugin/wavesurfer.cursor');

interface IProps {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    history: History;
    token: IToken;
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
    };

    private _personService = new PersonService();

    private book_page_length = 2500;
    private book_active_page = 372;

    private wavesurfer: WaveSurfer | undefined;

    constructor(props: IProps) {
        super(props);

        this._personService.setToken(this.props.token);
        this.book_id = this.props.match.params.bookId;
    }

    componentDidMount() {
        this.updateUserCurrentBook_client();
        this.setBook_byId(this.book_id);
        this.updateUserCurrentBook_server();
        this.initAudio();
    }

    updateUserCurrentBook_client() {
        let logged_in_user = { ...this.props.logged_in_user! };
        if (!logged_in_user) return;
        const book = this.getBookFromLibrary(this.book_id);
        logged_in_user.person.current_book = book;
        this.props.onUserLoggedIn(logged_in_user);

        this.setState({ ...this.state, book: this.getBookFromLibrary(this.book_id) });
    }

    getBookFromLibrary(book_id: string): IBook {
        const lib = this.props.library.data.find(lib => lib.book.id === book_id);
        return (lib! || {}).book;
    }

    setBook_byId(book_id: string) {
        this.setState({ ...this.state, book: this.getBookFromLibrary(book_id) });
    }

    async updateUserCurrentBook_server() {
        if (!this.book_id) return;
        if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

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

    initAudio() {
        const progressDiv: any = document.querySelector('#progress-bar');
        const progressBar = progressDiv!.querySelector('.progress-bar');

        const showProgress = (percent: number) => {
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
            waveColor: '#A8DBA8',
            progressColor: '#3B8686',
            // backend: 'MediaElement',
            // backend: 'WebAudio',
            // height: 208,
            height: 320,
            barWidth: 1,
            cursorWidth: 1,
            cursorColor: '#4a74a5',

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
        })
        // this.wavesurfer.load('example/media/demo.wav');
        // this.toggleLoading();
        // this.wavesurfer.load(music);
        // this.wavesurfer.load('https://ia601307.us.archive.org/14/items/SylviaPlathOnThePlethoraOfDryads/Perseus-The%20Triumph%20Of%20Wit%20Over%20Suffering.mp3');
        // this.wavesurfer.loadBlob(music);
        this.wavesurfer!.on('error', (e: any) => {
            // this.toggleLoading();
            //show notification here...
            // alert(555);
            const err_res = this.handleError({ error: e, toastOptions: { toastId: 'player_error' } }); // {}
            this.setState({ error: err_res.body, loading: false });
            // console.error('error -->>', e);
        });

        this.wavesurfer!.on('play', function () {
            console.info('play...');
        });
        this.wavesurfer!.on('pause', () => {
            console.info('pause...');
            // this.wavesurfer!.params.container.style.opacity = 0.9;
        });

        this.wavesurfer!.on('finish', () => {
            console.log('finish...');
            // this.gotoBegining();
            // this.wavesurfer!.pause();
            // this.pause();
            this.after_pause();
        });


        this.wavesurfer!.on('loading', showProgress);
        this.wavesurfer!.on('destroy', hideProgress);

        this.wavesurfer!.on('audioprocess', () => { this.updateTimer(); });
        this.wavesurfer!.on('seek', () => { this.updateTimer(); });

        this.updateTimer(0);

        this.load_file();
    }

    gotoBegining() {
        this.wavesurfer!.setCurrentTime(0);
    }

    // private togglePlay() {
    //     this.wavesurfer!.playPause();
    //     this.setState({ isPlaying: this.wavesurfer!.isPlaying() });
    // };

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

    showLoader() {
        this.setState({ loading: true });
    }
    hideLoader() {
        this.setState({ loading: false });
    }

    load_file() {
        // this.showLoader();
        this.setState({ loading: true, error: undefined });
        this.wavesurfer!.load(this.state.active_item);
    }

    retry_loading() {
        this.load_file();
    }

    setCurrentSong(url: string) {
        // this.toggleLoading();
        this.setState({ loading: true, active_item: url, isPlaying: false }, () => {
            this.load_file();
        });
        // this.wavesurfer!.load(url);
        // console.log(this.wavesurfer!.getCurrentTime());
        this.updateTimer(0);
    };
    updateTimer(currentTime?: number) {
        let formattedTime = '00:00:00';
        if (currentTime || currentTime === 0) {
            formattedTime = this.secondsToTimeFormatter(currentTime);
        } else {
            formattedTime = this.secondsToTimeFormatter(this.wavesurfer!.getCurrentTime());
        }
        document.getElementById('time-current')!.innerText = formattedTime;
    }
    secondsToTimeFormatter(seconds: number) {
        seconds = Math.floor(seconds);
        let h: number | string = Math.floor(seconds / 3600);
        let m: number | string = Math.floor((seconds - (h * 3600)) / 60);
        let s: number | string = seconds - (h * 3600) - (m * 60);

        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        return h + ':' + m + ':' + s;
    }

    stepBackward() {
        const active_item_index = this.state.playlist.indexOf(this.state.active_item);
        let new_index = -1;
        if (active_item_index > -1 && active_item_index - 1 >= 0) {
            new_index = active_item_index - 1;
        }
        if (new_index < 0) return;
        this.setCurrentSong(this.state.playlist[new_index]);
    }
    stepForward() {
        const active_item_index = this.state.playlist.indexOf(this.state.active_item);
        let new_index = 0;
        if (active_item_index > -1 && active_item_index + 1 <= this.state.playlist.length - 1) {
            new_index = active_item_index + 1;
        }
        // if (active_item_index === new_index) return;
        // if (new_index === 0 && loop === false) return;
        if (new_index === 0) return;
        this.setCurrentSong(this.state.playlist[new_index]);
    }
    backward() {
        const currentTime = this.wavesurfer!.getCurrentTime();
        let seekTo = 0;
        if (currentTime - 30 > 0) {
            seekTo = currentTime - 30;
        }
        this.wavesurfer!.setCurrentTime(seekTo);
    }
    forward() {
        // const totalTime = this.wavesurfer!.getDuration();
        const currentTime = this.wavesurfer!.getCurrentTime();
        // const remainingTime = totalTime - currentTime;

        this.wavesurfer!.setCurrentTime(currentTime + 30);
    }

    playlist_render() {
        return (
            <>
                <div className="row-- playlist mb-2 py-2">
                    {/* <div className="col-12"> */}
                    <div className="audio-list list-group list-group-flush">
                        {this.state.playlist.map((url, url_index) => {
                            return (
                                <Fragment key={url_index}>
                                    <div className={"audio-item list-group-item "
                                        + (this.state.active_item === url ? 'active' : '')}
                                        onClick={() => this.setCurrentSong(url)}>
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

    progress_bar_render() {
        return (
            <>
                <div className="progress" id="progress-bar" dir="ltr">
                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary">0%</div>
                </div>
            </>
        )
    }

    player_render() {
        return (
            <>
                <div className="row player">
                    <div className="col-12 mb-2">
                        <ContentLoader gutterClassName="gutter-0" show={this.state.loading}></ContentLoader>
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
                        {this.progress_bar_render()}
                    </div>

                    <div className="col-12">
                        <div className="current-time text-system text-center" id="time-current"></div>
                    </div>
                </div>
            </>
        )
    }

    audio_body_render() {
        return (
            <>
                <div className="audio-body py-2">
                    {this.playlist_render()}
                    {this.player_render()}
                </div>
            </>
        )
    }

    audio_footer_render() {
        return (
            <>
                <div className="audio-footer">
                    <div className="row">
                        <div className={
                            "audio-control col-12 mb-3-- py-3 d-flex justify-content-center "
                            // + (this.state.loading ? 'opacity-5sss' : '')
                        } dir="ltr">
                            <button className="btn action-btn mx-2 btn-outline-info"
                                onClick={() => this.stepBackward()} disabled={this.state.loading}>
                                <i className="fa fa-step-backward"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-info"
                                onClick={() => this.backward()} disabled={this.state.loading}>
                                <i className="fa fa-backward"></i>
                            </button>

                            <button className={"btn action-btn mx-2 btn-outline-info " + (this.state.isPlaying ? 'd-none' : '')}
                                onClick={() => this.play()} disabled={this.state.loading}>
                                <i className="fa fa-play"></i>
                            </button>
                            <button className={"btn action-btn mx-2 btn-outline-info " + (this.state.isPlaying ? '' : 'd-none')}
                                onClick={() => this.pause()} disabled={this.state.loading}>
                                <i className="fa fa-pause"></i>
                            </button>

                            <button className="btn action-btn mx-2 btn-outline-info"
                                onClick={() => this.forward()} disabled={this.state.loading}>
                                <i className="fa fa-forward"></i>
                            </button>
                            <button className="btn action-btn mx-2 btn-outline-info"
                                onClick={() => this.stepForward()} disabled={this.state.loading}>
                                <i className="fa fa-step-forward"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    goBack() {
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
        token: state.token,
        network_status: state.network_status,
        library: state.library,
    };
};

export const ReaderAudio = connect(state2props, dispatch2props)(ReaderAudioComponent);
