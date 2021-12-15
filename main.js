/*

 { facingMode: "user" } 
 what is this?

source
https://jameshfisher.com/2020/08/09/how-to-implement-green-screen-in-the-browser/    

https://stackoverflow.com/questions/1664785/resize-html5-canvas-to-fit-window



set camera resolution
	get a list of which modes camera supports
aspect ratio






*/



if (window.performance.now) {
    console.log("Using high performance timer");
    getTimestamp = function() { return window.performance.now(); };
} else {
    if (window.performance.webkitNow) {
        console.log("Using webkit high performance timer");
        getTimestamp = function() { return window.performance.webkitNow(); };
    } else {
        console.log("Using low performance timer");
        getTimestamp = function() { return new Date().getTime(); };
    }
}

var DELAY = 1000;

function body_onload() {

	if (!navigator.mediaDevices.getUserMedia) {
		alert("navigator.mediaDevices.getUserMedia not found")
		return;
	}

    const blitCanvas = new OffscreenCanvas(0, 0);  // size dynamically assigned per frame
	var blitCtx;



	var display = document.getElementById("display");
	var displayCtx;

	var displaysDiv = document.getElementById("displays");
/*

	var numDisplays = 4;
	var displays = new Array(numDisplays);
	var displayCtxs = new Array(displays.length);
	for(var i = 0; i < displays.length; i++) {
		// <canvas id="display0" style="background-color: black;" width="320" height="240"></canvas>

		var display = document.createElement("canvas");
		display.width = 320;
		display.height = 240;
		display.style.width = 320;
		display.style.height = 240;
		//display.className  = "myClass";
		display.id = "display" + i;

		displaysDiv.appendChild(display);
		displays[i] = display;
		//displays[i] = document.getElementById("display" + i);
	}
	
*/
	var resized = false;	

	var video = document.querySelector("#videoElement");


	var times = [];
	var frames = [];

	var vidW = 320, vidH = 240;
	var outW = 320, outH = 240;


	var processFrame = function(now, metadata) {

		var ts = getTimestamp();

		if (!resized) {

			vidW = video.videoWidth;
			vidH = video.videoHeight;
			console.log(video.videoWidth , video.videoHeight);


			var canvasH = window.innerHeight;
			var canvasW = canvasH * vidW / vidH; // TODO check if page w > h really 

			outH = Math.floor(canvasH / 4);
			outW = Math.floor(canvasW / 4);

			display.style.width = display.width = outW * 4;
          	display.style.height = display.height = outH * 4;

			blitCanvas.width = outW;
			blitCanvas.height = outH;

          	//console.log(window.innerWidth, window.innerHeight);
          	//console.log(display.width, display.height);
          	displayCtx = display.getContext("2d");
		
			//for(var i = 0; i < displays.length; i++) {
			//	displayCtxs[i] = displays[i].getContext("2d");
			//}

	        blitCtx = blitCanvas.getContext("2d");

			resized = true;
		}

		//console.log("processFrame", video.videoWidth, video.videoHeight);

  		blitCtx.drawImage(video, 0, 0, outW, outH);
  		const imageData = blitCtx.getImageData(0, 0, outW, outH);

  		frames.push(imageData);
  		times.push(ts);


  		// removes too old frames:

  		var DISPLAY_COUNT = 16;

  		var old_limit = (DISPLAY_COUNT + 0.2) * DELAY;

  		var k;
		for(k = 0; k < frames.length; k++) {
			if (times[k] >= ts - old_limit) {
				break;
			}
		}
		if (k > 0) {
			times.splice(0, k);
			frames.splice(0, k);
		}

		//console.log(times);

		//const numPixels = imageData.data.length / 4;
		//for (let i = 0; i < numPixels; i++) {
		//	const r = imageData.data[i * 4 + 0];
		//	const g = imageData.data[i * 4 + 1];
		//	const b = imageData.data[i * 4 + 2];
		//	//imageData.data[i * 4 + 3] = 255;
		//}



		var displayInd = 0;
		for(var k = frames.length - 1; k >= 0; k--) {
			var limit = ts - displayInd * DELAY;
			if (times[k] <= limit) {
				//console.log("found " + times[k] + " for " + displayInd );
				//displayCtxs[displayInd].putImageData(frames[k], 0, 0);
				var i = displayInd % 4;
				var j = Math.floor(displayInd / 4);
				displayCtx.putImageData(frames[k], outW * i, outH * j);

				displayInd++;
				if (displayInd >= DISPLAY_COUNT) 
					break;
			}
		}

		//for(var i = 0; i < displays.length; i++) {
			//var ind = (framesIndex - 1) - i * 10;
			//ind = (ind + frames.length) % frames.length;
			//if (frames[ind])
	  		//	displayCtxs[i].putImageData(frames[ind], 0, 0);
		//}
  		
		//displayCtx.fillStyle = 'green';
		//displayCtx.fillRect(20, 10, 150, 100);

		//displayCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);


		video.requestVideoFrameCallback(processFrame);
	};	

	var constraints = { 
	    video: {
	        width: { ideal: 320 },
	        height: { ideal: 240 } 
	    } 
	};


  	navigator.mediaDevices.getUserMedia(constraints)
	  	.then(function (stream) {
	    	video.srcObject = stream;
	    	video.play();
	    	video.requestVideoFrameCallback(processFrame);
	    }).catch(function (err) {
	      	alert("camera error!");
	      	return;
	    });


}