'use strict';
var videoElement = document.querySelector('video');
var videoSelect = document.querySelector('select#videoSource');
var theStream;
var capabilities;
var track;
var canvas = document.getElementById('canvas');
var photo = document.getElementById('imageTag');
videoSelect.onchange = getStream;
getStream().then(getDevices).then(gotDevices);

    function getUserMedia(options, successCallback, failureCallback) {
        var api = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (api) {
            return api.bind(navigator)(options, successCallback, failureCallback);
        }
    }


    function getStream() {
          if (window.stream) {
            window.stream.getTracks().forEach(track => {
              track.stop();
            });
          }
          const videoSource = videoSelect.value;
          const constraints = {
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
          };

        return navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
    }
    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        videoSelect.selectedIndex = [...videoSelect.options].
            findIndex(option => option.text === stream.getVideoTracks()[0].label);
        videoElement.srcObject = stream;
        canvas.setAttribute('width', videoElement.scrollWidth);
        canvas.setAttribute('height', videoElement.scrollHeight);
    }
    function takePhoto() {
        if (!('ImageCapture' in window)) {
            alert('ImageCapture is not available');
            return;
        }
        theStream = window.stream;
        if (!theStream) {
            alert('Grab the video stream first!');
            return;
        }

        var theImageCapturer = new ImageCapture(theStream.getVideoTracks()[0]);

        theImageCapturer.takePhoto()
            .then(blob => {
                var theImageTag = document.getElementById("imageTag");
                var context = canvas.getContext('2d');
                canvas.width = theImageCapturer.width;
                canvas.height = theImageCapturer.height;
                context.drawImage(videoElement, 0, 0, theImageCapturer.width, theImageCapturer.height);
                theImageTag.src = URL.createObjectURL(blob);
            })
            .catch(err => alert('Error: ' + err));
    }
    // function takePhoto() {
    //     var context = canvas.getContext('2d');
    //     if (photo.width && photo.height) {
    //       canvas.width = photo.width;
    //       canvas.height = photo.height;
    //       context.drawImage(videoElement, 0, 0, photo.width, photo.height);
        
    //       var data = canvas.toDataURL('image/png');
    //       photo.setAttribute('src', data);
    //     } else {
    //       clearphoto();
    //     }
    //   }
    function savePhoto2() {
        var gh = document.getElementById('imageTag');

        var a = document.createElement('a');
        a.href = gh;
        a.download = 'image.png';

        a.click()

    }

    function savePhoto() {
        var image = document.querySelector('img'); // Image you want to save
        var saveImg = document.createElement('a'); // New link we use to save it with
        saveImg.href = image.src // Assign image src to our link target
        saveImg.download = "vantay.jpg"; // set filename for download
        saveImg.innerHTML = "Click to save image"; // Set link text
        saveImg.click();
    }
    function getDevices() {
      // AFAICT in Safari this only gets default devices until gUM is called :/
      return navigator.mediaDevices.enumerateDevices();
    }

    function gotDevices(deviceInfos) {
      window.deviceInfos = deviceInfos; // make available to console
      console.log('Available input and output devices:', deviceInfos);
      for (const deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
          option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
          videoSelect.appendChild(option);
        }
      }
    }

    function updateFocus(){
        track = stream.getVideoTracks()[0];
        capabilities = track.getCapabilities();
        const focusiput = document.getElementById('focusInput');
            // Check whether focusDistance is supported or not.
        if (!('focusDistance' in capabilities)) {
            return alert('focusDistance is not supported by ' + track.label);
        }
        
        // Map focusDistance to a slider element.
        focusiput.min = capabilities.focusDistance.min + 0.00001
        focusiput.max = capabilities.focusDistance.max;
        focusiput.step = capabilities.focusDistance.step;
        focusiput.value = settings.focusDistance;
        
        focusiput.oninput = function(event) {
            console.log(" focusInput.value = ", focusiput.value);
            track.applyConstraints({advanced : [{focusMode: "manual", focusDistance: event.target.value}]});
        }
    }
    function updateZoom(){
        track = stream.getVideoTracks()[0];
        capabilities = track.getCapabilities();
        const settings = track.getSettings();
        const zoominput = document.getElementById('zoomInput');
        // Check whether zoom is supported or not.
        if (!('zoom' in capabilities)) {
            return alert('Zoom is not supported by ' + track.label);
        }

        // Map zoom to a slider element.
        zoominput.min = capabilities.zoom.min + 0.1;
        alert('hehe ' + capabilities.zoom.min);
        zoominput.max = capabilities.zoom.max;
        zoominput.step = capabilities.zoom.step;
        zoominput.value = settings.zoom;
        zoominput.oninput = function(event) {
            track.applyConstraints({advanced: [ {zoom: event.target.value} ]});
        }
        zoominput.hidden = false;
    }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
    function handleError(error) {
        console.error('Error: ', error);
    }