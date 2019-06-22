import Location from './Location';
import LayerBusStop from './LayerBusStop';
// import config from './Config';
import config from '../../Config.mjs';

export default class Index {
    constructor() {
        this.markerBusStop = {};
        this.locationBus = new Location();
        // this.layerBusStop = new LayerBusStop();
        this.init();
    }

    init() {
        this.locationBus.getPosition()
            .then(pos => {
                console.log(pos.coords);
                this.myLocationPos = pos;
                this.generateMap(pos);
                this.setBusStopMarker();
            })
            .catch(error => {
                console.log(error);
            });
    }

    generateMap(info) {
        if(!info) {
            return;
        }

        const { latitude, longitude } = info.coords;
        const container = document.querySelector('#map'),
            optionsForMap = {
                center: new daum.maps.LatLng(latitude, longitude),
                level: 3,
            };

        // generate map.
        this.map = new daum.maps.Map(container, optionsForMap);

        // 아래 window객체에 할당한 내용은 state기능으로 대체될 예정.
        window.thisMap = this.map;

        // 지도에 현재위치를 생성하고 표시한다
        this.markerHere = new daum.maps.Marker({
            position: new daum.maps.LatLng(latitude, longitude),
            map: this.map
        });
    }

    setBusStopMarker() {
        this.getDataForBusStop()
        .then(res => {
            const filterData = res.msgBody.itemList.filter(v => {
                // arsId가 없는 정류소는 data에서 제외시킨다.
                return v.arsId !== '0';
            });

            return filterData;
        })
        .then(data => {
            const markerImageUrl = config.imgBusStop, // 마커 이미지의 주소
                markerImageSize = new daum.maps.Size(24, 24), // 마커 이미지의 크기
                markerImageOptions = { 
                    offset : new daum.maps.Point(12, 12)// 마커 좌표에 일치시킬 이미지 안의 좌표
                };

            this.layerBusStop = new LayerBusStop(data);

            // loop busStop
            data.forEach(stop => {
                // 마커 이미지를 생성한다
                const markerImage = new daum.maps.MarkerImage(markerImageUrl, markerImageSize, markerImageOptions),
                    latitude = stop.gpsY,
                    longitude = stop.gpsX,
                    wtmX = stop.posX,
                    wtmY = stop.posY,
                    geocoder = new daum.maps.services.Geocoder();
                // var transLat, transLng, template;

                // 지도에 마커를 생성하고 표시한다
                this.markerBusStop[stop.stationId] = new daum.maps.Marker({
                    position: new daum.maps.LatLng(latitude, longitude),
                    image: markerImage,
                    map: this.map
                });

                // generate customLayer for BusStop
                this.layerBusStop.setLayerForBusStop({
                    stop,
                    map: this.map,
                    marker: this.markerBusStop[stop.stationId],
                });
            });

            // if mapLevel higher than 3, hide markerBusStop when init map
            if(this.map.getLevel() > 3) {
                this.showHideMarkerBusStop();
            }

            // bind zoom_changed event: zoom level이 4이상일 경우 버스정류장의 마커를 제거
            daum.maps.event.addListener(this.map, 'zoom_changed', () => {
                if(this.map.getLevel() >= 4) {
                    this.showHideMarkerBusStop();
                }else {
                    this.showHideMarkerBusStop(this.map);
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }

    showHideMarkerBusStop(param) {
        if(!Object.keys(this.markerBusStop).length) {
            return;
        }

        const value = param ? param : null;
        for(const key in this.markerBusStop) {
            this.markerBusStop[key].setMap(value);
        }
    }

    getDataForBusStop() {
        const urlForGetStation = `http://${location.hostname}:${config.apiURI.getStationPort}/getStationByPos`;
        const { latitude, longitude } = this.myLocationPos.coords;
        const uri = new URL(urlForGetStation);
        const params = {
            lng: longitude,
            lat: latitude,
            radius: 500, // unit: meter
        }

        // set params to url
        Object.keys(params).forEach(key => {
            uri.searchParams.append(key, params[key]);
        });

        return new Promise((resolve, reject) => {
            fetch(uri)
            .then(res => {
                return res.text();
            })
            .then(res => {
                const jsonResponse = JSON.parse(res);
                resolve(jsonResponse['ServiceResult']);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    // transCoord() {
    //     geocoder.transCoord(wtmX, wtmY, (result, status) => {
    //         if(status === daum.maps.services.Status.OK) {
    //             transLat = result[0].y;
    //             transLng = result[0].x;

    //             this.markerBusStop[stop.arsId] = new daum.maps.Marker({
    //                 position: new daum.maps.LatLng(transLat, transLng),
    //                 image: markerImage,
    //                 map: this.map
    //             });
    //         }
    //     }, {
    //         input_coord: daum.maps.services.Coords.WTM,
    //         output_coord: daum.maps.services.Coords.WGS84,
    //     });
    // }
}