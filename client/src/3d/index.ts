import {Camera, Engine, Scene} from "@babylonjs/core";
import {createScene} from './scene';
import {Peer3d} from "./peer3d";
import {sendCameraPositionFactory} from "./send-camera-position";

export class ThreeD {
    private readonly peers: { [id: string]: Peer3d };
    private readonly canvas: HTMLCanvasElement;
    private readonly engine: Engine;
    private readonly scene: Scene;
    private readonly camera: Camera;

    constructor() {
        this.peers = {};

        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(
            this.canvas,
            true, {
                preserveDrawingBuffer: true,
                stencil: true
            });
        if (!this.engine) throw 'engine should not be null.';
        this.scene = createScene(this.engine, this.canvas);

        // @ts-ignore
        window.scene = this.scene; // TODO remove me
        this.camera = this.scene.cameras[0];
        this.camera.onViewMatrixChangedObservable.add(sendCameraPositionFactory(this.peers));

        // Resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    startEngine(): void {
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
    }

    addPeer(peer: any, id: string): void {
        this.peers[id] = new Peer3d(peer, id, this.scene);
    }

    removePeer(id: string): void {
        this.peers[id].destroy();
        delete this.peers[id];
        console.log(this.peers);
    }
}
