/*
	Entry point for bot core initialization, commands identification, mongo login and API integration

	Author: Darth_Maz
*/
const fs = require("fs");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");
const mongoose = require("mongoose");
const { moviePrefix, animePrefix, tvshowPrefix, token, movieDbAPI, mongoLogin } = require("./config.json");
const client = new Discord.Client({
	messageCacheMaxSize: 70,
	messageCacheLifetime: 7300, //Maximum poll time = 7200, ensure message not swept.
	messageSweepInterval: 600,
	disabledEvents: [
		'GUILD_UPDATE'
		,'GUILD_MEMBER_ADD'
		,'GUILD_MEMBER_REMOVE'
		,'GUILD_MEMBER_UPDATE'
		,'GUILD_MEMBERS_CHUNK'
		,'GUILD_ROLE_CREATE'
		,'GUILD_ROLE_DELETE'
		,'GUILD_ROLE_UPDATE'
		,'GUILD_BAN_ADD'
		,'GUILD_BAN_REMOVE'
		,'GUILD_EMOJIS_UPDATE'
		,'GUILD_INTEGRATIONS_UPDATE'
		,'CHANNEL_CREATE'
		,'CHANNEL_DELETE'
		,'CHANNEL_UPDATE'
		,'CHANNEL_PINS_UPDATE'
		,'MESSAGE_CREATE'
		,'MESSAGE_DELETE'
		,'MESSAGE_UPDATE'
		,'MESSAGE_DELETE_BULK'
		,'MESSAGE_REACTION_REMOVE'
		,'MESSAGE_REACTION_REMOVE_ALL'
		,'USER_UPDATE'
		,'PRESENCE_UPDATE'
		,'TYPING_START'
		,'VOICE_STATE_UPDATE'
		,'VOICE_SERVER_UPDATE'
		,'WEBHOOKS_UPDATE'
	]
});
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const guildSettings = new Discord.Collection();
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Movie = new Schema({
	id: ObjectId,
	primaryKey: { type: String, unique: true },
	guildID: { type: String, index: true },
	movieID: String,
	imdbID: String,
	name: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	runtime: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now },
	viewing: { type: Boolean, default: false },
	viewed: { type: Boolean, default: false },
	viewedDate: { type: Date, default: null }
});
const Anime = new Schema({
	id: ObjectId,
	primaryKey: { type: String, unique: true },
	guildID: { type: String, index: true },
	animeID: String,
	malID: String,
	name: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	episodes: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now },
	viewing: { type: Boolean, default: false },
	currentEpisode: { type: Number, default: 0},
	viewed: { type: Boolean, default: false },
	viewedDate: { type: Date, default: null }
});
const TvShow = new Schema({
	id: ObjectId,
	primaryKey: { type: String, unique: true },
	guildID: { type: String, index: true },
	tvshowID: String,
	imdbID: String,
	name: String,
	language: String,
	genres: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	episodes: Number,
	runtime: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now },
	viewing: { type: Boolean, default: false },
	currentEpisode: { type: Number, default: 0},
	viewed: { type: Boolean, default: false },
	viewedDate: { type: Date, default: null }
});
const Settings = new Schema({
	id: ObjectId,
	guildID: { type: String, unique: true, index: true },
	moviePrefix: { type: String, default: "!movie" },
	animePrefix: { type: String, default: "!anime" },
	tvshowPrefix: { type: String, default: "!tvshow" },
	pollTime: { type: Number, default: 120000},
	pollMessage: { type: String, default: "Poll has begun!" },
	pollSize: { type: Number, min: 1, max: 10, default: 3 },
	autoViewed: { type: Boolean, default: false },
	addRole: { type: String, default: null }
});
const movieModel = mongoose.model("Movie", Movie);
const animeModel = mongoose.model("Anime", Anime);
const tvshowModel = mongoose.model("TvShow", TvShow);
const setting = mongoose.model("Settings", Settings);
var main = {};

