/*
	Command Module for searching details for a movie/anime/tvshow without adding to community list

	Author: Darth_Maz
*/
module.exports = {
	name: "search",
	description: "Gets details for a movie without adding to community list.",
	aliases: ["find", "details"],
	usage: "[name or search]",
	args: true,
	async execute(message, prefixType, args, main, callback) {
		var search = args.join(" ");

		try {
			if(prefixType === "movie") {
				return main.searchNewMovie(search, message, function(newMovie) {
					//No need for else, searchNewMovie alerts user if no movie found.
					if (newMovie) {
						message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Details", true));
					}
	
					return callback();
				});
			}
			if(prefixType === "anime") {
				return main.searchNewAnime(search, message, function(newAnime) {
					//No need for else, searchNewAnime alerts user if no anime found.
					if (newAnime) {
						message.channel.send(main.buildSingleAnimeEmbed(newAnime, "Anime Details", true));
					}
	
					return callback();
				});
			}
			if(prefixType === "tv") {
				return main.searchNewTvShow(search, message, function(tvshow) {
					//No need for else, searchNewTvShow alerts user if no tv show found.
					if (tvshow) {
						message.channel.send(main.buildSingleTvShowEmbed(tvshow, "Tv Show Details", true));
					}
	
					return callback();
				});
			}
		} catch (e) {
			console.error("Search.js", e);
			message.channel.send("Something went wrong.");
			
			return callback();
		}		
	}		
};