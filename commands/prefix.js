/*
	Command Module for updating command prefixes for the bot to trigger and interact with the community

	Author: Darth_Maz
*/
module.exports = {
	name: "prefix",
	description: "Updates prefix to chosen string.",
	usage: "[prefix chosen]",
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can update my settings`);

			return callback();
		}
		if(prefixType === "movie") {
			if (!args.length) {
				message.channel.send(`Movie Prefix is currently set to: ${settings.moviePrefix}`);
	
				return callback();
			} else if (args.length > 1) {
				message.channel.send("No spaces allowed in command prefix.");
				
				return callback();
			} else {
				return main.setting.updateOne({guildID: message.guild.id}, { "moviePrefix":  args[0].trim()	}, function(err) {
					if (!err) {
						message.channel.send(`Movie Prefix has now been set to: ${args[0].trim()}`);
					} else {
						message.channel.send("Couldn't set prefix, something went wrong");
					}
	
					return callback();
				});
			}
		}
		if(prefixType === "anime") {
			if (!args.length) {
				message.channel.send(`Anime Prefix is currently set to: ${settings.animePrefix}`);
	
				return callback();
			} else if (args.length > 1) {
				message.channel.send("No spaces allowed in command prefix.");
				
				return callback();
			} else {
				return main.setting.updateOne({guildID: message.guild.id}, { "animePrefix":  args[0].trim()	}, function(err) {
					if (!err) {
						message.channel.send(`Anime Prefix has now been set to: ${args[0].trim()}`);
					} else {
						message.channel.send("Couldn't set prefix, something went wrong");
					}
	
					return callback();
				});
			}
		}
		if(prefixType === "tv") {
			if (!args.length) {
				message.channel.send(`Tv Show Prefix is currently set to: ${settings.tvshowPrefix}`);
	
				return callback();
			} else if (args.length > 1) {
				message.channel.send("No spaces allowed in command prefix.");
				
				return callback();
			} else {
				return main.setting.updateOne({guildID: message.guild.id}, { "tvshowPrefix":  args[0].trim()	}, function(err) {
					if (!err) {
						message.channel.send(`Tv Show Prefix has now been set to: ${args[0].trim()}`);
					} else {
						message.channel.send("Couldn't set prefix, something went wrong");
					}
	
					return callback();
				});
			}
		}
	}		
};