import { GuildMember } from '../Guild/GuildMember';
import { User } from '../User/User';
import { Guild } from '../Guild/Guild';
import { IMessage } from '../../Interfaces/MessageOptions';
import { EvolveClient } from '../../Client/EvolveClient';
import TextChannel from '../Channel/TextChannel';

export class Message {
	public sentAt!: string;
	public id!: string;
	public pinned!: boolean;
	public mentions: User[] = new Array();
	public rolementions!: Array<string>;
	public mentionEveryone!: boolean;
	public member!: GuildMember | undefined;
	public author!: User;
	public editedTimestamp!: number | null;
	public attachments!: Array<string>;
	public content!: string;
	public guild!: Guild;
	public channel!: TextChannel

	constructor(data: IMessage, client: EvolveClient) {
		this.sentAt = data.sent_at
		this.id = data.id
		this.pinned = data.pinned
		data.mentions.forEach(it => {
			this.mentions.push(new User(it))
		})
		this.rolementions = data.mention_roles
		this.mentionEveryone = data.mention_everyone
		this.member = data.member
		this.author = data.author
		this.editedTimestamp = data.edited_timestamp
		this.attachments = data.attachments
		this.content = data.content
		client.api.getGuild(data.guild_id!).then(it => this.guild = it)
		client.api.getChannel(data.channel_id).then(it => this.channel = it)
	}
}