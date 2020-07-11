import {
    Camera,
    Color3,
    Mesh,
    MeshBuilder,
    Quaternion, Scene,
    Sound,
    StandardMaterial,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
import {deserializer, serializer} from "./de-serializer";

const VIDEO_RATIO = 4/3;
const VIDEO_HEIGHT = 0.9;
const VIDEO_DIMENSIONS = {
    height: VIDEO_HEIGHT,
    width: VIDEO_RATIO * VIDEO_HEIGHT,
    depth: 0.05,
    sideOrientation: Mesh.FRONTSIDE
};

export class Peer3d {
    private peer: any;
    private scene: Scene;
    private id: string;
    private mesh: Mesh | undefined;
    
    constructor(peer: any, id: string, scene: Scene) {
        this.peer = peer;
        this.scene = scene;
        this.id = id;

        if (peer._remoteStreams[0]) {
            this.addTo(this.scene, peer._remoteStreams[0]);
        } else {
            peer.on('stream', (stream: MediaStream) => this.addTo(this.scene, stream));
        }

        peer.on('data', (data: any) => this.movePeer(data));
    }

    send(camera: Camera): void {
        try {
            this.peer.send(serializer(camera));
        } catch (e) {
            console.log(e);
        }
    }

    destroy(): void {
        this.mesh && this.mesh.dispose();
    }

    movePeer(buffer: Buffer): void {
        const {absoluteRotation, globalPosition} = deserializer(buffer);
        this.mesh && (this.mesh.rotationQuaternion = new Quaternion(absoluteRotation.x, absoluteRotation.y, absoluteRotation.z, absoluteRotation.w));
        this.mesh && this.mesh.setAbsolutePosition(new Vector3(globalPosition.x, globalPosition.y, globalPosition.z));
    }

    private addSpatialAudio(stream: MediaStream, scene: Scene, box: Mesh): void {
        // this is for testing purposes
        // const remoteSound = new Sound("music", "/asset/audio.mp3", scene, null, {
        //     loop: true,
        //     autoplay: true,
        //     spatialSound: true,
        //     distanceModel: "exponential",
        //     maxDistance: 100,
        //     rolloffFactor: 1.3
        // });
        const audio = new Audio();
        audio.muted = true;
        audio.srcObject = stream;
        const remoteSound = new Sound(`RemoteSound_${this.id}`, stream, scene, null, {
            streaming: true,
            autoplay: true,
            spatialSound: true,
            loop: true,
            distanceModel: "exponential",
            maxDistance: 100,
            rolloffFactor: 1.3
        });
        remoteSound.attachToMesh(box);
        remoteSound.setDirectionalCone(90, 180, 0.3);
        remoteSound.setLocalDirectionToMesh(new Vector3(0, 0, 1));
    }

    private getMaterial(scene: Scene): StandardMaterial {
        const mat = new StandardMaterial(`VideoBoxMaterial_${this.id}`, scene);
        mat.diffuseColor = new Color3(0, 0, 0);
        return mat;
    }

    private getVideoPanelMaterial(videoTexture: VideoTexture, scene: Scene): StandardMaterial {
        const videoPanelMaterial = new StandardMaterial(`VideoPanelMaterial_${this.id}`, scene);
        videoPanelMaterial.roughness = 1;
        videoPanelMaterial.emissiveColor = Color3.White();
        videoPanelMaterial.diffuseTexture = videoTexture;
        return videoPanelMaterial;
    }

    private getVideoPanel(): Mesh {
        const videoPanel = MeshBuilder.CreatePlane("VideoPanel", VIDEO_DIMENSIONS);
        if (this.mesh) videoPanel.position = new Vector3(0, 0, (VIDEO_DIMENSIONS.depth /2 +0.001));
        videoPanel.toLeftHanded();
        return videoPanel;
    }

    private getBox(): Mesh {
        const box = MeshBuilder.CreateBox(`VideoBox_${this.id}`, {
            sideOrientation: VIDEO_DIMENSIONS.sideOrientation,
            width: VIDEO_DIMENSIONS.width + 0.1,
            height: VIDEO_DIMENSIONS.height + 0.1,
            depth: VIDEO_DIMENSIONS.depth
        });
        box.position = new Vector3(0, 0, 0);
        box.checkCollisions = true;
        return box;
    }

    private CreateFromStreamAsync(scene: Scene, stream: MediaStream): Promise<VideoTexture> {
        console.log(stream);
        const video: HTMLVideoElement = document.createElement("video");
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', 'true');
        video.setAttribute('playsinline', '');
        video.id = `remote-video-${this.id}`;
        video.muted = true;

        if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
        } else {
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            } else {
                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                video.src = (window.URL && window.URL.createObjectURL(stream));
            }
        }

        return new Promise((resolve) => {
            const onPlaying = (): void => {
                resolve(new VideoTexture(`VideoTextureStream_${this.id}`, video, scene, true, false));
                video.removeEventListener("playing", onPlaying);
            };

            video.addEventListener("playing", onPlaying);
            video.play();
        });
    }

    private addTo(scene: Scene, stream: MediaStream): void {
        this.CreateFromStreamAsync(scene, stream)
            .then(videoTexture => {
                this.mesh = this.getBox();
                this.mesh.material = this.getMaterial(scene);

                const videoPanel = this.getVideoPanel();
                videoPanel.material = this.getVideoPanelMaterial(videoTexture, scene);
                this.mesh.addChild(videoPanel);
                videoPanel.receiveShadows = true;
                this.mesh.receiveShadows = true;
                scene.addMesh(this.mesh);
                this.addSpatialAudio(stream, scene, this.mesh);
            });
    }
}