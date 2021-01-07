/*
	Command Module for getting all or a specific movie/tvshow/anime that have been added to the community's list 

	Author: Darth_Maz
*/
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "get",
	description: "Returns list of all movies/animes/tvshows in current watch list for server, or if search is specified it will attempt to search the servers list for the movie, anime or kdrama.",
	aliases: ["list", "getmovie", "getanime", "gettvshow"],
	execute(message, prefixType, args, main, callback) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";

		//For Movies
		if(prefixType === "movie") {
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
			var movieEmbed = new MessageEmbed().setTitle("Submitted Movies").setColor("#6441a3");
			var movie = args ? args.join(" ") : null;

			if (!args.length) {
				//return to avoid hitting logic below.
				return main.movieModel.find(searchOptions, function (error, movies) {
					if (error) {
						message.channel.send("Could not return list of movies, an error occured.");

						return callback();
					}
					
					if (movies.length == 0) { 
						message.channel.send("List of unviewed movies is currently empty.");

						return callback();
					} else if (movies && movies.length > 0) {
						for (var movie of movies) {
							var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
							**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

							//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
							if (description.length + stringConcat.length > 2048) {
								movieEmbed.setDescription(description);
								embeddedMessages.push(movieEmbed);
								description = "";
								movieEmbed = new MessageEmbed().setTitle("Submitted Movies (Cont...)").setColor("#6441a3");
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

			searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

			//25 embed limit for fields
			return main.movieModel.findOne(searchOptions, function (error, movie) {
				if (movie) {
					message.channel.send(main.buildSingleMovieEmbed(movie));		
				} else {
					message.channel.send("Could not find movie in your list. Perhaps try using the search command instead?");
				}

				return callback();
			}).lean();
		}

		//For Animes
		if(prefixType === "anime") {
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, "", true);
			var animeEmbed = new MessageEmbed().setTitle("Submitted Animes").setColor("#6441a3");
			var anime = args ? args.join(" ") : null;

			if (!args.length) {
				//return to avoid hitting logic below.
				return main.animeModel.find(searchOptions, function (error, animes) {
					if (error) {
						message.channel.send("Could not return list of animes, an error occured.");

						return callback();
					}
					
					if (animes.length == 0) { 
						message.channel.send("List of unviewed animes is currently empty.");

						return callback();
					} else if (animes && animes.length > 0) {
						for (var anime of animes) {
							var stringConcat = `**[${number}. ${anime.name}](https://myanimelist.net/anime/${anime.malID})** submitted by ${anime.submittedBy} on ${moment(anime.submitted).format("DD MMM YYYY")}\n
							**Release Date:** ${moment(anime.releaseDate).format("DD MMM YYYY")} **Episodes:** ${anime.episodes} **Rating:** ${anime.rating}\n\n`;

							//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
							if (description.length + stringConcat.length > 2048) {
								animeEmbed.setDescription(description);
								embeddedMessages.push(animeEmbed);
								description = "";
								animeEmbed = new MessageEmbed().setTitle("Submitted Animes (Cont...)").setColor("#6441a3");
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

			searchOptions = main.searchAnimeDatabaseObject(message.guild.id, anime);

			//25 embed limit for fields
			return main.animeModel.findOne(searchOptions, function (error, anime) {
				if (anime) {
					message.channel.send(main.buildSingleAnimeEmbed(anime));		
				} else {
					message.channel.send("Could not find anime in your list. Perhaps try using the search command instead?");
				}

				return callback();
			}).lean();
		}

		//For Tv Shows
		if(prefixType === "tv") {
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, "", true);
			var tvshowEmbed = new MessageEmbed().setTitle("Submitted Tv Shows").setColor("#6441a3");
			var tvshow = args ? args.join(" ") : null;

			if (!args.length) {
				//return to avoid hitting logic below.
				return main.tvshowModel.find(searchOptions, function (error, tvshows) {
					if (error) {
						message.channel.send("Could not return list of tv shows, an error occured.");

						return callback();
					}
					
					if (tvshows.length == 0) { 
						message.channel.send("List of unviewed tv shows is currently empty.");

						return callback();
					} else if (tvshows && tvshows.length > 0) {
						for (var tvshow of tvshows) {
							var stringConcat = `**[${number}. ${tvshow.name}](https://www.imdb.com/title/${tvshow.imdbID})** submitted by ${tvshow.submittedBy} on ${moment(tvshow.submitted).format("DD MMM YYYY")}\n
							**Release Date:** ${moment(tvshow.releaseDate).format("DD MMM YYYY")} **Episodes:** ${tvshow.episodes} **Runtime:** ${tvshow.runtime} Minutes **Rating:** ${tvshow.rating}\n\n`;

							//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
							if (description.length + stringConcat.length > 2048) {
								tvshowEmbed.setDescription(description);
								embeddedMessages.push(tvshowEmbed);
								description = "";
								tvshowEmbed = new MessageEmbed().setTitle("Submitted Tv Shows (Cont...)").setColor("#6441a3");
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

			searchOptions = main.searchTvShowDatabaseObject(message.guild.id, tvshow);

			//25 embed limit for fields
			return main.tvshowModel.findOne(searchOptions, function (error, tvshow) {
				if (tvshow) {
					message.channel.send(main.buildSingleTvShowEmbed(tvshow));		
				} else {
					message.channel.send("Could not find tv show in your list. Perhaps try using the search command instead?");
				}

				return callback();
			}).lean();
		}
	},
};