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
npm i react-zoom-pan-pinch
npm i dexie


====================================================================================
????????????????????????????????????????????????????????????????????????????????????




====================================================================================

npm run build
npm install -g serve
serve -s build

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

404 image or icon (fill empty page)

====================================================================================
?)
comments --> parent: show quote from parent

====================================================================================

fix input cmp bug:
reset input(form element) --> after reset set touch to false.

====================================================================================

add price to book in category & store

====================================================================================

after filter added in library & collection
    no book found in library (match your filter)
    no collection found
    no book found in collection (match your filter)

====================================================================================

share
	whats app , telegram , sms
	
====================================================================================

notification (r&d)
	even if close
	
====================================================================================

get data from storage first (in page like store, dashborad)

====================================================================================

use icon for book type(in cart, dashboard image small icon in corner, store, detail,...)

====================================================================================

goBack bug in /collection & readerOverview :
https://github.com/ReactTraining/history/issues/573

====================================================================================

replace react-slick with swiper in dashboard & store; 

====================================================================================

wavesurfer library replace require with import 

====================================================================================

check dd-menu in readerOverview & collection & library --> ltr mode

====================================================================================

call CmpUtility.refreshView(); when action need it, remove from general method like "toggle_book_download"

====================================================================================

onSync : check cart too.

on cmp cart opened: keep cart data upToDate (if book price changed).

====================================================================================

sync: in cmp more

====================================================================================

feedback in cmp more

====================================================================================

bookDetail cmp:
    if audio --> dont show page
    if other --> dont show duration

====================================================================================

libItem --> add size (perminently keep size)

====================================================================================

reader :
    audio
        0)chapter --> nested menu
        1) if user paused --> (force pause) prevent play (it happed while waitng to load)
        2) create audio with empty chapter
    pdf:
        0)chapter --> nested menu
        

====================================================================================

create state named: global_notify?? --> show detail to user like:
    show notify modal to user on app version update for test:
        your current version is 1.0.19 updated from 1.0.17.
    new feature user can use.
    access removeed from user
    you have new message from admin, check your inbox.
    modal feature
        header JSX.Element
        body JSX.Element
        footer JSX.Element

====================================================================================

afzudan list download dar setting
    har kodum ro khast cancel kone. (hata reader2js & wasm)

====================================================================================


====================================================================================

cmp bookDetail
    open book by reader if in lib & downloaded.

====================================================================================

img tag --> attr alt --> need translation.

====================================================================================

====================================================================================

indexedDb

do not wait for image_get_cycle (do one separate cycle for indexedDB only)
do not call indexedDB for only one img --> load at least 5 img in memory.

indexedDB bookPage:
    max all page 1000
    render 5 more if ...

====================================================================================

on readerWorker engine error (destroyed)
    call bookInstance.delete: msd, pdf, audio, ...

====================================================================================

on logout:
    reset donwload list (except reader&wasm file if possible OR remove all).

onLogin:
    check deviceKey


delete sw.js in public folder (if useles)

====================================================================================



====================================================================================

on resetPassword modal close: reset form (if typed and not submit)

====================================================================================

====================================================================================

axios 0.19.1 --> service.base.ts : // config.baseURL = '';

====================================================================================
