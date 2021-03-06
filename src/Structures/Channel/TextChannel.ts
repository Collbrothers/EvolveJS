/* eslint-disable no-mixed-spaces-and-tabs */
import { Channel, Overwrite, Guild, CategoryChannel, ITextChannel, EvolveClient, CHANNELTYPES, Message, MessageEmbed } from "../..";
import { Objex } from "@evolvejs/objex";


export class TextChannel extends Channel {
	public overwrites: Objex<string, Overwrite> = new Objex();

	public guild?: Guild;
	public position: number;
	public name: string;
	public topic?: string;
	public nsfw: boolean;
	public lastMessage?: string;
	public rateLimit: number;
	public parent?: CategoryChannel;
	public lastPin?: number;
	public send!: (content: string | MessageEmbed) => Promise<Message>;

	constructor(public data: ITextChannel, client: EvolveClient) {
		super(data.id, CHANNELTYPES.Text, client);

		this.guild = this.client.guilds.get(data.guild_id);
		this.position = data.position;
		this.name = data.name;
		this.topic = data.topic || undefined;
		this.nsfw = data.nsfw;
		this.rateLimit = data.rate_limit_per_user;
		this.parent = data.parent_id
			? this.client.channels.get(data.parent_id) as CategoryChannel
			: undefined;
		this.lastPin = data.last_pin_timestamp;
	}
	
}
