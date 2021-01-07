/*
	Command Module for adding movies/tvshows/anime to the servers list to vote on and view.

	Author: Darth_Maz
*/
const emojis = require("../emojis.json");

module.exports = {
	name: "add",
	description: "Adds movies/tvshows/anime to the servers list to vote on and view.",
	aliases: ["addmovie", "addanime", "addtvshow", "insert"],
	usage: "[name or search]",
	args: true,
	async execute(message, prefixType, args, main, callback, settings) {
		const search = args.join(" ");

		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can add items to the list`);

			return callback();
		}

		//Continue with normal search if the above doesnt return.
		try {
			//Adding movies
			if(prefixType === "movie") {
				return main.searchNewMovie(search, message, function(newMovie, data) {
					//No need for else, searchNewMovie alerts user if no movie found.
					if (newMovie) {
						newMovie.save(function(err) {
							if (err && err.name == "MongoError") {
								message.channel.send("Movie already exists in the list. It may be marked as 'Viewed'");
	
								return callback();
							}
			
							if (!err) {
								//If the search results from the API returned more than one result, we ask the user to confirm using REACTIONS on the message. 
								if (data && (data.total_results > 1 || (data.movie_results && data.movie_results.length > 1))) {
									const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Is this the movie you want to add?");
				
									message.channel.send(movieEmbed).then(async (embedMessage) => {
										const filter = (reaction, user) => { return (reaction.emoji.name == emojis.yes || reaction.emoji.name == emojis.no) && user.id == message.author.id; };
	
										try {
											await embedMessage.react(emojis.yes);
											await embedMessage.react(emojis.no);
										} catch (e) {
											console.log("Message deleted");
	
											return removeMovie(newMovie, callback);
										}
										
										//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.								
										embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ["time"] }).then(function(collected) {
											const reaction = collected.first();
	
											if (reaction.emoji.name == emojis.yes) {
												message.channel.send("Movie will be added to the list!");
	
												return callback();
											} else {
												message.channel.send("Movie will not be added to the list. Try using an IMDB link instead?");
												
												return removeMovie(newMovie, callback);
											}
										}).catch(() => {
											message.channel.send("Movie will not be added, you didn't respond in time. Try using an IMDB link instead?");
	
											return removeMovie(newMovie, callback);
										});
									});
								} else {
									message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Added!"));
	
									return callback();
								}
							} else {
								message.channel.send("Something went wrong, couldn't run command");
	
								return callback();
							}
						});
					}
				});
			}
			//Adding Animes
			if(prefixType === "anime") {
				return main.searchNewAnime(search, message, function(newAnime, data) {
					//No need for else, searchNewAnime alerts user if no anime found.
					if (newAnime) {
						newAnime.save(function(err) {
							if (err && err.name == "MongoError") {
								message.channel.send("Anime already exists in the list. It may be marked as 'Viewed'");
	
								return callback();
							}
			
							if (!err) {
								//If the search results from the API returned more than one result, we ask the user to confirm using REACTIONS on the message. 
								if (data) {
									const animeEmbed = main.buildSingleAnimeEmbed(newAnime, "Is this the anime you want to add?");
				
									message.channel.send(animeEmbed).then(async (embedMessage) => {
										const filter = (reaction, user) => { return (reaction.emoji.name == emojis.yes || reaction.emoji.name == emojis.no) && user.id == message.author.id; };
	
										try {
											await embedMessage.react(emojis.yes);
											await embedMessage.react(emojis.no);
										} catch (e) {
											console.log("Message deleted");
	
											return removeAnime(newAnime, callback);
										}
										
										//Wait for user to confirm if anime presented to them is what they wish to be added to the list or not.								
										embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ["time"] }).then(function(collected) {
											const reaction = collected.first();
	
											if (reaction.emoji.name == emojis.yes) {
												message.channel.send("Anime will be added to the list!");
	
												return callback();
											} else {
												message.channel.send("Anime will not be added to the list. Try using a more specific title or anime name?");
												
												return removeAnime(newAnime, callback);
											}
										}).catch(() => {
											message.channel.send("Anime will not be added, you didn't respond in time. Try using a more specific title or anime name?");
	
											return removeAnime(newAnime, callback);
										});
									});
								} else {
									message.channel.send(main.buildSingleAnimeEmbed(newAnime, "Anime Added!"));
	
									return callback();
								}
							} else {
								message.channel.send("Something went wrong, couldn't run command");
	
								return callback();
							}
						});
					}
				});
			}
			//Adding Tv Shows
			if(prefixType === "tv") {
				return main.searchNewTvShow(search, message, function(newTvShow, data) {
					//No need for else, searchNewTvShow alerts user if no tv show found.
					if (newTvShow) {
						newTvShow.save(function(err) {
							if (err && err.name == "MongoError") {
								message.channel.send("TV Show already exists in the list. It may be marked as 'Viewed'");
	
								return callback();
							}
			
							if (!err) {
								//If the search results from the API returned more than one result, we ask the user to confirm using REACTIONS on the message. 
								if (data) {
									const tvShowEmbed = main.buildSingleTvShowEmbed(newTvShow, "Is this the tv show you want to add?");
				
									message.channel.send(tvShowEmbed).then(async (embedMessage) => {
										const filter = (reaction, user) => { return (reaction.emoji.name == emojis.yes || reaction.emoji.name == emojis.no) && user.id == message.author.id; };
	
										try {
											await embedMessage.react(emojis.yes);
											await embedMessage.react(emojis.no);
										} catch (e) {
											console.log("Message deleted");
	
											return removeTvShow(newTvShow, callback);
										}
										
										//Wait for user to confirm if anime presented to them is what they wish to be added to the list or not.								
										embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ["time"] }).then(function(collected) {
											const reaction = collected.first();
	
											if (reaction.emoji.name == emojis.yes) {
												message.channel.send("Tv Show will be added to the list!");
	
												return callback();
											} else {
												message.channel.send("Tv Show will not be added, you didn't respond in time. Try using a more specific title or tv show name?");
												
												return removeTvShow(newTvShow, callback);
											}
										}).catch(() => {
											message.channel.send("Tv Show will not be added, you didn't respond in time. Try using a more specific title or tv show name?");
	
											return removeTvShow(newTvShow, callback);
										});
									});
								} else {
									message.channel.send(main.buildSingleTvShowEmbed(newTvShow, "Tv Show Added!"));
	
									return callback();
								}
							} else {
								message.channel.send("Something went wrong, couldn't run command");
	
								return callback();
							}
						});
					}
				});
			}
		} catch (e) {
			console.error("Add.js", e);
			
			return message.channel.send("Something went wrong.");
		}
	}	
};

function removeMovie(newMovie, callback) {
	newMovie.remove(callback);
}
function removeAnime(newAnime, callback) {
	newAnime.remove(callback);
}
function removeTvShow(newTvShow, callback) {
	newTvShow.remove(callback);
}