/*
	Command Module for generating a poll at random from the list of movies/animes/tvshows currently on the community list

	Author: Darth_Maz
*/
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	name: "poll",
	description: "Begins a poll.",
	aliases: ["begin", "start"],
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can run polls`);

			return callback();
		}
		var embeddedMessages = [];
		var number = 1;
		var totalCount = 0;
		var description = "";

		if(prefixType === "movie") {
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
			var movieEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
			var movieMap = {};

			message.channel.send(settings.pollTime >= main.maxPollTime*1000 ? settings.pollMessage + "\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO TWO HOURS DUE TO A TECHNICAL ISSUE. THIS WILL BE FIXED SOON)" : settings.pollMessage);

			//2048 limit
			await main.movieModel.find(searchOptions, function (error, docs) {
				if (error) {
					message.channel.send("Could not return list of movies, an error occured.");

					return callback();
				}
				
				if (docs.length == 0) {
					message.channel.send("Cannot start poll. List of unviewed movies is empty.");

					return callback();
				} else if (docs && docs.length > 0) {
					//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
					var movies = main.getRandomFromArray(docs, settings.pollSize);

					totalCount = movies.length;

					for (var movie of movies) {
						var stringConcat = `**[${emojis[number]} ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						movieMap[number] = movie; //Store position of movie in list.
						number++;		
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (var i = 0; i < embeddedMessages.length; i++) {
					var embeddedMessage = embeddedMessages[i];
	
					//If the message is NOT the last one in the embedded messages chain, just send the message. ELSE we wil be sending the message + handling reacts on it.
					if (i != embeddedMessages.length - 1) {
						message.channel.send(embeddedMessage);
					} else {
						var emojiMap = {};
	
						message.channel.send(embeddedMessage).then(async (message) => {
							//Polltime is stored in ms
							var collector = message.createReactionCollector(m => m, { time: (settings.pollTime >= main.maxPollTime*1000 ? main.maxPollTime*1000 : settings.pollTime) + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)
	
							console.log("Poll started. GuildID: " + message.guild.id  + " " + new Date());
							collector.on("collect", (messageReact, user) => {
								if (user.id != main.client.user.id) {
									console.log("Collect" + " " + new Date());
									var duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
				
									//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
									//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
									for (var reaction of duplicateReactions.values()) {
										try {
											reaction.users.remove(user.id);
										} catch (e) {
											console.error("Error removing reaction", e);
										}
									}
								}
							});
	
							for (var i = 1; i <= totalCount; i++) {
								try {
									await message.react(emojis[i]);
									emojiMap[emojis[i]] = i;
								} catch (e) {
									console.log("Poll message deleted" + " " + new Date() );
									collector.stop();
								}
	
							}
					
							collector.on("end", () => {
								console.log("Poll end.  GuildID: " + message.guild.id + " " + new Date());
								//Refetch message due to discord.js caching.
								message.fetch().then(function(updatedMessage) {
									const reactionsCache = updatedMessage.reactions.cache;
									const highestValidReactions = reactionsCache.filter(function(a) {
										return emojiMap[a.emoji.name] > 0;
									});
	
									if (highestValidReactions.size == 0) {
										message.channel.send("Reactions may have been removed or another error occurred.");
	
										return callback();
									}
	
									const highestReact = highestValidReactions.reduce((p, c) => p.count > c.count ? p : c, 0) || message.reactions.reduce((p, c) => p.count > c.count ? p : c, 0);
		
									if (!highestReact.emoji) {
										console.error("Could not collect reactions");
										console.error(emojiMap);
										console.error(highestReact);
										console.error(highestValidReactions);
										console.error(highestReact.emoji);
										message.channel.send("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");
		
										return callback();
									}
		
									var winner = movieMap[emojiMap[highestReact.emoji.name]];
		
									if (highestReact.count <= 1) {
										message.channel.send("No votes were cast, so no movie has been chosen.");
										
										return callback();
									}
									
									//If auto viewed is set, update movie to be entered into the VIEWED list. 
									if (settings.autoViewed) {
										main.movieModel.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() }, function(err) {
											if (!err) {
												winner.viewed = true; winner.viewedDate = new Date();
												message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
											} else {
												message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
											}
		
											return callback();
										});
									} else {
										message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
		
										return callback();
									}								
								}).catch(function() {
									console.log("Poll was deleted.");
								});
							});
						});
					}
				}
			}).lean();
		}
		if(prefixType === "anime") {
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, "", true);
			var animeEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
			var animeMap = {};

			message.channel.send(settings.pollTime >= main.maxPollTime*1000 ? settings.pollMessage + "\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO TWO HOURS DUE TO A TECHNICAL ISSUE. THIS WILL BE FIXED SOON)" : settings.pollMessage);

			//2048 limit
			await main.animeModel.find(searchOptions, function (error, docs) {
				if (error) {
					message.channel.send("Could not return list of animes, an error occured.");

					return callback();
				}
				
				if (docs.length == 0) {
					message.channel.send("Cannot start poll. List of unviewed animes is empty.");

					return callback();
				} else if (docs && docs.length > 0) {
					//Gets random assortment of animes depending on poll size setting and number of animes in the servers list.
					var animes = main.getRandomFromArray(docs, settings.pollSize);

					totalCount = animes.length;

					for (var anime of animes) {
						var stringConcat = `**[${emojis[number]} ${anime.name}](https://myanimelist.net/anime/${anime.malID})** submitted by ${anime.submittedBy} on ${moment(anime.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(anime.releaseDate).format("DD MMM YYYY")} **Episodes:** ${anime.episodes} **Rating:** ${anime.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							animeEmbed.setDescription(description);
							embeddedMessages.push(animeEmbed);
							description = "";
							animeEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						animeMap[number] = anime; //Store position of anime in list.
						number++;		
					}
				}

				animeEmbed.setDescription(description);
				embeddedMessages.push(animeEmbed);

				for (var i = 0; i < embeddedMessages.length; i++) {
					var embeddedMessage = embeddedMessages[i];
	
					//If the message is NOT the last one in the embedded messages chain, just send the message. ELSE we wil be sending the message + handling reacts on it.
					if (i != embeddedMessages.length - 1) {
						message.channel.send(embeddedMessage);
					} else {
						var emojiMap = {};
	
						message.channel.send(embeddedMessage).then(async (message) => {
							//Polltime is stored in ms
							var collector = message.createReactionCollector(m => m, { time: (settings.pollTime >= main.maxPollTime*1000 ? main.maxPollTime*1000 : settings.pollTime) + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)
	
							console.log("Poll started. GuildID: " + message.guild.id  + " " + new Date());
							collector.on("collect", (messageReact, user) => {
								if (user.id != main.client.user.id) {
									console.log("Collect" + " " + new Date());
									var duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
				
									//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
									//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
									for (var reaction of duplicateReactions.values()) {
										try {
											reaction.users.remove(user.id);
										} catch (e) {
											console.error("Error removing reaction", e);
										}
									}
								}
							});
	
							for (var i = 1; i <= totalCount; i++) {
								try {
									await message.react(emojis[i]);
									emojiMap[emojis[i]] = i;
								} catch (e) {
									console.log("Poll message deleted" + " " + new Date() );
									collector.stop();
								}
	
							}
					
							collector.on("end", () => {
								console.log("Poll end.  GuildID: " + message.guild.id + " " + new Date());
								//Refetch message due to discord.js caching.
								message.fetch().then(function(updatedMessage) {
									const reactionsCache = updatedMessage.reactions.cache;
									const highestValidReactions = reactionsCache.filter(function(a) {
										return emojiMap[a.emoji.name] > 0;
									});
	
									if (highestValidReactions.size == 0) {
										message.channel.send("Reactions may have been removed or another error occurred.");
	
										return callback();
									}
	
									const highestReact = highestValidReactions.reduce((p, c) => p.count > c.count ? p : c, 0) || message.reactions.reduce((p, c) => p.count > c.count ? p : c, 0);
		
									if (!highestReact.emoji) {
										console.error("Could not collect reactions");
										console.error(emojiMap);
										console.error(highestReact);
										console.error(highestValidReactions);
										console.error(highestReact.emoji);
										message.channel.send("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");
		
										return callback();
									}
		
									var winner = animeMap[emojiMap[highestReact.emoji.name]];
		
									if (highestReact.count <= 1) {
										message.channel.send("No votes were cast, so no anime has been chosen.");
										
										return callback();
									}
									
									//If auto viewed is set, update anime to be entered into the VIEWED list. 
									if (settings.autoViewed) {
										main.animeModel.updateOne({ guildID: message.guild.id, animeID: winner.animeID }, { viewed: true, viewedDate: new Date() }, function(err) {
											if (!err) {
												winner.viewed = true; winner.viewedDate = new Date();
												message.channel.send(main.buildSingleAnimeEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
											} else {
												message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
											}
		
											return callback();
										});
									} else {
										message.channel.send(main.buildSingleAnimeEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
		
										return callback();
									}								
								}).catch(function() {
									console.log("Poll was deleted.");
								});
							});
						});
					}
				}
			}).lean();
		}
		if(prefixType === "tv") {
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, "", true);
			var tvshowEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
			var tvshowMap = {};

			message.channel.send(settings.pollTime >= main.maxPollTime*1000 ? settings.pollMessage + "\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO TWO HOURS DUE TO A TECHNICAL ISSUE. THIS WILL BE FIXED SOON)" : settings.pollMessage);

			//2048 limit
			await main.tvshowModel.find(searchOptions, function (error, docs) {
				if (error) {
					message.channel.send("Could not return list of tv shows, an error occured.");

					return callback();
				}
				
				if (docs.length == 0) {
					message.channel.send("Cannot start poll. List of unviewed tv shows is empty.");

					return callback();
				} else if (docs && docs.length > 0) {
					//Gets random assortment of tvshows depending on poll size setting and number of tvshows in the servers list.
					var tvshows = main.getRandomFromArray(docs, settings.pollSize);

					totalCount = tvshows.length;

					for (var tvshow of tvshows) {
						var stringConcat = `**[${emojis[number]} ${tvshow.name}](https://www.imdb.com/title/${tvshow.imdbID})** submitted by ${tvshow.submittedBy} on ${moment(tvshow.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(tvshow.releaseDate).format("DD MMM YYYY")} **Episodes:** ${tvshow.episodes} **Runtime:** ${tvshow.runtime} Minutes **Rating:** ${tvshow.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							tvshowEmbed.setDescription(description);
							embeddedMessages.push(tvshowEmbed);
							description = "";
							tvshowEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
						tvshowMap[number] = tvshow; //Store position of tvshow in list.
						number++;		
					}
				}

				tvshowEmbed.setDescription(description);
				embeddedMessages.push(tvshowEmbed);

				for (var i = 0; i < embeddedMessages.length; i++) {
					var embeddedMessage = embeddedMessages[i];
	
					//If the message is NOT the last one in the embedded messages chain, just send the message. ELSE we wil be sending the message + handling reacts on it.
					if (i != embeddedMessages.length - 1) {
						message.channel.send(embeddedMessage);
					} else {
						var emojiMap = {};
	
						message.channel.send(embeddedMessage).then(async (message) => {
							//Polltime is stored in ms
							var collector = message.createReactionCollector(m => m, { time: (settings.pollTime >= main.maxPollTime*1000 ? main.maxPollTime*1000 : settings.pollTime) + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)
	
							console.log("Poll started. GuildID: " + message.guild.id  + " " + new Date());
							collector.on("collect", (messageReact, user) => {
								if (user.id != main.client.user.id) {
									console.log("Collect" + " " + new Date());
									var duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
				
									//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
									//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
									for (var reaction of duplicateReactions.values()) {
										try {
											reaction.users.remove(user.id);
										} catch (e) {
											console.error("Error removing reaction", e);
										}
									}
								}
							});
	
							for (var i = 1; i <= totalCount; i++) {
								try {
									await message.react(emojis[i]);
									emojiMap[emojis[i]] = i;
								} catch (e) {
									console.log("Poll message deleted" + " " + new Date() );
									collector.stop();
								}
	
							}
					
							collector.on("end", () => {
								console.log("Poll end.  GuildID: " + message.guild.id + " " + new Date());
								//Refetch message due to discord.js caching.
								message.fetch().then(function(updatedMessage) {
									const reactionsCache = updatedMessage.reactions.cache;
									const highestValidReactions = reactionsCache.filter(function(a) {
										return emojiMap[a.emoji.name] > 0;
									});
	
									if (highestValidReactions.size == 0) {
										message.channel.send("Reactions may have been removed or another error occurred.");
	
										return callback();
									}
	
									const highestReact = highestValidReactions.reduce((p, c) => p.count > c.count ? p : c, 0) || message.reactions.reduce((p, c) => p.count > c.count ? p : c, 0);
		
									if (!highestReact.emoji) {
										console.error("Could not collect reactions");
										console.error(emojiMap);
										console.error(highestReact);
										console.error(highestValidReactions);
										console.error(highestReact.emoji);
										message.channel.send("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");
		
										return callback();
									}
		
									var winner = tvshowMap[emojiMap[highestReact.emoji.name]];
		
									if (highestReact.count <= 1) {
										message.channel.send("No votes were cast, so no tv show has been chosen.");
										
										return callback();
									}
									
									//If auto viewed is set, update movie to be entered into the VIEWED list. 
									if (settings.autoViewed) {
										main.tvshowModel.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() }, function(err) {
											if (!err) {
												winner.viewed = true; winner.viewedDate = new Date();
												message.channel.send(main.buildSingleTvShowEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
											} else {
												message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
											}
		
											return callback();
										});
									} else {
										message.channel.send(main.buildSingleTvShowEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
		
										return callback();
									}								
								}).catch(function() {
									console.log("Poll was deleted.");
								});
							});
						});
					}
				}
			}).lean();
		}	
	},
};