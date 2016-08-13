/*
    HTML5 Robot User Interface Web Application
    An ASLab Project,
    Developed by Daniel Peiró
    ETSII, UPM 2016    
*/
// LeapJS by Leap Motion Inc.: https://github.com/leapmotion/leapjs

/***EXPERIMENTAL FEATURE***/
app.controller('LeapMotionController', ['$scope', 'SocketSrv',
	function(scope, SocketSrv) {
		scope.connected = false;


		var leapC = Leap.loop(function(frame) {

			var hands = {
				firstHand: {},
				secondHand: {},
			};

			if (frame.hands.length > 0) {
				hands.firstHand = {
					type: frame.hands[0].type,
					confidence: frame.hands[0].confidence,
					palmPosition: frame.hands[0].palmPosition,
					stabilizedPalmPosition: frame.hands[0].stabilizedPalmPosition,
					palmVelocity: frame.hands[0].palmVelocity,
					palmNormal: frame.hands[0].palmNormal,
					direction: frame.hands[0].direction,
					yaw: frame.hands[0].yaw(),
					pitch: frame.hands[0].pitch(),
					roll: frame.hands[0].roll(),
					grabStrength: frame.hands[0].grabStrength,
					pinchStrength: frame.hands[0].pinchStrength,
				};

				if (frame.hands.length >= 2) {
					hands.secondHand = {
						type: frame.hands[1].type,
						confidence: frame.hands[1].confidence,
						palmPosition: frame.hands[1].palmPosition,
						stabilizedPalmPosition: frame.hands[1].stabilizedPalmPosition,
						palmVelocity: frame.hands[1].palmVelocity,
						palmNormal: frame.hands[1].palmNormal,
						direction: frame.hands[1].direction,
						yaw: frame.hands[1].yaw(),
						pitch: frame.hands[1].pitch(),
						roll: frame.hands[1].roll(),
						grabStrength: frame.hands[1].grabStrength,
						pinchStrength: frame.hands[1].pinchStrength,
					};
				};
				console.log("hands");
			};
			SocketSrv.socket.emit('leapMotionUpdate', hands);
		});


		var updateLoop = setInterval(function() {
			scope.connected = leapC.streaming();
			scope.$applyAsync();
		}, 200);


		//stop frame receiving loop when leap motion module deactivated
		scope.$on('$destroy', function() {
			leapC.disconnect();
			clearInterval(updateLoop);
		});
	}
]);