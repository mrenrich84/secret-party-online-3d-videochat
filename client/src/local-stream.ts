const userMediaConstraints = {
    audio: true,
    video: {
        width: {
            ideal: 160,
            max: 640
        },
        height: {
            ideal: 120,
            max: 480
        },
        frameRate: {
            ideal: 20,
            max: 30
        },
        facingMode: 'user'
    }
};

export function getLocalStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    return navigator.mediaDevices.getUserMedia(userMediaConstraints)
}

export function showLocalVideoStream(stream: MediaStream): void {
    console.log('Adding local stream.');
    const localVideo = document.querySelector('#localVideo');
    if (localVideo) {
        (localVideo as HTMLVideoElement).srcObject = stream;
    }
}