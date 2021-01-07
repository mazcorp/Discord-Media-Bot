/*
	Command Module for setting specified movie/anime/tvshow as viewed.

	Author: Darth_Maz
*/
module.exports = {
	name: "setviewed",
	description: "sets specified movie/anime/tvshow as viewed.",
	usage: "[item name to set as viewed]",
	args: true,
	async execute(message, prefixType, args, main, callback, settings) {
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
					movie.updateOne({ viewing: false , viewed: true, viewedDate: new Date() }, function(err) {
						if (!err) {
							message.channel.send(`${movie.name} has been set to viewed!`);
						} else {
							message.channel.send("Could not set movie to viewed, something went wrong.");
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
					anime.updateOne({ viewing: false, viewed: true, viewedDate: new Date() }, function(err) {
						if (!err) {
							message.channel.send(`${anime.name} has been set to viewed!`);
						} else {
							message.channel.send("Could not set anime to viewed, something went wrong.");
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
					tvshow.updateOne({ viewing: false, viewed: true, viewedDate: new Date() }, function(err) {
						if (!err) {
							message.channel.send(`${tvshow.name} has been set to viewed!`);
						} else {
							message.channel.send("Could not set tvshow to viewed, something went wrong.");
						}

						return callback();
					});
				} 
			});
		}
	},
};