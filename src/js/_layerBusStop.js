export default class LayerBusStop {
    constructor() {
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
                <p>${stop.stationId}</p>
            </div>
        `;
    }

    setOverlay(data) {
        const { template, map, marker, arsId } = data;

        this.overlayBusStop[arsId] = new daum.maps.CustomOverlay({
            content: template, 
            map: map, 
            position: marker.getPosition(), 
        });

        // bind click event that show layer
        daum.maps.event.addListener(marker, 'click', function() {
            this.overlayBusStop[arsId].setMap(map);
        }.bind(this));

        const elemOverlay = this.overlayBusStop[arsId].a;
        const btnCloseLayer = elemOverlay.querySelector('.btn__close-layer');

        // bind click event that hide layer
        btnCloseLayer.addEventListener('click', ev => {
            this.overlayBusStop[arsId].setMap(null);
        });
        // and hide layer
        this.overlayBusStop[arsId].setMap(null);
    }
}