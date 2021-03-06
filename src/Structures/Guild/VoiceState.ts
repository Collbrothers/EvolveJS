/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Guild, Channel, User, GuildMember, IVoiceState, EvolveClient } from "../..";


export class VoiceState {
	public guild!: Guild;
	public channel!: Channel;
	public user!: User;
	public member!: GuildMember;
	public sessionID!: string;
	public deaf!: boolean;
	public mute!: boolean;
	public selfDeaf!: boolean;
	public selfMute!: boolean;
	public selfStream!: boolean;
	public selfVideo!: boolean;
	public supress!: boolean;

	constructor(
		public data: IVoiceState,
		client: EvolveClient
	) {
		client.api.getGuild(data.guild_id!).then(o => this.guild = o);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		client.api.getChannel(data.channel_id!).then(o => this.channel = o);
		client.api.getUser(data.user_id).then(o => this.user = o);
		this.member = new GuildMember(data.member!);
		this.sessionID = data.session_id;
		this.deaf = data.deaf;
		this.mute = data.mute;
		this.selfDeaf = data.self_deaf;
		this.selfMute = data.self_mute;
		this.selfStream = data.self_stream!;
		this.selfVideo = data.self_video;
		this.supress = data.suppress;
	}
}
