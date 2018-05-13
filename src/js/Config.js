import x2js from 'x2js/xml2json';

class Config {
    constructor() {
        this.keyDataOrKr = 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb/CPqhgmH2HORnAEYpSFsky8ExSyd1VA==';
        this.apiURI = {
            getStationByPos: 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos',
            getStationByUid: 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid',
        };
        this.x2js = x2js;
        this.imgBusStop = '/src/img/icon-bus.png';
        // this.imgBusStop = '/src/img/transparent.png';

        if(!Config.instance) {
            Config.instance = this;
        }
        return Config.instance;
    }
}

const instance = new Config();
Object.freeze(instance);

export default instance;