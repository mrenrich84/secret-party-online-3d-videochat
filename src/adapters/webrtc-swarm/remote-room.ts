import { MyPosition, Peer, RemoteRoom, MyStream } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import swarm from "./webrtc-swarm";

/// <reference path="signalhub.d.ts"/>
import signalhub from "signalhub";
import { PeerSimplePeer } from "../simple-peer/peer-simple-peer";
import SimplePeer from "simple-peer";

export class RemoteRoomSwarmSignalHub implements RemoteRoom {
    private myPeers: PeerSimplePeer[] = [];
    onNewPeer = new MyEventEmitter<Peer>();
    private stream: MyStream | undefined;

    async join(): Promise<void> {
        // @ts-ignore
        window.myPeers = this.myPeers;
        const hub = signalhub("lets-party", [process.env.HUB_URL]);
        console.log(hub);
        const turnServer = process.env.TURN_IP;
        const sw = swarm(hub, {
            config: {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: `stun:${turnServer}:3478` },
                    {
                        urls: `turn:${turnServer}:3478`,
                        username: "username1",
                        credential: "password1",
                    },
                ],
            },
        }) as any;

        sw.on("connect", async (peer: SimplePeer.Instance, id: string) => {
            console.log(`PEER ID ${id} --> Connected to new peer:`, peer);
            console.log("total peers:", sw.peers.length);
            const myPeer = new PeerSimplePeer(peer, id);
            this.myPeers.push(myPeer);
            await this.onNewPeer.emit(myPeer);

            // This is bad...
            // There is a race condition where the other peer might not be ready to receive a stream in time
            // TODO implementing some messaging protocol to manage these race conditions
            setTimeout(() => {
                console.log(
                    `PEER ID ${id} --> sending localStream`,
                    this.stream
                );
                if (this.stream) {
                    myPeer.sendLocalStream(this.stream);
                }
            }, 1_000);
        });

        sw.on("disconnect", (peer: any, id: string) => {
            console.log(`PEER ID ${id} --> Disconnected`);
            console.log("total peers:", sw.peers.length);
            const myPeer = this.findPeer(id);
            myPeer?.onDisconnect.emit();
        });
    }

    async getPeers(): Promise<Peer[]> {
        return this.myPeers;
    }

    async broadcastLocalPosition(localPosition: MyPosition): Promise<void> {
        await Promise.all(
            this.myPeers.map((myPeer) =>
                myPeer.sendLocalPosition(localPosition)
            )
        );
    }

    private findPeer(id: string): Peer | undefined {
        return this.myPeers.find((peer) => peer.id === id);
    }

    async sendLocalStream(stream: MyStream): Promise<void> {
        this.stream = stream;
        await Promise.all(
            this.myPeers.map((myPeer) => myPeer.sendLocalStream(stream))
        );
    }
}