client.commands = new Discord.Collection();
client.commandsArray = [];
mongoose.connect(mongoLogin, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

function setMessage() {
	client.user.setActivity("stuff with friends", { type: "WATCHING" });
}

client.once("ready", () => {
	//Every hour update activity to avoid getting it cleared.
	setMessage();
	setInterval(setMessage, 1000 * 60 * 60 );
	console.log("Ready!");
});

function guildCreateError(err) {
	if (err) {
		console.error("Guild create", err);
	}
}

client.on("guildCreate", async function(guild) {
	//Whenever the bot is added to a guild, instantiate default settings into our database. 
	new setting({guildID: guild.id}).save(guildCreateError);
});

client.on("guildDelete", function(guild) {
	//Whenever the bot is removed from a guild, we remove all related data.
	movieModel.deleteMany({ guildID: guild.id }, handleError);
	animeModel.deleteMany({ guildID: guild.id }, handleError);
	tvshowModel.deleteMany({ guildID: guild.id }, handleError);
	setting.deleteMany({ guildID: guild.id }, handleError);
});


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
	client.commandsArray.push(command.name);

	//We don't really care about duplicates, merge alias' into commands array
	if (command.aliases) {
		Array.prototype.push.apply(client.commandsArray, command.aliases);
	}
}

client.on("message", async function(message) {	
	var guildID = message.guild ? message.guild.id : -1;

	//Put in a check for all commands and aliases, if not apart of message dont continue
	if (!client.commandsArray.some(commandText=>message.content.includes(commandText))) {
		return;
	}

	//Do not ask database for settings if we already have them stored, any updates to settings are handled within the settings modules.
	//Currently in commands and callbacks we clear out guildSettings to avoid memory leaks with discord.js memory caching.
	if (message.guild && !guildSettings.has(message.guild.id)) {
		await getSettings(message.guild.id).then(function(settings) {
			if (!settings) {
				//If no settings exist (during downtime of bot) we instantiate some settings before processing command.
				new setting({ guildID: guildID }).save(function(err, setting) {
					if (err) {
						console.error("Guild create", err);
					} else {
						guildSettings.set(message.guild.id, setting);
					}
				});
			} else {
				guildSettings.set(message.guild.id, settings);
			}
		});
	}

	//Defaults in case mongoDB connection is down
	const settings = guildSettings.get(guildID) || {
		moviePrefix: moviePrefix,
		animePrefix: animePrefix,
		tvshowPrefix: tvshowPrefix,
		pollTime: "120000",
		pollMessage: "Poll has begun!",
		pollSize: 3,
		autoViewed: false,
		addRole: null
	};
	const currentMoviePrefix = settings.moviePrefix || moviePrefix;
	const currentAnimePrefix = settings.animePrefix || animePrefix;
	const currentTvShowPrefix = settings.tvshowPrefix || tvshowPrefix;
	//If bot cant SEND MESSAGES, try to DM. If not then bots broken.
	//ADDS_REACTIONS needed for ADD and POLL
	//SEND_MESSAGES needed for ALL
	//MANAGE_MESSAGES needed for POLL
	//EMBED LINKS needed for SEARCH/ADD/POLL
	//READ_MESSAGES needed for all.

	//If message doesn't have the prefix from settings, ignore the message.
	if ((!message.content.startsWith(currentMoviePrefix) && !message.content.startsWith(currentAnimePrefix) && !message.content.startsWith(currentTvShowPrefix) && message.channel.type == "text") || (message.author.bot && message.channel.type == "text")) return guildSettings.delete(message.guild.id);
	if (!message.content.startsWith(currentMoviePrefix) && !message.content.startsWith(currentAnimePrefix) && !message.content.startsWith(currentTvShowPrefix) || message.author.bot) return;

	var tempArgs = "";
	var tempCommandName = "help";
	var tempType = "movie";
	//initialize the params for anime
	if(message.content.startsWith(currentAnimePrefix)) {
		tempArgs = message.content.slice(currentAnimePrefix.length + 1).split(/ +/);
		tempCommandName = tempArgs.shift().toLowerCase();
		tempType = "anime";
	}
	//initialize the params for kdrama
	if(message.content.startsWith(currentTvShowPrefix)) {
		tempArgs = message.content.slice(currentTvShowPrefix.length + 1).split(/ +/);
		tempCommandName = tempArgs.shift().toLowerCase();
		tempType = "tv";
	}

	//initialize the params for movies
	if(message.content.startsWith(currentMoviePrefix)) {
		tempArgs = message.content.slice(currentMoviePrefix.length + 1).split(/ +/);
		tempCommandName = tempArgs.shift().toLowerCase();
		tempType = "movie";
	}
	const args = tempArgs;
	const prefixType = tempType;
	const commandName = tempCommandName;
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command && message.channel.type == "text") return guildSettings.delete(message.guild.id);	
	if (!command) return;

	if (command.name != "help" && message.channel.type !== "text") {
		return message.reply("I can't execute that command inside DMs!");
	}

	//If no permissions
	if (message.channel.type == "text" && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
		guildSettings.delete(message.guild.id);	

		return message.author.send("This bot needs permissions for SENDING MESSAGES in the channel you've requested a command. Please update bots permissions for the channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions.")
			.catch(error => {
				console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		});
	}

	//If the command has been flagged as admin only, do not process it.
	if (command.admin && !message.member.hasPermission("ADMINISTRATOR")) {
		guildSettings.delete(message.guild.id);	

		return message.channel.send("This commands requires the user to have an administrator role in the server.");
	}

	if (message.channel.type == "text" && !message.channel.permissionsFor(message.guild.me).has(["ADD_REACTIONS", "MANAGE_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"])) {
		guildSettings.delete(message.guild.id);	
		
		return message.reply("Bot cannot correctly run commands in this channel. \nPlease update bots permissions for this channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions.");
	}
	
	//Tell user usage if command has been flagged as an argument based command.
	if (command.args && !args.length) {
		var reply = `Incorrect command usage., ${message.author}!`;

		if (command.usage) {
			switch(prefixType) {
				case `${moviePrefix}`:
					reply += `\nThe proper usage would be: \`${moviePrefix} ${command.name} ${command.usage}\``;
					break;
				case `${animePrefix}`:
					reply += `\nThe proper usage would be: \`${animePrefix} ${command.name} ${command.usage}\``;
					break;
				case `${tvshowPrefix}`:
					reply += `\nThe proper usage would be: \`${tvshowPrefix} ${command.name} ${command.usage}\``;
					break;
				default:
					reply += `\nThe proper usage would be: \`${moviePrefix} ${command.name} ${command.usage}\` or \`${animePrefix} ${command.name} ${command.usage}\` or \`${tvshowPrefix} ${command.name} ${command.usage}\``;
			}
			
		}

		guildSettings.delete(message.guild.id);	

		return message.channel.send(reply);
	}

	//Send message, arguments and additional functions/variables required to the command.
	try {
		console.log(command.name + " " + new Date());
		await command.execute(message, prefixType, args, main, function() {
			guildSettings.delete(message.guild.id);	
		}, settings);
	} catch (error) {
		console.error("Problem executing command", error);
		guildSettings.delete(message.guild.id);	

		return message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);

function handleError(err, message) {
	if (err) {
		console.error(message, err);
	}
}

//Anime can be string or MAL link
function searchAnimeDatabaseObject(guildID, anime, hideViewed) {
	var searchObj = {
		guildID: guildID
	};
	
	if (anime != "" && anime) {
		searchObj.name = new RegExp(".*" + anime + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

//TvShow can be string or IMDB link
function searchTvShowDatabaseObject(guildID, tvshow, hideViewed) {
	var searchObj = {
		guildID: guildID
	};
	
	if (tvshow != "" && tvshow) {
		searchObj.name = new RegExp(".*" + tvshow + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

//Movie can be string or IMDB link
function searchMovieDatabaseObject(guildID, movie, hideViewed) {
	var searchObj = {
		guildID: guildID
	};
	
	if (movie != "" && movie) {
		searchObj.name = new RegExp(".*" + movie + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

function buildSingleAnimeEmbed(anime, subtitle, hideSubmitted) {
	var embed = new Discord.MessageEmbed()
		.setTitle(anime.name)
		.setURL(`https://myanimelist.net/anime/${anime.malID}`)
		.setDescription(anime.overview)
		.setImage(anime.posterURL)
		.setColor("#6441a3")
		.addFields(
			{ name: "Release Date", value: moment(anime.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Episodes", value: anime.episodes === 0 ? "Unknown" : anime.episodes, inline: true },
			{ name: "Rating", value: anime.rating, inline: true }
		);

	if (!hideSubmitted) {
		embed.addFields(
			{ name: "Submitted By", value: anime.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(anime.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "In Progress", value: anime.viewing ? "Next Episode: "+moment(anime.currentEpisode) : "No", inline: true },
			{ name: "Viewed", value: anime.viewed ? moment(anime.viewedDate).format("DD MMM YYYY") : "No", inline: true }
		);
	}

	if (subtitle) {
		embed.setAuthor(subtitle);
	}

	return embed;
}

function buildSingleTvShowEmbed(tvshow, subtitle, hideSubmitted) {
	var embed = new Discord.MessageEmbed()
		.setTitle(tvshow.name)
		.setURL(`https://www.imdb.com/title/${tvshow.imdbID}`)
		.setDescription(tvshow.overview)
		.setImage(tvshow.posterURL)
		.setColor("#6441a3")
		.addFields(
			{ name: "Release Date", value: moment(tvshow.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Episodes", value: tvshow.episodes === 0 ? "Unknown" : tvshow.episodes, inline: true },
			{ name: "Runtime", value: tvshow.runtime + " Minutes", inline: true },
			{ name: "Genre", value: tvshow.genres, inline: true },
			{ name: "Rating", value: tvshow.rating, inline: true }
		);

	if (!hideSubmitted) {
		embed.addFields(
			{ name: "Submitted By", value: tvshow.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(tvshow.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "In Progress", value: tvshow.viewing ? "Next Episode: "+moment(tvshow.currentEpisode) : "No", inline: true },
			{ name: "Viewed", value: tvshow.viewed ? moment(tvshow.viewedDate).format("DD MMM YYYY") : "No", inline: true }
		);
	}

	if (subtitle) {
		embed.setAuthor(subtitle);
	}

	return embed;
}

function buildSingleMovieEmbed(movie, subtitle, hideSubmitted) {
	var embed = new Discord.MessageEmbed()
		.setTitle(movie.name)
		.setURL(`https://www.imdb.com/title/${movie.imdbID}`)
		.setDescription(movie.overview)
		.setImage(movie.posterURL)
		.setColor("#6441a3")
		.addFields(
			{ name: "Release Date", value: moment(movie.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Runtime", value: movie.runtime + " Minutes", inline: true },
			{ name: "Rating", value: movie.rating, inline: true }
		);

	if (!hideSubmitted) {
		embed.addFields(
			{ name: "Submitted By", value: movie.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(movie.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "Viewed", value: movie.viewed ? moment(movie.viewedDate).format("DD MMM YYYY") : "No", inline: true }
		);
	}

	if (subtitle) {
		embed.setAuthor(subtitle);
	}

	return embed;
}

async function searchNewAnime(search, message, callback) {
	var failedSearch = false;
	var data = false;
	var searchTerm = search;

	if (searchTerm == "" || !searchTerm) {
		message.channel.send("Please enter a valid search."); 

		return callback();
	}

	//search the jikan api to find the anime
	var initialData = await fetch(`https://api.jikan.moe/v3/search/anime?q=${encodeURIComponent(searchTerm)}&page=1&limit=1`).then(response => response.json());

	if (!initialData || initialData.total_results == 0 || (initialData.movie_results && initialData.movie_results.length == 0)) {
		failedSearch = true;
	}

	//Get the FIRST result from the initial search
	if (!failedSearch) {
		data = initialData.results[0];
	}

	if (!data || failedSearch) {
		message.channel.send("Couldn't find any animes. Sorry!");

		return callback(null, data);
	} 

	return callback(new animeModel({
		primaryKey: message.guild.id + data.mal_id,
		guildID: message.guild.id,
		animeID: data.mal_id,
		malID: data.mal_id,
		name: data.title,
		posterURL: data.image_url,
		overview: data.synopsis,
		releaseDate: new Date(data.start_date),
		episodes: data.episodes,
		rating: data.score,
		submittedBy: message.member.user
	}), initialData);
}

async function searchNewTvShow(search, message, callback) {
	var failedSearch = false;
	var data = false;
	var imdbID = false;
	var initialData = false;
	var isImdbSearch = search.indexOf("imdb.com") > 0;
	var searchTerm = isImdbSearch ? (search.match(/tt[0-9]{7,8}/g) != null ? search.match(/tt[0-9]{7,8}/g) : null) : search;

	if (searchTerm == "" || !searchTerm) {
		message.channel.send("Please enter a valid search."); 

		return callback();
	}

	if(!isImdbSearch) {
		//If not a IMDB link, do a general search else we use a different endpoint.
		initialData = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(searchTerm)}`).then(response => response.json());

		if (!initialData) {
			failedSearch = true;
		}
	}
	
	//Get the FIRST result from the initial search
	if (!failedSearch) {
		imdbID = isImdbSearch ? searchTerm : initialData.externals.imdb;
		var intermediate_data = await fetch(`https://api.themoviedb.org/3/find/${imdbID}?api_key=${movieDbAPI}&external_source=imdb_id`).then(response => response.json());
		data = await fetch(`https://api.themoviedb.org/3/tv/${intermediate_data.tv_results[0].id}?api_key=${movieDbAPI}`).then(response => response.json());
	}

	if (!data || failedSearch) {
		message.channel.send("Couldn't find any tv shows. Sorry!");

		return callback(null, data);
	} 

	return callback(new tvshowModel({
		primaryKey: message.guild.id + data.id,
		guildID: message.guild.id,
		movieID: data.id,
		imdbID: imdbID,
		name: data.name,
		posterURL: `https://image.tmdb.org/t/p/original/${data.poster_path}`,
		overview: data.overview,
		releaseDate: new Date(data.first_air_date),
		runtime: data.episode_run_time[0],
		episodes: data.number_of_episodes,
		genres: data.genres.map(function(item) { return item.name}).join(", "),
		rating: data.vote_average,
		submittedBy: message.member.user
	}), initialData);
}

async function searchNewMovie(search, message, callback) {
	var failedSearch = false;
	var data = false;
	var isImdbSearch = search.indexOf("imdb.com") > 0;
	var searchTerm = isImdbSearch ? (search.match(/tt[0-9]{7,8}/g) != null ? search.match(/tt[0-9]{7,8}/g) : null) : search;

	if (searchTerm == "" || !searchTerm) {
		message.channel.send("Please enter a valid search."); 

		return callback();
	}

	//If not a IMDB link, do a general search else we use a different endpoint.
	var initialData = !isImdbSearch ? await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieDbAPI}&query=${encodeURIComponent(searchTerm)}&page=1`).then(response => response.json()) : await fetch(`https://api.themoviedb.org/3/find/${encodeURIComponent(searchTerm)}?api_key=${movieDbAPI}&external_source=imdb_id`).then(response => response.json());

	if (!initialData || initialData.total_results == 0 || (initialData.movie_results && initialData.movie_results.length == 0)) {
		failedSearch = true;
	}

	//Get the FIRST result from the initial search
	if (!failedSearch) {
		data = await fetch(`https://api.themoviedb.org/3/movie/${isImdbSearch ? initialData.movie_results[0].id : initialData.results[0].id}?api_key=${movieDbAPI}`).then(response => response.json());
	}

	if (!data || failedSearch) {
		message.channel.send("Couldn't find any movies. Sorry!");

		return callback(null, data);
	} 

	return callback(new movieModel({
		primaryKey: message.guild.id + data.id,
		guildID: message.guild.id,
		movieID: data.id,
		imdbID: data.imdb_id,
		name: data.title || data.original_title,
		posterURL: `https://image.tmdb.org/t/p/original/${data.poster_path}`,
		overview: data.overview,
		releaseDate: new Date(data.release_date),
		runtime: data.runtime,
		rating: data.vote_average,
		submittedBy: message.member.user
	}), initialData);
}

function getRandomFromArray(array, count) {
	const shuffled = array.sort(() => 0.5 - Math.random());

	return shuffled.slice(0, count);
}

function getSettings(guildID) {
	return setting.findOne({guildID: guildID }).lean().exec();
}

// function syncUpAfterDowntime() {
// 	setting.find({}).exec(function(err, docs) { 
// 		var missingSettings = Array.from(client.guilds.cache.keys()).filter(function(val) {
// 			return docs.map(a => a.guildID).indexOf(val) == -1;
// 		});
// 		missingSettings = missingSettings.map(function(a) {
// 			return { "guildID": a };
// 		});
		
// 		setting.insertMany(missingSettings, function(error, docs) {
// 			if (error) console.log(error);
// 		});
// 	});
// }

//Namespace functions and variables for modules
main.movieModel = movieModel;
main.animeModel = animeModel;
main.tvshowModel = tvshowModel;
main.searchAnimeDatabaseObject = searchAnimeDatabaseObject;
main.searchTvShowDatabaseObject = searchTvShowDatabaseObject;
main.searchMovieDatabaseObject = searchMovieDatabaseObject;
main.buildSingleAnimeEmbed = buildSingleAnimeEmbed;
main.buildSingleTvShowEmbed = buildSingleTvShowEmbed;
main.buildSingleMovieEmbed = buildSingleMovieEmbed;
main.searchNewAnime = searchNewAnime;
main.searchNewTvShow = searchNewTvShow;
main.searchNewMovie = searchNewMovie;
main.setting = setting;
main.guildSettings = guildSettings;
main.getRandomFromArray = getRandomFromArray;
main.client = client;
main.maxPollTime = 7200;