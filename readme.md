# Discaptcha

![alt text](https://github.com/ahoys/discaptcha/blob/master/src/assets/avatar_sm.png "Discaptcha")

A standalone bot built against "join, spam & leave" type of spam bots that are very common in Discord.

The solution this bot provides is basically a Discord-suitable captcha. By default the server is set to not allow speaking without some specific role. Discaptcha bot then automatically approaches the new clients and one-by-one verifies that they aren't spam bots, giving them the required role for speaking. It's that simple.

This bot is standalone, meaning that you are required to have a machine where the bot can live and run.
This may change in the future as the bot matures.

## Installation

1. [Install Node.js.](https://nodejs.org/en/)
2. [Create and register your Discord bot.](https://discordapp.com/developers/applications/)
3. [Download the newest Discaptcha release.](https://github.com/ahoys/discaptcha/releases) and extract it.
4. Open a command prompt or similar and run `npm install` in the same folder as where the extracted files are.
5. Configure the bot, see the configuration chapter below.
6. Use command `npm start` to run the bot.
7. Invite the bot to your servers with a web browser. Use the following url: https://discordapp.com/oauth2/authorize?&client_id=YOUR_APP_CLIENT_ID_HERE&scope=bot&permissions=0 (Replace YOUR_APP_CLIENT_ID_HERE with the application id of the bot (see step 2)).

That's all. Discaptcha is now functional. Type `@Discaptcha help` for a list of commands. You must always mention Discaptcha to activate a command. Discaptcha does not read or save other messages.

Tip: Use a separate hidden channel to control your bots.

## Configuration

**Authentication for the bot**
1. In the installation folder, create a new file called `.env`.
2. Fill in the file:
```
APP_TOKEN=replace_me
APP_ID=replace_me
OWNER_ID=replace_me
```
3. Replace values with your own values. You can find these values from your [Discord applications portal](https://discordapp.com/developers/applications/). `APP_TOKEN` is the bot's token, `APP_ID` is bot's id and `OWNER_ID` is your Discord id.

### config.json
This configuration file is used to setup the guilds and bot behaviour. Create a new file called `config.json` in your installation folder.

An example configuration for the config.json is following:
```
{
  "clientOptions": {},
  "timeToVerifyInMs": 60000,
  "guilds": {
    "277194040401854464": {
      "description": "MyExampleServer",
      "verificationRoleId": "533366845496098830",
      "moderatorRoleId": "533683841777401856"
    },
    "GUILD_ID_HERE": {
      "description": "GUILD_NAME_HERE",
      "verificationRoleId": "VERIFICATION_ROLE_ID_HERE",
      "moderatorRoleId": "MODERATOR_ROLE_ID_HERE (optional)"
    }
  }
}
```

**clientOptions:** Advanced options for initializing connection with Discord. You can safely leave it empty {}.

**timeToVerifyInMs:** How much time the client has before he is kicked out as a bot. Time is in milliseconds (1000ms is 1s).

**guilds:** Mandatory server-specific options (guild means server in Discord-world).

**description:** This doesn't really do anything. It only helps you to distinct the servers from each other.

**verificationRoleId:** Id of the role that is given to the verified clients.

**moderatorRoleId:** Id of the role that moderators use (this is optional, you don't have to have moderators).

Tip: you can find out role id by mentioning it with a backwards-slash: `\@myrole`. The role must be set mentionable. Ids have only numbers.
