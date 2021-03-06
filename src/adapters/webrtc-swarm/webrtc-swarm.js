const SimplePeer = require("simple-peer");
const inherits = require("inherits");
const events = require("events");
const through = require("through2");
const cuid = require("cuid");
const once = require("once");
const debug = require("debug")("webrtc-swarm");

module.exports = WebRTCSwarm;

function WebRTCSwarm(hub, opts) {
    if (!(this instanceof WebRTCSwarm)) return new WebRTCSwarm(hub, opts);
    if (!hub) throw new Error("SignalHub instance required");
    if (!opts) opts = {};

    events.EventEmitter.call(this);
    this.setMaxListeners(0);

    this.hub = hub;
    this.wrtc = opts.wrtc;
    this.channelConfig = opts.channelConfig;
    this.config = opts.config;
    this.stream = opts.stream;
    this.wrap =
        opts.wrap ||
        function (data) {
            return data;
        };
    this.unwrap =
        opts.unwrap ||
        function (data) {
            return data;
        };
    this.offerConstraints = opts.offerConstraints || {};
    this.maxPeers = opts.maxPeers || Infinity;
    this.me = opts.uuid || cuid();
    debug("my uuid:", this.me);

    this.remotes = {};
    this.peers = [];
    this.closed = false;

    subscribe(this, hub);
}

inherits(WebRTCSwarm, events.EventEmitter);

WebRTCSwarm.WEBRTC_SUPPORT = SimplePeer.WEBRTC_SUPPORT;

WebRTCSwarm.prototype.close = function (cb) {
    if (this.closed) return;
    this.closed = true;

    if (cb) this.once("close", cb);

    const self = this;
    this.hub.close(function () {
        const len = self.peers.length;
        if (len > 0) {
            let closed = 0;
            self.peers.forEach(function (peer) {
                peer.once("close", function () {
                    if (++closed === len) {
                        self.emit("close");
                    }
                });
                process.nextTick(function () {
                    peer.destroy();
                });
            });
        } else {
            self.emit("close");
        }
    });
};

function setup(swarm, peer, id) {
    peer.on("connect", function () {
        debug("connected to peer", id);
        swarm.peers.push(peer);
        swarm.emit("peer", peer, id);
        swarm.emit("connect", peer, id);
    });

    const onclose = once(function (err) {
        debug("disconnected from peer", id, err);
        if (swarm.remotes[id] === peer) delete swarm.remotes[id];
        const i = swarm.peers.indexOf(peer);
        if (i > -1) swarm.peers.splice(i, 1);
        swarm.emit("disconnect", peer, id);
    });

    const signals = [];
    let sending = false;

    function kick() {
        if (swarm.closed || sending || !signals.length) return;
        sending = true;
        let data = { from: swarm.me, signal: signals.shift() };
        data = swarm.wrap(data, id);
        swarm.hub.broadcast(id, data, function () {
            sending = false;
            kick();
        });
    }

    peer.on("signal", function (sig) {
        signals.push(sig);
        kick();
    });

    peer.on("error", onclose);
    peer.once("close", onclose);
}

function shouldShowDisplay() {
    return new URL(location).searchParams.get("showDisplay");
}

function updateBandwidthRestriction(sdp, bandwidth) {
    let modifier = "AS";
    if (adapter.browserDetails.browser === "firefox") {
        bandwidth = (bandwidth >>> 0) * 1000;
        modifier = "TIAS";
    }
    if (sdp.indexOf("b=" + modifier + ":") === -1) {
        // insert b= after c= line.
        sdp = sdp.replace(
            /c=IN (.*)\r\n/,
            "c=IN $1\r\nb=" + modifier + ":" + bandwidth + "\r\n"
        );
    } else {
        sdp = sdp.replace(
            new RegExp("b=" + modifier + ":.*\r\n"),
            "b=" + modifier + ":" + bandwidth + "\r\n"
        );
    }
    return sdp;
}

function subscribe(swarm, hub) {
    hub.subscribe("all").pipe(
        through.obj(function (data, enc, cb) {
            data = swarm.unwrap(data, "all");
            if (swarm.closed || !data) return cb();

            debug("/all", data);
            if (data.from === swarm.me) {
                debug("skipping self", data.from);
                return cb();
            }

            if (data.type === "connect") {
                if (swarm.peers.length >= swarm.maxPeers) {
                    debug("skipping because maxPeers is met", data.from);
                    return cb();
                }
                if (swarm.remotes[data.from]) {
                    debug("skipping existing remote", data.from);
                    return cb();
                }

                debug("connecting to new peer (as initiator)", data.from);
                const peer = new SimplePeer({
                    wrtc: swarm.wrtc,
                    initiator: true,
                    channelConfig: swarm.channelConfig,
                    config: swarm.config,
                    stream: swarm.stream,
                    offerConstraints: swarm.offerConstraints,
                    sdpTransform: (sdp) => {
                        if (shouldShowDisplay()) {
                            sdp = sdp.replace(
                                "useinbandfec=1",
                                "useinbandfec=1; stereo=1; maxaveragebitrate=160000"
                            );
                        }
                        return updateBandwidthRestriction(sdp, 150);
                    },
                });

                setup(swarm, peer, data.from);
                swarm.remotes[data.from] = peer;
            }

            cb();
        })
    );

    hub.subscribe(swarm.me)
        .once("open", connect.bind(null, swarm, hub))
        .pipe(
            through.obj(function (data, enc, cb) {
                data = swarm.unwrap(data, swarm.me);
                if (swarm.closed || !data) return cb();

                let peer = swarm.remotes[data.from];
                if (!peer) {
                    if (!data.signal || data.signal.type !== "offer") {
                        debug("skipping non-offer", data);
                        return cb();
                    }

                    debug(
                        "connecting to new peer (as not initiator)",
                        data.from
                    );
                    peer = swarm.remotes[data.from] = new SimplePeer({
                        wrtc: swarm.wrtc,
                        channelConfig: swarm.channelConfig,
                        config: swarm.config,
                        stream: swarm.stream,
                        offerConstraints: swarm.offerConstraints,
                    });

                    setup(swarm, peer, data.from);
                }

                debug("signalling", data.from, data.signal);
                peer.signal(data.signal);
                cb();
            })
        );
}

function connect(swarm, hub) {
    if (swarm.closed || swarm.peers.length >= swarm.maxPeers) return;
    let data = { type: "connect", from: swarm.me };
    data = swarm.wrap(data, "all");
    hub.broadcast("all", data, function () {
        setTimeout(
            connect.bind(null, swarm, hub),
            Math.floor(Math.random() * 2000) +
                (swarm.peers.length ? 13000 : 3000)
        );
    });
}
