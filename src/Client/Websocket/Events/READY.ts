/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { EvolveClient, Payload, EVENTS, ClientUser } from "../../..";
import { Guild } from "../../../Structures/Guild/Guild";


export default class {
	public client: EvolveClient;
	public payload: Payload;

	constructor(client: EvolveClient, payload: Payload) {
		this.client = client;
		this.payload = payload;

		(async () => await this.generate(payload))();
		client.emit(EVENTS.READY);
	}

	private async generate(payload: Payload) {
		const { user, guilds } = payload.d;

		this.client.user = new ClientUser(
			user.username,
			user.discriminator,
			user.verified,
			user.id,
			user.flags,
			user.email,
			user.bot,
			user.avatar
		);

		for(const g of guilds) {
			const fetched: Guild = await this.client.api.getGuild(g.id);

			for(const [k, v] of fetched.members) {
				if(this.client.options.enableUsersCache) this.client.users.set(k, v.user!);
			}

			for(const [k, v] of fetched.channels) {
				if(this.client.options.enableChannelCache) this.client.channels.set(k, v);
			}

			for(const [k, v] of fetched.emojis) {
				if(this.client.options.enableEmojiCache) this.client.emojis.set(k, v);
			}

			for(const [k, v] of fetched.roles) {
				this.client.roles.set(k, v);
			}

			if(this.client.options.enableGuildCache) this.client.guilds.set(fetched.id, fetched);
		}
	}
}
