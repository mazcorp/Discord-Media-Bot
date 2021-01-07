/*
	Command Module for setting a role that is allowed to add/remove/update movies/animes/tvshows to the servers list. Can also clear this role by using mediarole remove

	Author: Darth_Maz
*/
module.exports = {
	name: "mediarole",
	description: "Sets a role that is allowed to add movies,animes or tvshows to the servers list. Can also clear this role by using mediarole remove",
	usage: "[@roleName]",
	args: true,
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can add roles`);

			return callback();
		}

		if (args.length > 1) {
			message.channel.send("Please only specify one mentioned role.");

			return callback();
		} else if (!message.mentions.roles.first() && args[0] != "clear") {
			message.channel.send("Please mention the role you'd like to set in the format mediarole [@roleName], or to clear settings use mediarole clear");

			return callback();
		} else {
			const addMediaRole = args[0] == "clear" ? null : message.mentions.roles.first().id;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { "addRole": addMediaRole }, function(err) {
				if (!err) {
					message.channel.send(addMediaRole ? `Users with administrator or the role ${args[0]} will now be able to add movies.` : "Setting for role allowed to add movies has been cleared. Anyone will be able to add movies now.");
				} else {
					message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}

				return callback();
			});

		}
	}
};