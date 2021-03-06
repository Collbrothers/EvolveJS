/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-mixed-spaces-and-tabs */
import { EvolveSocket } from "./Websocket";
import { OPCODE, Heartbeat, Identify, VoiceStateUpdate } from "../..";
import { Payload } from "../../Interfaces/Interfaces";
import { Data } from "ws";
import { promisify } from "util";
import { EventEmitter } from "events";
import { VoiceGateway } from "./Voice/VoiceGateway";
import { EVENTS } from "../../Utils/Constants";
import { VoiceState } from "../../Structures/Guild/VoiceState";

export class Gateway extends EventEmitter {
	public data!: Data;
	public ws!: EvolveSocket;
	public launchedShards: Set<Payload> = new Set()
	public voice!: VoiceGateway;
	public voiceStateUpdate!: VoiceState;
	public voiceServerUpdate!: Payload;


	public init(data: Data, ws: EvolveSocket): void {
		this.data = data;
		this.ws = ws;

		try {
			const payload: Payload = JSON.parse(this.data.toString());
			const { op, t, d } = payload;
			if (!d) return;

			if (op === OPCODE.Hello) {
				// Command: Heartbeat
				setInterval(() => {
					if (this.ws.seq) Heartbeat.d = this.ws.seq;
					this.ws.send(JSON.stringify(Heartbeat));
				}, d.heartbeat_interval);

				for(let i = 0; i  < this.ws.builder.shards; i++) {
					promisify(setTimeout)(5e3 * i).then(() => {
						this._spawn(i);
					});
				}
			} else if (t) {
				try {
					(async() => {
						const { default: handler } = await import(`./Events/${t}`);
						new handler(this.ws.client, payload);
					})();
				} catch (e) {
					throw Error(e);
				}
			}
		} catch (e) {
			throw Error(e);
		}
	}

	private _spawn(shard: number): void {
		Identify.d.token = this.ws.client.token;
		Identify.d.activity = this.ws.builder.activity;
		Identify.d.shard = [shard, this.ws.builder.shards];
		Identify.d.intents = this.ws.builder.intents;

		if(this._debug(Identify)) {
			this.ws.send(JSON.stringify(Identify));
		}
	}

	private _debug(payload: Payload): boolean {
		if(this.launchedShards.has(payload)) {
			return false;
	   } else if(!this.launchedShards.has(payload)) {
		   this.launchedShards.add(payload);
	   }

		this.emit("shardSpawn", payload);
		return true;
	}

	public sendVoiceStateUpdate(guildID: string, channelID: string, options?: {
        self_deaf: boolean,
        self_mute: boolean
    }, initialize = false): void {

		VoiceStateUpdate.d.guild_id = guildID;
		VoiceStateUpdate.d.channel_id = channelID;
		if(options) {
			VoiceStateUpdate.d.self_deaf = options.self_deaf;
			VoiceStateUpdate.d.self_mute = options.self_mute;
		}

		this.ws.send(JSON.stringify(VoiceStateUpdate));

		this.ws.client.on(EVENTS.VOICE_STATE_UPDATE, (pk) => {
			if(pk.member.user.id !== this.ws.client.user.id) return;
			this.voiceStateUpdate = pk;
		});

		this.ws.client.on(EVENTS.VOICE_SERVER_UPDATE, (pk) => {
			this.voiceServerUpdate = pk;
			if(this.voiceStateUpdate && this.voiceServerUpdate) {
				this.voice = new VoiceGateway(this);
				this.voice.emit("packetReady", (this.voiceStateUpdate, this.voiceServerUpdate));
				if(initialize) this.voice.init();
			}
		});
	}
}
