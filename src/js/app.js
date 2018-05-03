import Location from './_location';
import x2js from 'x2js/xml2json';

const keyPublicData = 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb/CPqhgmH2HORnAEYpSFsky8ExSyd1VA==';

class App {
    constructor() {
        this.hasInit = false;
        this.marker = {};
        this.imgBusStop = '/src/img/icon-bus.png';
        // this.imgBusStop = '/src/img/transparent.png';
        this.init();
    }

    init() {
        // console.log('Init by App');

        const location = new Location();
        location.getPosition()
            .then(data => {
                this.myLocationData = data;
                this.showMap(data);
                this.setMarkerForBusStop();
            })
            .catch(error => {
                console.log(error);
            });
    }

    setMarkerForBusStop() {
        this.getBusStopData()
            .then(res => {
                const list = res.ServiceResult.msgBody.itemList;
                console.log(list);
                var markerImageUrl = this.imgBusStop, // 마커 이미지의 주소
                    markerImageSize = new daum.maps.Size(24, 24), // 마커 이미지의 크기
                    markerImageOptions = { 
                        offset : new daum.maps.Point(12, 12)// 마커 좌표에 일치시킬 이미지 안의 좌표
                    };

                list.forEach((stop) => {
                    // console.log(stop);
                    
                    // 마커 이미지를 생성한다
                    var markerImage = new daum.maps.MarkerImage(markerImageUrl, markerImageSize, markerImageOptions);
                    var latitude = stop.gpsY;
                    var longitude = stop.gpsX;
                    var wtmX = stop.posX;
                    var wtmY = stop.posY;
                    var geocoder = new daum.maps.services.Geocoder();
                    var transLat, transLng;

                    // geocoder.transCoord(wtmX, wtmY, (result, status) => {
                    //     if(status === daum.maps.services.Status.OK) {
                    //         transLat = result[0].y;
                    //         transLng = result[0].x;

                    //         this.marker[stop.arsId] = new daum.maps.Marker({
                    //             position: new daum.maps.LatLng(transLat, transLng),
                    //             image: markerImage,
                    //             map: this.map
                    //         });
                    //     }
                    // }, {
                    //     input_coord: daum.maps.services.Coords.WTM,
                    //     output_coord: daum.maps.services.Coords.WGS84,
                    // });

                    // 지도에 마커를 생성하고 표시한다
                    this.marker[stop.arsId] = new daum.maps.Marker({
                        position: new daum.maps.LatLng(latitude, longitude),
                        image: markerImage,
                        map: this.map
                    });
                });
                window.marker = this.marker;
            })
            .catch(error => {
                console.log(error);
            });
    }

    getBusStopData() {
        const { latitude, longitude } = this.myLocationData.coords;
        const uri = new URL('http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos');
        const params = {
            serviceKey: keyPublicData, // api Key
            tmX: longitude,
            tmY: latitude,
            radius: 500, // unit: meter
        }

        // const uri = new URL('http://openapi.tago.go.kr/openapi/service/BusSttnInfoInqireService/getCrdntPrxmtSttnList');
        // const params = {
        //     serviceKey: keyPublicData,
        //     gpsLong: 127.04233229999998,
        //     gpsLati: 37.5474537,
        // }

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
                const xml2js = new x2js();
                const parseData = xml2js.xml_str2json(res);
                resolve(parseData);
            })
            .catch(error => {
                reject(error);
            });
        });        
    }

    showMap(info) {
        if(!info) {
            return;
        }

        if(!this.hasInit) {
            const { latitude, longitude } = info.coords;
            const container = document.querySelector('#map');
            const optionsForMap = {
                center: new daum.maps.LatLng(latitude, longitude),
                level: 3
            };

            this.map = new daum.maps.Map(container, optionsForMap);

            // zoom level이 4이상일 경우 버스정류장의 마커를 제거
            daum.maps.event.addListener(this.map, 'zoom_changed', () => {
                if(this.map.getLevel() >= 4) {
                    for(const key in this.marker) {
                        this.marker[key].setMap(null);
                    }
                }else {
                    for(const key in this.marker) {
                        this.marker[key].setMap(this.map);
                    }
                }
            });

            // 지도에 현재위치를 생성하고 표시한다
            this.markerHere = new daum.maps.Marker({
                position: new daum.maps.LatLng(latitude, longitude),
                map: this.map
            });

            this.hasInit = true;
        }
    }
}

const app = new App();