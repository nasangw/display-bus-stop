import Location from './_location';
import x2js from 'x2js/xml2json';

// const location = new Location();

const keyPublicData = 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb/CPqhgmH2HORnAEYpSFsky8ExSyd1VA==';
// const keyPublicData = 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb%2FCPqhgmH2HORnAEYpSFsky8ExSyd1VA%3D%3D';

class App {
    constructor() {
        this.hasInit = false;
        this.marker = {};
        this.init();
    }

    init() {
        // console.log('Init by App');

        const location = new Location();
        location.getPosition()
            .then(data => {
                this.showMap(data);
            })
            .catch(error => {
                console.log(error);
            });

        this.setMarkerForBusStop();
    }

    setMarkerForBusStop() {
        this.getBusStopData()
            .then(res => {
                const list = res.ServiceResult.msgBody.itemList;
                console.log(list);

                list.forEach((value) => {
                    console.log(value);
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getBusStopData() {
        const uri = new URL('http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos');
        const params = {
            serviceKey: keyPublicData,
            tmX: 127.04233229999998,
            tmY: 37.5474537,
            radius: 300,
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

            // 마커 이미지의 주소
            var markerImageUrl = '/src/img/transparent.png', 
                markerImageSize = new daum.maps.Size(24, 24), // 마커 이미지의 크기
                markerImageOptions = { 
                    offset : new daum.maps.Point(12, 12)// 마커 좌표에 일치시킬 이미지 안의 좌표
                };

            // 마커 이미지를 생성한다
            var markerImage = new daum.maps.MarkerImage(markerImageUrl, markerImageSize, markerImageOptions);

            // 지도에 마커를 생성하고 표시한다
            this.marker.here = new daum.maps.Marker({
                position: new daum.maps.LatLng(latitude, longitude),
                // image: markerImage,
                map: this.map
            });

            // 주변 정류장 받아오기
            var uri = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos';
            var formData = new FormData();
            formData.append('serviceKey', keyPublicData);
            formData.append('tmX', longitude);
            formData.append('tmY', latitude);
            formData.append('radius', '300');

            // var params = {
            //     parameter1: 'value_1',
            //     parameter2: 'value 2',
            //     parameter3: 'value&3' 
            // };
            
            // var esc = encodeURIComponent;
            // var query = Object.keys(params)
            //     .map(k => esc(k) + '=' + esc(params[k]))
            //     .join('&');

            // fetch(uri, {
            //     mode: 'cors',
            //     // headers:{
            //     //     'Access-Control-Allow-Origin':'*'
            //     // },
            //     // qs: { 
            //     //     serviceKey: keyPublicData, 
            //     // } 
            // })
            // .then(res => {
            //     console.log(res);
            // })
            // .catch(error => {
            //     console.log(error);
            // });

            this.hasInit = true;
        }else {
            console.log('this.hasInit = true');
        }
    }
}

const app = new App();