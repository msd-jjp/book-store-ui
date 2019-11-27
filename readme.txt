====================================================================================

npm i react-router-dom @types/react-router-dom
npm i bootstrap font-awesome node-sass
npm i axios
npm i redux react-redux @types/react-redux
npm i react-toastify
npm i react-localization
npm i react-slick @types/react-slick
npm i react-bootstrap @types/react-bootstrap
npm i react-rating
npm i -D redux-logger @types/redux-logger
npm i redux-persist @types/redux-persist
npm i moment moment-jalaali @types/moment @types/moment-jalaali
npm i lokijs @types/lokijs
npm install workbox-build --save-dev
npm i react-dropzone
npm i rc-slider @types/rc-slider
npm i swiper @types/swiper
npm i react-app-rewired worker-loader -D
npm i wavesurfer.js @types/wavesurfer.js

====================================================================================
????????????????????????????????????????????????????????????????????????????????????


====================================================================================

npm run build
npm install -g serve
serve -s build

====================================================================================

====================================================================================

====================================================================================


====================================================================================

cancel request in cmpWillUnmount
https://github.com/axios/axios#cancellation
https://github.com/axios/axios/issues/1361

====================================================================================



====================================================================================

use
    <div class="spinner-border"></div>
instead of current btn loader

====================================================================================

====================================================================================

404 image or icon (fill empty page)

====================================================================================

====================================================================================

====================================================================================



====================================================================================
?)
comments --> parent: show quote from parent

====================================================================================

fix input cmp bug:
reset input(form element) --> after reset set touch to false.

====================================================================================

you have to use logout
if in log in page & this.props.loged_in_user --> redirect to dashboard

====================================================================================

add price to book in category & store

====================================================================================

collection & library head request & get request

no book found in library (match your filter)
no collection found
no book found in collection (match your filter)

====================================================================================

====================================================================================

share 
	whats app , telegram , sms
	
====================================================================================

notification (r&d)
	even if close
	
====================================================================================

====================================================================================



====================================================================================

get data from storage first (in page like store, dashborad)

====================================================================================

use icon for book type(in cart, dashboard image small icon in corner, store, detail,...)

====================================================================================

set id for toaster --> if it is open, don't open another one or force close before open another. (like cmp cart)

====================================================================================

====================================================================================

if not login layout main(noWrap) push '/login' to history
    in login after logedIn pop if has length else push dashboard.

====================================================================================

upload progress bar if file size big (use https://github.com/fkhadra/react-toastify#use-a-controlled-progress-bar)

====================================================================================



====================================================================================

goBack bug in /collection & readerOverview :
https://github.com/ReactTraining/history/issues/573

====================================================================================

replace react-slick with swiper in dashboard & store; 

====================================================================================

wavesurfer library replace require with import 

====================================================================================



====================================================================================



====================================================================================

check dd-menu in readerOverview & collection & library --> ltr mode

====================================================================================

====================================================================================

====================================================================================



====================================================================================

call CmpUtility.refreshView(); when action need it, remove from general method like "toggle_book_download"

====================================================================================

fetch user on app open & in layout validUser. update logedInUser state.

====================================================================================

kindle --> mark as un-read

on book open(epub or audio) --> update back (do not check if book_id same as user OR keeep userProfile update)

====================================================================================

mabe in profile: get user instead of person.

onSync : check cart too.

on cmp cart opened: keep cart data upToDate (if book price changed).

====================================================================================

audio:
in safari --> start immediately after open !! --> done.
on change pause play bug. ****
memory leak.

====================================================================================

cmp profile --> add reset password to profile (edit user ham pass avaz mikone age login hasti)

====================================================================================

test 100 meg file in storage safari.

====================================================================================

readerAudio btn foucus change to active.

====================================================================================

add onEnter to login input (all other input needed like regester & payment ....)

====================================================================================

bookDetail cmp:
    if audio --> dont show page
    if other --> dont show duration

====================================================================================



====================================================================================

book download:
    item click --> download;
    progress click --> cancel;


libItem --> add size (perminently keep size)


====================================================================================

reader :
    audio
        chapter --> nested menu & load file on click
    pdf:
        chapter --> nested menu
        zoom

====================================================================================
response headers

    ETag: "5ddac0f2-3c747e"

====================================================================================

const is_re_d_ing = this.isReaderEngineDownloading();
            if (is_re_d_ing) {
                this.readerEngineNotify();
                return; // todo: do not return here --> if book not download -->  
            }

====================================================================================

if isReaderEngineDownloading & in cmp reader(audio, ...) go back.

====================================================================================

separate this method --> cmp dashboard, libray, collecyion, all reader.
readerEngineNotify(): void {
    this.toastNotify(Localization.msg.ui.downloading_reader_security_content,
        { autoClose: Setup.notify.timeout.info, toastId: 'readerEngineNotify_info' }, 'info');
}

add progress to readerEngineNotify.

====================================================================================

folder book_content ---> prepare-book

/prepare-book/<library_id>

get

====================================================================================

change partialDownlaoad & Cmp bookDolwnlaodo --> stack

====================================================================================

show notify modal to user on app version update for test:
    your current version is 1.0.19 updated from 1.0.17.

====================================================================================

msdBook: WasmWorkerHandler --> onmessage --> create new book if in cmp reader.

====================================================================================

on logout reader files will remove (stored in book location).

====================================================================================

audio reader --> try catch --> WASM BUSY

====================================================================================

layout footer --> click on image while readerEngine downloading.

====================================================================================

call method createWorkerAfterDownload in cmp Reader (reading overview ...) after will_receve_props readerEngine failed

====================================================================================
