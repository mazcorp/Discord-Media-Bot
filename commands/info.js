/*
	Command Module for providing bot details

	Author: Darth_Maz
*/
const { moviePrefix, animePrefix, tvshowPrefix } = require('../config.json');

module.exports = {
	name: "info",
	description: "Provides description of bot information",
	aliases: ["commands"],
	usage: "[command name]",
	execute(message, prefixType, args, main, callback, settings) {
		const data = [];
        data.push("MediaBot helps to primarily maintain a list of movies, animes and tvshows for the community. In addition it provides a poll voting system, a roulette command and currently being watched items within the community. \n");
        data.push("©2021 Discord Bot built by Darth Maz\n");
		return message.channel.send(data, { split: true });
	},
};