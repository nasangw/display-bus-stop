import { App } from './app';

// export default class LayerBusStop extends App{
export class LayerBusStop {
    constructor() {
        // super();
        this.overlayBusStop = {};
    }

    init() {
        // console.log('LayerBusStop Class');
        
    }

    getTemplate(stop) {
        if(!stop) {
            return;
        }

        return `
            <div class="layer layer__bus-stop">
                <div class="header">
                    <h2>${stop.stationNm}</h2>
                    <button type="button" class="btn btn__close-layer">닫기</button>
                </div>
                <p>stationId: ${stop.stationId}</p>
                <p>arsId: ${stop.arsId}</p>
            </div>
        `;
    }

    getData(stationId) {
        const keyDataOrKr = 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb/CPqhgmH2HORnAEYpSFsky8ExSyd1VA==';
        const path = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid`;
        const uri = new URL(path);
        const params = {
            serviceKey: this.keyDataOrKr, // api Key
            stationId,
        }
        // set params to url
        Object.keys(params).forEach(key => {
            uri.searchParams.append(key, params[key]);
        });
        
        return new Promise( (resolve, reject) => {
            fetch(uri)
            .then(res => {
                // console.log(res);
                return res.text();
            })
            .then(data => {
                // console.log(data);
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
        } );
    }

    setOverlay(data) {
        const { template, map, marker, stationId } = data;

        this.overlayBusStop[stationId] = new daum.maps.CustomOverlay({
            content: template, 
            map: map, 
            position: marker.getPosition(), 
        });

        // bind click event that show layer
        daum.maps.event.addListener(marker, 'click', function() {
            this.overlayBusStop[stationId].setMap(map);
        }.bind(this));

        const elemOverlay = this.overlayBusStop[stationId].a;
        const btnCloseLayer = elemOverlay.querySelector('.btn__close-layer');

        // bind click event that hide layer
        btnCloseLayer.addEventListener('click', ev => {
            this.overlayBusStop[stationId].setMap(null);
        });
        // and hide layer
        this.overlayBusStop[stationId].setMap(null);
    }
}