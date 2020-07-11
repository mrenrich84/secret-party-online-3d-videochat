import {ThreeD} from "./3d";
import {Network} from "./network/index";
import {getLocalStream, showLocalVideoStream} from "./local-stream";

function init(): void {
    const overlay = document.getElementById('overlay');
    overlay?.remove();

    const myThreeD = new ThreeD();
    myThreeD.startEngine();

    getLocalStream()
        .then(localStream => {
            showLocalVideoStream(localStream);

            const networkLayer = new Network();
            networkLayer.onPeerConnect = (peer: any, id: string): void => {
                myThreeD.addPeer(peer, id);
                peer.addStream(localStream);
            };
            networkLayer.onPeerDisconnect = (peer: any, id: string): void => {
                myThreeD.removePeer(id);
            };
            networkLayer.connect();
            
        })
        .catch(console.log);
}

const startButton = document.getElementById('startButton');
startButton?.addEventListener('click', init);
