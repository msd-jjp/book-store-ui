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

====================================================================================

test 100 meg file in storage safari.

====================================================================================

readerAudio btn foucus change to active.

====================================================================================

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

====================================================================================

====================================================================================

folder book_content ---> prepare-book

/prepare-book/<library_id>

get

====================================================================================

====================================================================================

show notify modal to user on app version update for test:
    your current version is 1.0.19 updated from 1.0.17.

====================================================================================

====================================================================================

call method createWorkerAfterDownload in cmp Reader (reading overview ...) after will_receve_props readerEngine failed
msdBook: WasmWorkerHandler --> onmessage --> create new book if in cmp reader.

====================================================================================


====================================================================================


====================================================================================

reader --> pdf: font, color,.. disable & enable zoom.

====================================================================================
afzudan list download dar setting
    har kodum ro khast cancel kone. (hata reader2js & wasm)

====================================================================================

1)
ایجاد آی دی برای دستگاه
security:
    api create_device_id --> { id, string }


2)
دانلود کتاب
download --> 404 --> prepare -->204 --> prepare -->200 --> download

3)
indexedDb
store page (pdf, msdFormat)
download performance

====================================================================================

setting
list device haye faal ezafe kon

====================================================================================

create first layer cmp
level valid User? --> deviceKey need userId.

cmp has:
    one modal for list of active device(has remove btn)
    one modal show notify only

    show generate btn if device has not registered.


    reducer
        showListModal: boolean;
        current device key
        msg:
            should generate new device_key
            no msg just show list

            show list first by loki db, then request and load all.
            add icon to current device item in list.


            on modal open
                get data from loki
                get data from server if online.


    store in loki
        not only api generate
        but getAllByUserId


    add open link in setting

====================================================================================