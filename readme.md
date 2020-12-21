# Discaptcha

![alt text](https://github.com/ahoys/discaptcha/blob/master/src/assets/avatar_sm.png "Discaptcha")

**Version 2 now released!**

A standalone bot built against "join, spam & leave" type of spam bots that are very common in Discord.

The solution this bot provides is basically a Discord-suitable captcha. By default the server is set to not allow speaking without some specific role. Discaptcha bot then automatically approaches the new clients and one-by-one verifies that they aren't spam bots, giving them the required role for speaking. It's that simple.

This bot is standalone, meaning that you are required to have a machine where the bot can live and run.

## Installation

It takes about 5-15 mins to install the bot.

1. [Create a new Discord application for the bot.](https://discordapp.com/developers/applications/)
2. In the same developers center, under "Bot", make sure you have "SERVER MEMBERS INTENT" enabled.
3. [Install Node.js if not already.](https://nodejs.org/en/)
4. [Download the newest Discaptcha release](https://github.com/ahoys/discaptcha/releases) and extract it to somewhere.
5. Create a new file called `.env` inside the extraction folder and read the [configuration section](https://github.com/ahoys/discaptcha#Configuration) below.
6. Invite the bot to your server(s) with your web browser. Use the following url: https://discordapp.com/oauth2/authorize?&client_id=YOUR_APP_CLIENT_ID_HERE&scope=bot&permissions=0 (Replace YOUR_APP_CLIENT_ID_HERE with the application id of the bot (see step 2)).
7. Use command `node discaptcha` to run the bot.
8. In Discord, command the bot to install itself: `@Discaptcha install`. This must be done on all servers (guilds) where you want to use the bot.

That's all. Discaptcha is now functional. Type `@Discaptcha help` for a list of commands. You must always mention the bot to activate a command.

*Tip: Use a separate hidden channel to test your bots.*

## Configuration

In order to use the bot, you are required to link the bot to the Discord application you created in the installation step 2. This linking is done by providing the bot some key values via an `.env`-file.

*Note that some OSes may hide the file by default.*

Create an `.env` file if you haven't already. And copy the following template into it:
```
APP_TOKEN=replace_me
APP_ID=replace_me
OWNER_ID=replace_me
```

Replace all the `replace_me` parts with actual values. Most of the values can be found from the [applications portal](https://discordapp.com/developers/applications/).

- APP_TOKEN: token of the application.
- APP_ID: id of the application.
- OWNER_ID: your Discord id.
- ROLE_NAME: optional custom name for the verified-role. By default: verified.
