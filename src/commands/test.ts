import { Guild } from 'discord.js';

export const test = (guild: Guild): Promise<string> =>
  new Promise((resolve, reject) => {
    resolve('');
  });
