// import config from './Config';
import config from '../../Config.mjs';

export default class LayerBusStop {
    constructor(list) {
        this.overlayBusStop = {};
        this.listBusStop = list;
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
                <ul id="stop-${stop.arsId}" class="list-arrival"></ul>
            </div>
        `;
    }

    getStationData(arsId) {
        const urlGetBusData = `http://${location.hostname}:${config.apiURI.getStationPort}/getStationByUid`;
        // const uri = new URL(config.apiURI.getStationByUid);
        const uri = new URL(urlGetBusData);
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
                return res.text();
            })
            .then(res => {
                const jsonResponse = JSON.parse(res);
                resolve(jsonResponse['ServiceResult'] || jsonResponse);
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
        const arsId = stop.arsId;
        const gps = {
            x: data.stop.gpsX,
            y: data.stop.gpsY,
        }

        this.setOverlay({ template, arsId, map, marker, stationId: stop.stationId, gps });
    }

    setOverlay(data) {
        const { template, arsId, map, marker, stationId } = data;
        this.overlayBusStop[stationId] = new daum.maps.CustomOverlay({
            content: template, 
            map: map, 
            position: marker.getPosition(), 
        });
        const elemOverlay = this.overlayBusStop[stationId].a;
        const btnCloseLayer = elemOverlay.querySelector('.btn__close-layer');

        // bind click event that show layer
        daum.maps.event.addListener(marker, 'click', function() {
            if(this.activeOverlayBusStop) {
                this.overlayBusStop[this.activeOverlayBusStop].setMap(null);
            }
            // 버스정류소 레이어팝업 open
            this.overlayBusStop[stationId].setMap(map);

            // 지도 이동
            const moveLatLng = new daum.maps.LatLng(data.gps.y, data.gps.x);
            window.thisMap.panTo(moveLatLng);

            // 현재 활성화된 버스정류소 value 지정
            this.activeOverlayBusStop = stationId;

            // next step
            this.setTemplateArrivalInfo(arsId);
        }.bind(this));

        // bind click event that hide layer
        btnCloseLayer.addEventListener('click', ev => {
            // remove DOM for stop info
            document.querySelector(`#stop-${arsId}`).innerHTML = '';

            // hide overlay
            this.overlayBusStop[stationId].setMap(null);
            this.activeOverlayBusStop = false;
        });

        // and hide layer
        this.overlayBusStop[stationId].setMap(null);
    }

    getSwitchRouteType(data) {
        if(!data) {
            return;
        }else {
            if(typeof data !== 'number') {
                data = parseInt(data);
            }
        }

        switch(data) {
            case 1: 
                return '공항';
                break;
            case 2: 
                return '마을';
                break;
            case 3: 
                return '간선';
                break;
            case 4: 
                return '지선';
                break;
            case 5: 
                return '순환';
                break;
            case 6: 
                return '광역';
                break;
            case 7: 
                return '인천';
                break;
            case 8: 
                return '경기';
                break;
            case 9: 
                return '폐지';
                break;
            case 0: 
                return '공용';
                break;
            default: 
                return;
                break;
        }
    }

    setTemplateArrivalInfo(arsId) {
        this.getStationData(arsId)
        .then(res => {
            var template;
            const elem = document.querySelector(`#stop-${arsId}`);

            if(res.msgHeader.headerCd === 0) {
                // 버스노선이 1개일 경우 API(xml-js)에서 array로 감싼 후 객체를 리턴하지 않고 곧바로 객체로 리턴하는 이슈.
                const arrayArrivalInfo = res.msgBody.itemList.length ? res.msgBody.itemList : new Array(res.msgBody.itemList);

                if(Array.isArray(arrayArrivalInfo)) {
                    template = `
                        ${arrayArrivalInfo.map(info => `
                            <li class="bus">
                                <span class="bus__routeType">${this.getSwitchRouteType(info.routeType)}</span>
                                <span class="bus__number">${info.rtNm}</span>
                                <span class="bus__direction">(${info.adirection} 방면)</span>
                                <span class="bus__message">${info.arrmsg1}</span>
                            </li>
                        `).join('')}
                    `;
                }
            }else {
                // 결과 없음
                template = `<p>관련 정보가 없습니다.</p>`;
            }

            // set DOM
            elem.innerHTML = template;
        })
        .catch(err => {
            return
        });
    }
}