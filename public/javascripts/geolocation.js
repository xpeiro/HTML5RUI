app.controller('GeolocationController', ['$scope', 'SocketSrv',
    function(scope, SocketSrv) {
        var geoMapball = {
            url: 'geomapball.svg',
            size: new google.maps.Size(245, 248),
            scaledSize: new google.maps.Size(10, 10),
            anchor: new google.maps.Point(5, 5),
        }
        var geoMapOptions = {
            center: new google.maps.LatLng(40.496534, -3.877457),
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            streetViewControl: false,
        };
        var geoMap = new google.maps.Map(document.getElementById('geolocationFrame'), geoMapOptions);
        var marker = new google.maps.Marker({
            icon: geoMapball,
            position: new google.maps.LatLng(40.496534, -3.877457),
        });
        var accuracyRadius = new google.maps.Circle({
            center: marker.position,
            radius: 10,
            strokeColor: "#018ed3",
            strokeOpacity: 0.4,
            strokeWeight: 1,
            fillColor: "#018ed3",
            fillOpacity: 0.4
        });

        marker.setMap(geoMap);
        accuracyRadius.setMap(geoMap);

        SocketSrv.socket.on('updateGeolocation', function(data) {
            marker.setPosition(new google.maps.LatLng(data.latitude, data.longitude));
            accuracyRadius.setRadius(Number(data.accuracyRadiusInMeters));
            accuracyRadius.setCenter(marker.getPosition());
            geoMap.panTo(marker.getPosition());
        });
    }
]);