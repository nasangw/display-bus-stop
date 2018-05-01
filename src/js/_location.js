export default class Loaction {
    constructor() {
        this.init();
    }

    init() {
        const getCP = navigator.geolocation.getCurrentPosition;
    }

    getPosition() {
        if(!this.isGeolocationAvailable) {
            return;
        }
        return new Promise( (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                resolve(position);
            }, () => {
                reject('fail for get your data.');
            });
        } );
    }

    isGeolocationAvailable() {
        return 'geolocation' in navigator ? true : false;
    }
}