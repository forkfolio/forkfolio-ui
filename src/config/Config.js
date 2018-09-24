function getRestURL() {
    if (window.location.host === 'localhost:3000') {
        return 'http://localhost:8080/'
    } 

    return 'https://rest.forkfol.io/rest/';
}

export const config = {
    restURL: getRestURL()
}