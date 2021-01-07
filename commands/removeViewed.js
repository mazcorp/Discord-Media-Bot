/*
	Command Module for removing all VIEWED movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific VIEWED item

	Author: Darth_Maz
*/
module.exports = {
	name: "removeviewed",
	description: "Removes all VIEWED movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific VIEWED item.",
	aliases: ["deleteviewed", "clearviewed"],
	usage: "[name for specific delete, else just the command to remove all viewed items]",
	execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for permissions, as only admins and this role will be able to add/remove items if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can run this command`);

			return callback();
		}
		if(prefixType === "movie") {
			if (!args.length) {
				return main.movieModel.deleteMany({guildID: message.guild.id, viewed: true }, function(err) {
					if (!err) {
						message.channel.send("All viewed movies have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all viewed movies");
					}
	
					return callback();
				});
			}
	
			var movie = args.join(" ");
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);
	
			searchOptions.viewed = true;
	
			//If submitted film is by member trying to delete, allow it.
			if (movie != "") {
				return main.movieModel.findOne(searchOptions, function(err, movie) {
					if (err || !movie) {
						message.channel.send("Movie could not be found!");
						
						return callback();
					} else {
						return movie.remove(function(err) {
							if (!err) {
								message.channel.send(`Movie deleted: ${movie.name}`);
							} else {
								message.channel.send("Could not remove movie, something went wrong.");
							}
	
							return callback();
						});
					}
				});
			} else {
				message.channel.send("Specify a movie or remove space.");
	
				return callback();
			}
		}
		if(prefixType === "anime") {
			if (!args.length) {
				return main.animeModel.deleteMany({guildID: message.guild.id, viewed: true }, function(err) {
					if (!err) {
						message.channel.send("All viewed animes have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all viewed animes");
					}
	
					return callback();
				});
			}
	
			var anime = args.join(" ");
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, anime);
	
			searchOptions.viewed = true;
	
			//If submitted anime is by member trying to delete, allow it.
			if (anime != "") {
				return main.animeModel.findOne(searchOptions, function(err, anime) {
					if (err || !anime) {
						message.channel.send("Anime could not be found!");
						
						return callback();
					} else {
						return anime.remove(function(err) {
							if (!err) {
								message.channel.send(`Anime deleted: ${anime.name}`);
							} else {
								message.channel.send("Could not remove anime, something went wrong.");
							}
	
							return callback();
						});
					}
				});
			} else {
				message.channel.send("Specify a anime or remove space.");
	
				return callback();
			}
		}
		if(prefixType === "tv") {
			if (!args.length) {
				return main.tvshowModel.deleteMany({guildID: message.guild.id, viewed: true }, function(err) {
					if (!err) {
						message.channel.send("All viewed tvshows have been deleted.");
					} else {
						message.channel.send("An error occured while trying to delete all movies");
					}
	
					return callback();
				});
			}
	
			var tvshow = args.join(" ");
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, tvshow);
	
			searchOptions.viewed = true;
	
			//If submitted film is by member trying to delete, allow it.
			if (tvshow != "") {
				return main.tvshowModel.findOne(searchOptions, function(err, tvshow) {
					if (err || !tvshow) {
						message.channel.send("Tv Show could not be found!");
						
						return callback();
					} else {
						return tvshow.remove(function(err) {
							if (!err) {
								message.channel.send(`Tv Show deleted: ${tvshow.name}`);
							} else {
								message.channel.send("Could not remove tv show, something went wrong.");
							}
	
							return callback();
						});
					}
				});
			} else {
				message.channel.send("Specify a tv show or remove space.");
	
				return callback();
			}
		}
	},
};