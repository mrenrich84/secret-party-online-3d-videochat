import {Camera} from "@babylonjs/core";
import {Peer3d} from "./peer3d";

const millisFor30Fps = 1000 / 30;

export function sendCameraPositionFactory(peers: { [id: string]: Peer3d }) {
    let delta = 0;

    return (camera: Camera): void => {
        delta += camera.getScene().getEngine().getDeltaTime();

        if (delta > millisFor30Fps) {
            delta = 0;
            for (const peer in peers) {
                peers[peer].send(camera);
            }
        }
    };
}