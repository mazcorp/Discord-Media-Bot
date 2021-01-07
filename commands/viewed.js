/*
	Command Module for returning list of all movies/animes/tvshows that have been marked as viewed for server.

	Author: Darth_Maz
*/
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "viewed",
	description: "Returns list of all movies/animes/tvshows that have been marked as viewed for server.",
	aliases: ["getviewed", "viewedlist"],
	execute(message, prefixType, args, main, callback) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";

		if(prefixType === "movie") {
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");
			var movieEmbed = new MessageEmbed().setTitle("Viewed Movies").setColor("#6441a3");

			searchOptions.viewed = true;

			//2048 limit
			return main.movieModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("List of viewed movies is currently empty.");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var movie of docs) {
						var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy}, viewed on ${moment(movie.viewedDate).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new MessageEmbed().setTitle("Viewed Movies (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						number++;
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (var embeddedMessage of embeddedMessages) {
					message.channel.send(embeddedMessage);
				}

				return callback();
			}).lean();
		}
		if(prefixType === "anime") {
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, "");
			var animeEmbed = new MessageEmbed().setTitle("Viewed Animes").setColor("#6441a3");

			searchOptions.viewed = true;

			//2048 limit
			return main.animeModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("List of viewed animes is currently empty.");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var anime of docs) {
						var stringConcat = `**[${number}. ${anime.name}](https://myanimelist.net/anime/${anime.malID})** submitted by ${anime.submittedBy}, viewed on ${moment(anime.viewedDate).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(anime.releaseDate).format("DD MMM YYYY")}		**Episodes:** ${anime.episodes}		**Rating:** ${anime.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							animeEmbed.setDescription(description);
							embeddedMessages.push(animeEmbed);
							description = "";
							animeEmbed = new MessageEmbed().setTitle("Viewed Animes (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						number++;
					}
				}

				animeEmbed.setDescription(description);
				embeddedMessages.push(animeEmbed);

				for (var embeddedMessage of embeddedMessages) {
					message.channel.send(embeddedMessage);
				}

				return callback();
			}).lean();
		}
		if(prefixType === "tv") {
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, "");
			var tvshowEmbed = new MessageEmbed().setTitle("Viewed Tv Shows").setColor("#6441a3");

			searchOptions.viewed = true;

			//2048 limit
			return main.tvshowModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("List of viewed tv shows is currently empty.");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var tvshow of docs) {
						var stringConcat = `**[${number}. ${tvshow.name}](https://www.imdb.com/title/${tvshow.imdbID})** submitted by ${tvshow.submittedBy}, viewed on ${moment(tvshow.viewedDate).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(tvshow.releaseDate).format("DD MMM YYYY")}		**Episodes:** ${tvshow.episodes}		**Rating:** ${tvshow.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							tvshowEmbed.setDescription(description);
							embeddedMessages.push(tvshowEmbed);
							description = "";
							tvshowEmbed = new MessageEmbed().setTitle("Viewed Movies (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						number++;
					}
				}

				tvshowEmbed.setDescription(description);
				embeddedMessages.push(tvshowEmbed);

				for (var embeddedMessage of embeddedMessages) {
					message.channel.send(embeddedMessage);
				}

				return callback();
			}).lean();
		}
	},
};