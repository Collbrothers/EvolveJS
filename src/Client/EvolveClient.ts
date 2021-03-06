import { Guild, Channel, User, Emoji, Role, Message, ClientUser, ClientOptions, API } from "..";
import { Objex } from "@evolvejs/objex";
import { EventEmitter } from "events";
import { Gateway } from "./Websocket/Gateway";
import { Oauth2 } from "../Oauth2/Oauth2";
import { Structures } from "../Structures/Structures";

export class EvolveClient extends EventEmitter {
	public token: string;
	public options: ClientOptions;
	public guilds: Objex<string, Guild> = new Objex();
	public channels: Objex<string, Channel> = new Objex();
	public users: Objex<string, User> = new Objex();
	public emojis: Objex<string | null, Emoji> = new Objex();
	public roles: Objex<string, Role> = new Objex()
	public messages: Objex<string, Message> = new Objex()
	private _user!: ClientUser;
	public api: API = new API(this)
	public oauth2!: Oauth2
	public ws: Gateway = new Gateway()
	public secret!: string;
	public structures: Structures = new Structures();

	public constructor (
		token: string,
		options: ClientOptions
	) {
		super();
		this.token = token;
		this.options = options;
		if (!this.token) throw Error("TOKEN_ERROR");
	}


	public get user(): ClientUser {
		return this._user;
	}

	public set user(user: ClientUser) {
		this._user = user;
	}
	public on(event, ...listener) {
		if(event === "newMessage") {
			super.on(event,listener[0](new (this.structures.get("Message"))(listener[0].data, listener[0].channel, listener[0].guild)))
		}
	}
	public emit(event, data) {
		if(event === "newMessage") {
		super.emit(event, (new (this.structures.get("Message"))(data.data, data.channel, data.guild)))
		}
	}
}
