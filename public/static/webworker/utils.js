function waitOnMe(timer = 500) {
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(true);
        }, timer);
    });
}