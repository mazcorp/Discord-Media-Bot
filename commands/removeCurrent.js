/*
	Command Module for removing the specified movie/anime/tvshow from the currently being viewed list

	Author: Darth_Maz
*/
module.exports = {
	name: "removecurrent",
	description: "Removes the specified movie/anime/tvshow from the currently being viewed list.",
	aliases: ["deletecurrent", "clearcurrent"],
	usage: "[name for specific delete, else just the command to remove all viewed items]",
	execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for permissions, as only admins and this role will be able to add/remove items if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can run this command`);

			return callback();
		}
		if(prefixType === "movie") {
			var movie = args.join(" ");
			var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

			return main.movieModel.findOne(searchOptions, function(err, movie) {
				if (err || !movie) {
					message.channel.send("Movie could not be found!");
					
					return callback();
				} else {
					movie.updateOne({ viewing: false}, function(err) {
						if (!err) {
							message.channel.send(`${movie.name} is no longer a currently being viewed movie!`);
						} else {
							message.channel.send("Could not remove current movie, something went wrong.");
						}

						return callback();
					});
				} 
			});
		}
		if(prefixType === "anime") {
			var anime = args.join(" ");
			var searchOptions = main.searchAnimeDatabaseObject(message.guild.id, anime);

			return main.animeModel.findOne(searchOptions, function(err, anime) {
				if (err || !anime) {
					message.channel.send("Anime could not be found!");
					
					return callback();
				} else {
					anime.updateOne({ viewing: false }, function(err) {
						if (!err) {
							message.channel.send(`${anime.name} is no longer a currently being viewed anime!`);
						} else {
							message.channel.send("Could not remove current anime, something went wrong.");
						}

						return callback();
					});
				} 
			});
		}
		if(prefixType === "tv") {
			var tvshow = args.join(" ");
			var searchOptions = main.searchTvShowDatabaseObject(message.guild.id, tvshow);

			return main.tvshowModel.findOne(searchOptions, function(err, tvshow) {
				if (err || !tvshow) {
					message.channel.send("Tv Show could not be found!");
					
					return callback();
				} else {
					tvshow.updateOne({ viewing: false}, function(err) {
						if (!err) {
							message.channel.send(`${tvshow.name} is no longer a currently being viewed tvshow!`);
						} else {
							message.channel.send("Could not remove current tvshow, something went wrong.");
						}

						return callback();
					});
				} 
			});
		}
	},
};