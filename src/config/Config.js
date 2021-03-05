function getRestURL() {
    console.log(window.location.host)
    if (window.location.host === 'localhost:3000') {
        //return 'http://localhost:8080/'
        // bypass if server is not running on localhost
        return 'https://forkfol.io/dummydata/';
    } 

    return 'https://rest.forkfol.io/rest/';
}

function isLocalhost() {
    return window.location.host === 'localhost:3000';
}

export const config = {
    restURL: getRestURL(),
    isLocalhost: isLocalhost()
}