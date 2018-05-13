import config from './Config';

export default class LayerBusStop {
    constructor(list) {
        this.overlayBusStop = {};
        this.listBusStop = list;
        console.log(this.listBusStop);
    }

    getTemplateLayer(stop) {
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
                <ul id="stopId-${stop.stationId}" class="list"></ul>
            </div>
        `;
    }

    getDataStop(arsId) {
        const uri = new URL(config.apiURI.getStationByUid);
        const params = {
            serviceKey: config.keyDataOrKr, // api Key
            arsId,
            // stationId,
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
                this.xml2js = new config.x2js();
                const parseData = this.xml2js.xml_str2json(data);
                resolve(parseData);
                // resolve(data);
            })
            .catch(err => {
                reject(err);
            });
        } );
    }

    setLayerForBusStop(data) {
        if(!data) {
            return;
        }

        const { stop, map, marker } = data;
        const template = this.getTemplateLayer(stop);

        this.setOverlay({ template, map, marker, stationId: stop.stationId });
        // this.ttt(stop.arsId);
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

        // next step
        // this.ttt();
    }

    ttt() {
        this.getDataStop(stop.arsId)
        .then(res => {
            console.log(res);
            const arrayBusStop = res.msgBody.itemList;
            arrayBusStop.map((value, index) => {
                console.log(value);
                console.log(index);
            })
        });
    }
}