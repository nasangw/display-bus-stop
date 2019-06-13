// import config from './Config';
import config from '../../Config.mjs';

export default class Location {
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