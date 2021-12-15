
//  { facingMode: "user" } 
// what is this?

// source
//https://jameshfisher.com/2020/08/09/how-to-implement-green-screen-in-the-browser/    


function body_onload() {

	if (!navigator.mediaDevices.getUserMedia) {
		alert("navigator.mediaDevices.getUserMedia not found")
		return;
	}

    const blitCanvas = new OffscreenCanvas(0, 0);  // size dynamically assigned per frame
	var blitCtx;
	
	var display = document.getElementById("displayCanvas");
	var displayCtx;

	var resized = false;	

	var video = document.querySelector("#videoElement");



	var processFrame = function(now, metadata) {

		if (!resized) {
			blitCanvas.width = video.videoWidth;
			blitCanvas.height = video.videoHeight;

          	display.style.width = video.videoWidth;
          	display.style.height = video.videoHeight;
			display.width = video.videoWidth;
          	display.height = video.videoHeight;

	        blitCtx = blitCanvas.getContext("2d");
		    displayCtx = display.getContext("2d");

			resized = true;
		}

		//console.log("processFrame", video.videoWidth, video.videoHeight);

  		blitCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  		const imageData = blitCtx.getImageData(0, 0, video.videoWidth, video.videoHeight);

		const numPixels = imageData.data.length / 4;
		for (let i = 0; i < numPixels; i++) {
			const r = imageData.data[i * 4 + 0];
			const g = imageData.data[i * 4 + 1];
			const b = imageData.data[i * 4 + 2];
			//imageData.data[i * 4 + 3] = 255;
		}

  		displayCtx.putImageData(imageData, 0, 0);

		//displayCtx.fillStyle = 'green';
		//displayCtx.fillRect(20, 10, 150, 100);

		//displayCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);


		video.requestVideoFrameCallback(processFrame);
	};	

  	navigator.mediaDevices.getUserMedia({ video: true })
	  	.then(function (stream) {
	    	video.srcObject = stream;
	    	video.play();
	    	video.requestVideoFrameCallback(processFrame);
	    }).catch(function (err) {
	      console.log("camera error!");
	    });


}