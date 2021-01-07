# Media Bot for Discord
This is a Discord Bot written in Node.JS using Discord.JS library to interface with the Discord API. 

MongoDB connection is required to store and retrieve settings as well as film details. The schema is available within bot.js

The Movie DB API is used to gather any relevant data to movies throughout the application.

## Setup
Create a config.json file in the root directory
```json
{ 
  "moviePrefix": "set to whichever prefix you wish the bot to use for movies.",
  "animePrefix": "set to whichever prefix you wish the bot to use for animes.",
  "tvshowPrefix": "set to whichever prefix you wish the bot to use for tvshows.",
  "token": "set to your discord bot API token",
  "movieDbAPI": "set to your API token from developers.themoviedb.org (Required to get movie data when requested by user)",
  "mongoLogin": "set to your connection string for any MongoDB collection (Check Mongoose for more information)"
}
```

Run index.js which will spawn a sharding manager, which runs bot.js to instantiate all commands and handle responses.

## Commands
**Administrator or Media Role(Mods only) Commands:**

Command: **autoview**

This command is used for turning on or off auto view after poll is complete (Hides movie/tvshow/anime from future polls)

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows autoview [on or off]```

Command: **pollmessage**

This command is used for updating poll message settings of the bot

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows pollmessage [message_text]```

Command: **pollsize**

This command is used for updating polling size to generate pool for the poll. Polling Size must be atleast 1 and a maximum of 10.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows pollsize [number_text]```

Command: **polltime**

This command is used for Updates poll time to chosen number. Time entered in milliseconds.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows polltime [milliseconds]```

Command: **prefix**

This command is used for updating command prefixes for the bot to trigger and interact with the community.

Usage:

Use any of the prefix values, i.e.,

```!movies/!animes/!tvshows prefix [new_prefix]```


Command: **mediarole**

This command sets a role that is allowed to add/remove/update movies/animes/tvshows to the servers list. 

Usage:

Use any of the prefix values, i.e.,

```!movies/!animes/!tvshows mediarole [@roleName]```

Can also clear this role by using mediarole remove

```!movies/!animes/!tvshows mediarole clear```


Command: **add**

This command is used for adding movies/tvshows/anime to the servers list to vote on and view.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows add [search_text]```

If text is ambigous, the user will be presented with a confirm screen to react to for adding the movie/anime/tvshow.

Command: **remove**

This command is used for removing all unviewed movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific unviewed item.

Usage:

To remove all items:

Use any of the prefix values, i.e.,

```!movies/!animes/!tvshows remove```

To remove only a specific item:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows remove [item_name]```

Command: **setviewed**

This command is used for setting specified movie/anime/tvshow as viewed.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows setviewed [item_name]```

Command: **setcurrent**

This command is used for setting specified movie/anime/tvshow as currently being viewed.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows setcurrent [item_name]```

Command: **removeviewed**

This command is used for removing all VIEWED movies/animes/tvshows from servers list if no item is specified, if item is specified then will delete that specific VIEWED item.

Usage:

To remove all items:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows removeviewed```

To remove only a specific item:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows removeviewed [item_name]```

Command: **removecurrent**

This command is used for removing the specified movie/anime/tvshow from the currently being viewed list.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows removecurrent [item_name]```

Command: **random**

This command is used for returning a random movie/anime/tvshow from the servers list to watch.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows random```

Command: **poll**

This command is used for generating a poll at random from the list of movies/animes/tvshows currently on the community list. Number of items in the poll is based on the pollSize setting for the community default is 3 items.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows poll```


**Commands for everyone in the community:**

Command: **help**

This command provides help documentation for usage for the discord bot.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows help```

Command: **get**

This command is used for getting all unviewed or a specific movie/tvshow/anime that have been added to the community's list. 

Usage:

To get all items:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows get```

To get only a specific item:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows get [item_name]```

Command: **current**

This command is used for getting current movie/tvshow/anime being watched by the community.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows current```

Command: **current**

This command is used for getting current movie/tvshow/anime being watched by the community.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows current```

Command: **viewed**

This command is used for returning list of all movies/animes/tvshows that have been marked as viewed for server.

Usage:

Use any of the prefix values, i.e.,

```!movies/!animes/!tvshows viewed```

Command: **search**

This command is used for searching details for a movie/anime/tvshow without adding to community list.

Usage:

Use any of the prefix values, i.e., 

```!movies/!animes/!tvshows search [search_text]```

## Approach 
General development approach was followed from Discord.js documentation to ensure best practices were implemented in terms of bots. Many settings had to be adjusted to ensure my EC2 servers memory usage wouldn't climb indefinitely with default options.

index.js will simply be spawning a sharding manager, which points to bot.js as the primary file to spawn. This is a required implementation by Discord after a bot has exceeded 2,500 servers.

Command script files are separated into a Command folder, these are then loaded in by Bot.js and handles events/command execution. The default prefix is --

Bot.js will check every message for any alias/command text and if it is present it will continue with checks and execution. 

On leaving/kicked from a server, we delete settings and movies from that server
