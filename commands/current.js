/*
	Command Module for getting current movie/tvshow/anime being watched by the community

	Author: Darth_Maz
*/
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "current",
	description: "Returns list of movies/animes/tvshows that have been marked as currently being viewed for server.",
	aliases: ["getcurrent", "currentlist"],
	execute(message, prefixType, args, main, callback) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";

		if(prefixType === "movie") {
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");
			var movieEmbed = new MessageEmbed().setTitle("Current Movie").setColor("#6441a3");

			searchOptions.viewing = true;

			//2048 limit
			return main.movieModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("No Movie is currently being viewed");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var movie of docs) {
						var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new MessageEmbed().setTitle("Current Movie (Cont...)").setColor("#6441a3");
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
			var animeEmbed = new MessageEmbed().setTitle("Current Animes").setColor("#6441a3");

			searchOptions.viewing = true;

			//2048 limit
			return main.animeModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("No Animes are currently being viewed");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var anime of docs) {
						var stringConcat = `**[${number}. ${anime.name}](https://myanimelist.net/anime/${anime.malID})** submitted by ${anime.submittedBy}\n
						**Total Number of Episodes:** ${anime.episodes} \n **Next Episode:** ${anime.currentEpisode}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							animeEmbed.setDescription(description);
							embeddedMessages.push(animeEmbed);
							description = "";
							animeEmbed = new MessageEmbed().setTitle("Current Animes (Cont...)").setColor("#6441a3");
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
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, "");
			var tvshowEmbed = new MessageEmbed().setTitle("Current Tv Shows").setColor("#6441a3");

			searchOptions.viewing = true;

			//2048 limit
			return main.tvshowModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) {
					message.channel.send("No Tv Shows are currently being viewed");

					return callback();
				}

				if (docs && docs.length > 0) {
					for (var tvshow of docs) {
						var stringConcat = `**[${number}. ${tvshow.name}](https://www.imdb.com/title/${tvshow.imdbID})** submitted by ${tvshow.submittedBy} \n
						**Episodes:** ${tvshow.episodes} \n **Next Episode:** ${tvshow.currentEpisode} \n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							animeEmbed.setDescription(description);
							embeddedMessages.push(tvshowEmbed);
							description = "";
							animeEmbed = new MessageEmbed().setTitle("Current Tv Shows (Cont...)").setColor("#6441a3");
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