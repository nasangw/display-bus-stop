import App from './app';

export class Location extends App {
    // constructor() {
    //     console.log('in location');
    // }

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