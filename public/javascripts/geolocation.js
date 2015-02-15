app.controller('GeolocationController', ['$scope', 'GeneralSrv',
    function($scope, GeneralSrv) {
        var mapball = {
            url: 'mapball.svg',
            size: new google.maps.Size(245, 248),
            scaledSize: new google.maps.Size(10, 10),
            anchor: new google.maps.Point(5, 5),            
        }
        var mapOptions = {
            center: new google.maps.LatLng(40.496534, -3.877457),
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            streetViewControl: false,
        };
        var map = new google.maps.Map(document.getElementById('geolocation'), mapOptions);
        var marker = new google.maps.Marker({
            icon: mapball,
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

        marker.setMap(map);
        accuracyRadius.setMap(map);

        GeneralSrv.socket.on('updateGeolocation', function(data) {
            marker.setPosition(new google.maps.LatLng(data.latitude, data.longitude));
            accuracyRadius.setCenter(marker.getPosition());
            accuracyRadius.setRadius(Number(data.accuracyRadiusInMeters));
            map.panTo(marker.getPosition());
        });
    }
]);