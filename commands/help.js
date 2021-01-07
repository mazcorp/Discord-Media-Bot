/*
	Command Module for providing help documentation for usage for the discord bot

	Author: Darth_Maz
*/
const { moviePrefix, animePrefix, tvshowPrefix } = require('../config.json');

module.exports = {
	name: "help",
	description: "List all of my commands or info about a specific command.",
	aliases: ["commands"],
	usage: "[command name]",
	execute(message, prefixType, args, main, callback, settings) {
		const data = [];
		data.push("Here's a list of all my commands:\n");

		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if ((settings.addRole && message.member.roles.cache.has(settings.addRole)) || message.member.hasPermission("ADMINISTRATOR")) {
			data.push(`**Name:** autoview\n**Description:** This command is used for turning on or off auto view after poll is complete (Hides movie/tvshow/anime from future polls)\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} autoview [on or off]\n\n` +
			`**Name:** pollmessage\n**Description:** This command is used for updating poll message settings of the bot.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} pollmessage [message_text]\n\n` +
			`**Name:** pollsize\n**Description:** This command is used for updating polling size to generate pool for the poll. Polling Size must be atleast 1 and a maximum of 10.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} pollsize [number_text]\n\n` +
			`**Name:** polltime\n**Description:** This command is used for Updates poll time to chosen number. Time entered in milliseconds.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} polltime [milliseconds]\n\n` +
			`**Name:** prefix\n**Description:** This command is used for updating command prefixes for the bot to trigger and interact with the community.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} prefix [new_prefix]\n\n` +
			`**Name:** mediarole\n**Description:** This command sets a role that is allowed to add/remove/update movies/animes/tvshows to the servers list. \n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} mediarole [@roleName]\n\nCan also clear this role by using mediarole remove:\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} mediarole clear\n\n` +
			`**Name:** add\n**Description:** This command is used for adding movies/tvshows/anime to the servers list to vote on and view.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} add [search_text]\n\nIf text is ambigous, the user will be presented with a confirm screen to react to for adding the movie/anime/tvshow.\n\n` +
			`**Name:** remove\n**Description:** This command is used for removing all unviewed movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific unviewed item.\n**Usage:** Use any of the prefix values, i.e.,\n\nTo remove all items:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} remove\n\nTo remove only a specific item:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} remove [item_name]\n\n` +
			`**Name:** setviewed\n**Description:** This command is used for setting specified movie/anime/tvshow as viewed.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} setviewed [item_name]\n\n` +
			`**Name:** setcurrent\n**Description:** This command is used for setting specified movie/anime/tvshow as currently being viewed.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} setcurrent [item_name]\n\n` +
			`**Name:** removeviewed\n**Description:** This command is used for removing all VIEWED movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific VIEWED item.\n**Usage:** Use any of the prefix values, i.e.,\n\nTo remove all items:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} removeviewed\n\nTo remove only a specific item:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} removeviewed [item_name]\n\n` +
			`**Name:** removecurrent\n**Description:** This command is used for removing the specified movie/anime/tvshow from the currently being viewed list.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} removecurrent [item_name]\n\n` +
			`**Name:** random\n**Description:** This command is used for returning a random movie/anime/tvshow from the servers list to watch.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} random\n\n` +
			`**Name:** poll\n**Description:** This command is used for generating a poll at random from the list of movies/animes/tvshows currently on the community list. Number of items in the poll is based on the pollSize setting for the community default is 3 items.\n**Usage:**Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} poll\n`);
		}
		data.push(`**Name:** help\n**Description:** This command provides help documentation for usage for the discord bot.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} help\n\n` +
		`**Name:** get\n**Description:** This command is used for getting all unviewed or a specific movie/tvshow/anime that have been added to the community's list.\n**Usage:** Use any of the prefix values, i.e.,\n\nTo get all items:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} get\n\nTo get only a specific item:\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} get [item_name]\n\n` +		
		`**Name:** current\n**Description:** This command is used for getting current movie/tvshow/anime being watched by the community.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} current\n\n` + 
		`**Name:** viewed\n**Description:** This command is used for returning list of all movies/animes/tvshows that have been marked as viewed for server.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} viewed\n\n` + 
		`**Name:** search\n**Description:** This command is used for searching details for a movie/anime/tvshow without adding to community list.\n**Usage:** Use any of the prefix values, i.e.,\n\n${settings.moviePrefix}/${settings.animePrefix}/${settings.tvshowPrefix} search [search_text]\n\n`);

		return message.channel.send(data, { split: true });
	},
};