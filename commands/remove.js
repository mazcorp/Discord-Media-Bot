/*
	Command Module for removing all unviewed movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific unviewed item

	Author: Darth_Maz
*/
module.exports = {
	name: "remove",
	description: "Removes all unviewed movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific unviewed item.",
	aliases: ["delete", "clear"],
	usage: "[name for specific delete, else just the command]",
	//admin: true, --WE don't use admin tag here as user should be able to remove their own movies before viewing.
	execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for permissions, as only admins and this role will be able to add/remove items if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can run this command`);

			return callback();
		}
		if(prefixType === "movie") {	
			if (!args.length) {
				//If no arguments specified, we delete all movies in the list. In future add reaction check.
				return main.movieModel.deleteMany({guildID: message.guild.id, viewed: false }, function(err) {
					if (!err) {
						message.channel.send("All movies have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all movies");
					}
	
					return callback();
				});
			}
	
			var movie = args.join(" ");
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie, true);
	
			//If submitted film is by member trying to delete, allow it.
			if (movie != "") {
				return main.movieModel.findOne(searchOptions, function(err, movie) {
					if (err || !movie) {
						message.channel.send("Movie could not be found! It may be in the viewed list. Use removeviewed instead.");
	
						return callback();
					} else if ("<@" + message.member.user.id + ">" == movie.submittedBy || ( settings.addRole && !message.member.roles.cache.has(settings.addRole) ) || message.member.hasPermission("ADMINISTRATOR")) {
						return movie.remove(function(err) {
							if (!err) {
								message.channel.send(`Movie deleted: ${movie.name}`);
							} else {
								message.channel.send("Could not remove movie, something went wrong.");
							}
	
							return callback();
						});
					} else {
						message.channel.send("Non-administrators can only delete movies they have submitted");
	
						return callback();
					}
				});
			} else {
				message.channel.send("Specify a movie or remove space.");
				
				return callback();
			}
		}
		if(prefixType === "anime") {
			if (!args.length) {
				//If no arguments specified, we delete all animes in the list. In future add reaction check.
				return main.animeModel.deleteMany({guildID: message.guild.id, viewed: false }, function(err) {
					if (!err) {
						message.channel.send("All animes have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all animes");
					}
	
					return callback();
				});
			}
	
			var anime = args.join(" ");
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, anime, true);
	
			//If submitted anime is by member trying to delete, allow it.
			if (anime != "") {
				return main.animeModel.findOne(searchOptions, function(err, anime) {
					if (err || !anime) {
						message.channel.send("Anime could not be found! It may be in the viewed list. Use removeviewed instead.");
	
						return callback();
					} else if ("<@" + message.member.user.id + ">" == anime.submittedBy || ( settings.addRole && !message.member.roles.cache.has(settings.addRole) ) || message.member.hasPermission("ADMINISTRATOR")) {
						return anime.remove(function(err) {
							if (!err) {
								message.channel.send(`Anime deleted: ${anime.name}`);
							} else {
								message.channel.send("Could not remove anime, something went wrong.");
							}
	
							return callback();
						});
					} else {
						message.channel.send("Non-administrators can only delete animes they have submitted");
	
						return callback();
					}
				});
			} else {
				message.channel.send("Specify a anime or remove space.");
				
				return callback();
			}
		}
		if(prefixType === "tv") {
	
			if (!args.length) {
				//If no arguments specified, we delete all tv shows in the list. In future add reaction check.
				return main.tvshowModel.deleteMany({guildID: message.guild.id, viewed: false }, function(err) {
					if (!err) {
						message.channel.send("All tvshows have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all tvshows");
					}
	
					return callback();
				});
			}
	
			var tvshow = args.join(" ");
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, tvshow, true);
	
			//If submitted film is by member trying to delete, allow it.
			if (movie != "") {
				return main.tvshowModel.findOne(searchOptions, function(err, tvshow) {
					if (err || !tvshow) {
						message.channel.send("Tv Show could not be found! It may be in the viewed list. Use removeviewed instead.");
	
						return callback();
					} else if ("<@" + message.member.user.id + ">" == tvshow.submittedBy || ( settings.addRole && !message.member.roles.cache.has(settings.addRole) )|| message.member.hasPermission("ADMINISTRATOR")) {
						return movie.remove(function(err) {
							if (!err) {
								message.channel.send(`Tv Show deleted: ${tvshow.name}`);
							} else {
								message.channel.send("Could not remove tv show, something went wrong.");
							}
	
							return callback();
						});
					} else {
						message.channel.send("Non-administrators can only delete tv shows they have submitted");
	
						return callback();
					}
				});
			} else {
				message.channel.send("Specify a tv show or remove space.");
				
				return callback();
			}
		}
	},
};