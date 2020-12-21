import Datastore, { DataStoreOptions } from 'nedb';

/**
 * Returns the requested database.
 * Creates a new one if doesn't exist.
 * @param {string} filename Name of the database.
 */
export const getDataStore = (filename: string) => {
  try {
    const dbTemplate: DataStoreOptions = {
      filename,
      autoload: true,
    };
    const db = new Datastore(dbTemplate);
    return db;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};
