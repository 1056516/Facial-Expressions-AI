const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const expressionText = document.getElementById('expressionText');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModels() {
    // Update the URL to fetch models from the Flask server
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

async function detectFace() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (detections.length > 0) {
        const canvas = faceapi.createCanvasFromMedia(video);
        overlay.append(canvas);
        faceapi.matchDimensions(canvas, video);
        const resizedDetections = faceapi.resizeResults(detections, video);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        const expression = analyzeExpression(detections[0].landmarks);
        expressionText.textContent = expression;
        expressionText.classList.remove('hidden');
    } else {
        expressionText.classList.add('hidden');
    }

    requestAnimationFrame(detectFace);
}

function analyzeExpression(landmarks) {
    // Simple heuristic to detect a smile
    const mouth = landmarks.getMouth();
    const mouthHeight = mouth[6].y - mouth[0].y; // Calculate open/close difference

    if (mouthHeight > 15) {
        return 'You look happy!';
    } else {
        return 'Please smile!';
    }
}

async function main() {
    await loadModels();
    await setupCamera();
    video.play();
    detectFace();
}

main();
