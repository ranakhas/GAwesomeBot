const BaseEvent = require("../BaseEvent.js");

class ChannelDelete extends BaseEvent {
	requirements (channel) {
		return Boolean(channel.guild);
	}

	async handle (channel) {
		const serverDocument = await Servers.findOne(channel.guild.id);
		if (!serverDocument) {
			return winston.debug("Failed to find server data for channel deletion", { svrid: channel.guild.id, chid: channel.id });
		}
		const serverQueryDocument = serverDocument.query;

		let updated = false;
		const channelDocument = serverDocument.channels[channel.id];
		if (channelDocument) {
			updated = true;
			serverQueryDocument.clone.id("channels", channel.id).remove();
		}

		// Command channel configurations
		for (const command in serverDocument.config.commands) {
			const commandDocument = serverDocument.config.commands[command];
			if (commandDocument.disabled_channel_ids && commandDocument.disabled_channel_ids.includes(channel.id)) {
				updated = true;
				serverQueryDocument.pull(`config.commands.${command}.disabled_channel_ids`, channel.id);
			}
		}

		// Message of the Day configuration
		if (serverDocument.config.message_of_the_day.channel_id === channel.id) {
			updated = true;
			serverQueryDocument.set("config.message_of_the_day.channel_id", channel.guild.defaultChannel ? channel.guild.defaultChannel.id : channel.guild.channels.first().id);
		}

		// Moderation Filters
		for (const filter in serverDocument.config.moderation.filters) {
			const filterDocument = serverDocument.config.moderation.filters[filter];
			if (filterDocument.enabled_channel_ids && filterDocument.enabled_channel_ids.includes(channel.id)) {
				updated = true;
				serverQueryDocument.pull(`config.moderation.filters.${filter}.enabled_channel_ids`, channel.id);
			}
		}

		// Status Messages
		for (const status_message in serverDocument.config.moderation.status_messages) {
			const statusMessageDocument = serverDocument.config.moderation.status_messages[status_message];
			if (statusMessageDocument.enabled_channel_ids && statusMessageDocument.enabled_channel_ids.includes(channel.id)) {
				updated = true;
				serverQueryDocument.pull(`config.moderation.status_messages.${status_message}.enabled_channel_ids`, channel.id);
			} else if (statusMessageDocument.channel_id === channel.id) {
				updated = true;
				serverQueryDocument.set(`config.moderation.status_messages.${status_message}.channel_id`, channel.guild.defaultChannel.id);
			}
		}

		// RSS Feeds
		serverDocument.config.rss_feeds.forEach(feed => {
			if (feed.streaming && feed.streaming.enabled_channel_ids.includes(channel.id)) {
				updated = true;
				serverQueryDocument.clone.id("config.rss_feeds", feed._id).pull("streaming.enabled_channel_ids", channel.id);
			}
		});

		// Auto Translation
		serverDocument.config.translated_messages.forEach(translationDocument => {
			if (translationDocument.enabled_channel_ids.includes(channel.id)) {
				updated = true;
				serverQueryDocument.clone.id("config.translated_messages", translationDocument._id).pull("enabled_channel_ids", channel.id);
			}
		});

		// Voicetext
		if (serverDocument.config.voicetext_channels.includes(channel.id)) {
			updated = true;
			serverQueryDocument.pull("config.voicetext_channels", channel.id);
		}

		// Save possible changes
		if (updated) {
			try {
				await	serverDocument.save();
			} catch (err) {
				winston.warn("Failed to save server data for channel deletion *.*", { svrid: channel.guild.id, chid: channel.id, err });
			}
		}
	}
}

module.exports = ChannelDelete;
