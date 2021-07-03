# Discaptcha

![alt text](https://github.com/ahoys/discaptcha/blob/master/assets/avatar_sm.png 'Discaptcha')

**Version 2 now released!**

A standalone bot built against "join, spam & leave" type of spam bots that are very common in Discord.

The solution this bot provides is basically a Discord-suitable captcha. By default the server is set to not allow speaking without some specific role. Discaptcha bot then automatically approaches new clients and one-by-one verifies that they aren't spam bots, giving them the required role for speaking. It's that simple.

This bot is standalone, meaning that you are required to have a server machine where the bot can live and run.

## Installation

It takes about 5-15 mins to install the bot.

1. [Create a new Discord application for the bot.](https://discordapp.com/developers/applications/)
2. In the same developers center, under "Bot", make sure you have "SERVER MEMBERS INTENT" enabled.
3. [Install Node.js if not already.](https://nodejs.org/en/)
4. [Download the newest Discaptcha release](https://github.com/ahoys/discaptcha/releases) and extract it to somewhere.
5. Run `npm install` in the extraction folder.
6. Open the `.env`-file inside the extraction folder (it may be hidden on some OSes) and read the [configuration section](https://github.com/ahoys/discaptcha#Configuration) below.
7. Invite the bot to your server(s) with your web browser. You can do this with the OAuth2 URL Generator in Discord Developer Portal > your application > OAuth2. **Make sure to check "applications.commands", "bot" and "Administrator".**
8. Run `node discaptcha` to start the bot. The bot should now appear online.
9. Give the bot a command to install itself: `/install`. This is done via slash commands. The command must be executed on all servers where you want to use the bot. Do note that the process may take quite a while on large servers as the bot will give the verified role to all users.

That's all. Discaptcha is now functional. Try it out with `/verifyme`.

_Tip: Use a separate hidden channel to test your bots._

## Configuration

In order to use the bot, you are required to link the bot to the Discord application you created in the installation step 2. This linking is done by providing the bot some key values via an `.env`-file that can be edited with a text editor.

_Note that some OSes may hide the file by default._

```
APP_TOKEN=replace_me
APP_ID=replace_me
OWNER_ID=replace_me
```

Replace all `replace_me` values with actual values. Most of the values can be found from the [applications portal](https://discordapp.com/developers/applications/). The token is under the "Bot" page.

- APP_TOKEN: token of the application.
- APP_ID: id of the application.
- OWNER_ID: your Discord id.
- OWNER_ROLE: optional role id. All users with this role can control the bot.
- ROLE_NAME: optional custom name for the verified-role. By default: Verified.

## Commands (interactions)

`/install`
Installs Discaptcha bot for the guild.

1. Removes the old verified role (of the same name).
2. Creates a new verified role with the correct permissions.
3. Assigns the role to everyone (this may take a while).
4. Disables writing and speaking permissions of the `@everyone` role.

`/humanize`
Makes sure all members on the server have the verified role. In case you have already installed Discaptcha once, this is much faster than re-installing.

- Skips members who already got the role.
- Be careful, this may mark bots as humans.

`/uninstall`
Removes Discaptcha bot's configurations. Useful when you are removing the bot from the server.

1. Enables writing and speaking permissions of the `@everyone` role.
2. Removes the verified role (this will remove the role from the members too).

`/verifyme`
For testing purposes, you can use this interaction to see how the bot greets new visitors.

## Permissions

The bot requires the "Administrator" permission.

Security wise, it's a good idea to give this role only to Discaptcha.

## Security

- This bot shares (mandatory) information with the official Discord API only.
- The bot is incapable of reading user messages.
- The terminal may display usernames or ids. This can help you to hunt down troublemakers.

## FAQ

- The bot joined but doesn't function.
  - Make sure the bot has the correct role permissions. It should have the `Administrator` flag enabled.
  - Make sure your .env file has the values properly set.
  - See if the bot's console shows anything useful. If not, the connection may be broken, triple check the .env file.
- The bot does not give the verified-role to users.
  - This is most likely a permission issue. See your discord server's roles. The bot should have the administrator permission enabled and no other role should override it. Repeat the installation step 7.
  - In the Discord applications page, make sure the bot has the "SERVER MEMBERS INTENT" setting enabled under the "Bot" page.
  - Try executing the `/install` slash command again. The bot should give you information if the installation was successful.
- The slash commands are not showing.
  - The most likely scenario is that Discaptcha does not have the required permissions. Repeat the installation step 7.
