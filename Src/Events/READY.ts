import { Client } from '../Client/Client';
import { ClientUser } from '../Client/ClientUser';
import Guild from '../Structures/Guild/Guild';
import Role from '../Structures/Guild/Role';
import Channel from '../Structures/Channel';
import GuildMember from '../Structures/GuildMember';
import User from '../Structures/User/User';
import Emoji from '../Structures/Emoji';
import { IGuild } from '../Interfaces/GuildOptions';
import { Payload } from '../Interfaces/Interfaces';
import { EVENTS } from '../Constants/Events';

export default class {
	public client: Client;
	public payload: Payload;

	constructor(client: Client, payload: Payload) {
		this.client = client;
		this.payload = payload;

		(async () => await this.generate(payload))();
		client.emit(EVENTS.READY);
	}

	private async generate(payload: Payload) {
		const { user, guilds }: { user: any; guilds: IGuild[] } = payload.d;

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

		for (let x of guilds) {
			const g = await this.client.getGuild(x.id);
			const afkChannel = g.afk_channel_id
				? this.client.getChannel(g.afk_channel_id)
				: null;

			const guild = new Guild(g, this.client);
			this.client.guilds.set(guild.id, guild);

			let channels = await this.client.getGuildChannels(g.id);
			for (let c of channels) {
				const channel = new Channel(
					c.id,
					c.type,
					g,
					c.position,
					c.permission_overwrites,
					c.name,
					c.topic,
					c.nsfw,
					c.bitrate,
					c.rate_limit,
					c.rate_limit_per_user,
					c.recipients,
					c.icon,
					c.owner_id,
					c.application_id,
					c.parent_id,
					c.last_pin_timestamp
				);
				guild.channels.set(channel.id, channel);
			}

			for (let role of g.roles) {
				let r = new Role(
					role.id,
					role.name,
					role.color,
					role.hoist,
					role.position,
					role.permissions,
					role.managed,
					role.metionable
				);

				this.client.roles.set(role.id, r);
				g.roles.push(r);
			}

			let members = await this.client.getGuildMembers(guild.id);
			for (let m of members) {
				const member = new GuildMember(
					m.user,
					m.nick,
					m.roles,
					m.joined_at,
					m.premium_since,
					m.deaf,
					m.mute
				);
				guild.members.set(member.id, member);
			}

			if (g.emojis.length) {
				for (let e of g.emojis) {
					const emoji = new Emoji(
						e.id,
						e.name,
						e.roles,
						e.user,
						e.req_colons,
						e.managed,
						e.animated,
						e.available
					);
					guild.emojis.set(emoji.id, emoji);
					this.client.emojis.set(emoji.id, emoji);
				}
			}

			let user = await this.client.getUser(m.user.id);

			user = new User(
				user.id,
				user.username,
				user.discriminator,
				user.avatar,
				user.bot,
				user.system,
				user.mfa_enabled,
				user.locale,
				user.verified,
				user.email,
				user.flags,
				user.premium_type,
				user.public_flags
			);

			m.user = user;
			this.client.users.set(user.id, user);
		}
	}
}
