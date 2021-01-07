/*
	Command Module for returning a random movie/anime/tvshow from the servers list to watch

	Author: Darth_Maz
*/
module.exports = {
	name: "random",
	description: "Returns a random movie/anime/tvshow from the servers list to watch.",
	aliases: ["getrandom", "getone", "randommovie", "randomanime", 'randomtvshow', "roulette"],
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can run this command`);

			return callback();
		}
		if(prefixType === "movie") {
			//First we get total number of movies the guild has that are unviewed.
			return main.movieModel.countDocuments({guildID: message.guild.id, viewed: false }, function(err, count) {
				if (!err) {
					const random = Math.floor(Math.random() * count);
					const searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);

					//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
					return main.movieModel.find(searchOptions).skip(random).limit(1).lean().exec(async function (error, docs) {
						if (docs && docs.length > 0) {
							var movieEmbed = main.buildSingleMovieEmbed(docs[0]);

							if (settings.autoViewed) {
								return main.movieModel.updateOne({guildID: message.guild.id, movieID: docs[0].movieID}, { viewed: true, viewedDate: new Date() }, function(err) {
									docs[0].viewed = true;
									docs[0].viewedDate = new Date();
									message.channel.send(movieEmbed);

									if (err) {
										message.channel.send("Could not set movie to viewed.");
									}

									return callback();
								});
							} else {
								message.channel.send(movieEmbed);

								return callback();
							}
						} else {
							message.channel.send("Your movie list is empty, so a random movie cannot be found.");

							return callback();
						}
					});
				} else {
					message.channel.send("Something went wrong.");
					
					return callback();
				}
			});
		}
		if(prefixType === "anime") {
			//First we get total number of animes the guild has that are unviewed.
			return main.animeModel.countDocuments({guildID: message.guild.id, viewed: false }, function(err, count) {
				if (!err) {
					const random = Math.floor(Math.random() * count);
					const searchOptions = main.searchAnimeDatabaseObject(message.guild.id, "", true);

					//Then using a generated random number limited to the count, we find a random anime from the guilds list. If auto view is on, it will be set to viewed.
					return main.animeModel.find(searchOptions).skip(random).limit(1).lean().exec(async function (error, docs) {
						if (docs && docs.length > 0) {
							var animeEmbed = main.buildSingleAnimeEmbed(docs[0]);

							if (settings.autoViewed) {
								return main.animeModel.updateOne({guildID: message.guild.id, animeID: docs[0].animeID}, { viewed: true, viewedDate: new Date() }, function(err) {
									docs[0].viewed = true;
									docs[0].viewedDate = new Date();
									message.channel.send(animeEmbed);

									if (err) {
										message.channel.send("Could not set anime to viewed.");
									}

									return callback();
								});
							} else {
								message.channel.send(animeEmbed);

								return callback();
							}
						} else {
							message.channel.send("Your anime list is empty, so a random anime cannot be found.");

							return callback();
						}
					});
				} else {
					message.channel.send("Something went wrong.");
					
					return callback();
				}
			});
		}
		if(prefixType === "tv") {
			//First we get total number of tv shows the guild has that are unviewed.
			return main.tvshowModel.countDocuments({guildID: message.guild.id, viewed: false }, function(err, count) {
				if (!err) {
					const random = Math.floor(Math.random() * count);
					const searchOptions = main.searchTvShowDatabaseObject(message.guild.id, "", true);

					//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
					return main.tvshowModel.find(searchOptions).skip(random).limit(1).lean().exec(async function (error, docs) {
						if (docs && docs.length > 0) {
							var tvshowEmbed = main.buildSingleTvShowEmbed(docs[0]);

							if (settings.autoViewed) {
								return main.tvshowModel.updateOne({guildID: message.guild.id, tvshowID: docs[0].tvID}, { viewed: true, viewedDate: new Date() }, function(err) {
									docs[0].viewed = true;
									docs[0].viewedDate = new Date();
									message.channel.send(tvshowEmbed);

									if (err) {
										message.channel.send("Could not set tv show to viewed.");
									}

									return callback();
								});
							} else {
								message.channel.send(tvshowEmbed);

								return callback();
							}
						} else {
							message.channel.send("Your tv show list is empty, so a random tv show cannot be found.");

							return callback();
						}
					});
				} else {
					message.channel.send("Something went wrong.");
					
					return callback();
				}
			});
		}
	},
};