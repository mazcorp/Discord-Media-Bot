/*
	Command Module for turning on or off auto view after poll is complete (Hides movie/tvshow/anime from future polls)

	Author: Darth_Maz
*/
module.exports = {
	name: "autoview",
	description: "Turns on or off auto view after poll is complete (Hides movie/tvshow/anime from future polls).",
	usage: "[on or off]",
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can update my settings`);

			return callback();
		}
		if ((args.length > 1 || !args.length) || (args[0].toLowerCase() != "on" && args[0].toLowerCase() != "off")) {
			message.channel.send(`Please only specify on or off. Currently setting is: ${settings.autoViewed ? 'on' : 'off'}`);

			return callback();
		} else {
			const autoView = args[0].toLowerCase() == "on";

			return main.setting.updateOne({ guildID: message.guild.id }, { "autoViewed": autoView }, function(err) {
				if (!err) {
					message.channel.send(`Auto view has now been set to: ${autoView ? "On" : "Off"}`);
				} else {
					message.channel.send("Couldn't set auto view, something went wrong");
				}

				return callback();
			});

		}
	}
};