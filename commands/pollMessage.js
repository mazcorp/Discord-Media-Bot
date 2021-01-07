/*
	Command Module for updating poll message settings of the bot

	Author: Darth_Maz
*/
module.exports = {
	name: "pollmessage",
	description: "Updates pollmessage to chosen string.",
	usage: "[prefix chosen]",
	async execute(message, prefixType, args, main, callback, settings) {
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (settings.addRole && !message.member.roles.cache.has(settings.addRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send(`Only Administrators or Users with the role <@&${settings.addRole}> can update my settings`);

			return callback();
		}
		if (!args.length) {
			message.channel.send(`Poll message is currently set to: ${settings.pollMessage}`);

			return callback();
		} else {
			var pollMessage = args.join(" ").trim();

			return main.setting.updateOne({guildID: message.guild.id}, { "pollMessage": pollMessage }, function(err) {
				if (!err) {
					message.channel.send(`Poll message has now been set to: ${pollMessage}`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}

				return callback();
			});
		}
	}
};