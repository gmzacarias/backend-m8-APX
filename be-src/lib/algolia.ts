import "dotenv/config";
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
    process.env.ALGOLIA_APPLICATION_ID,
    process.env.ALGOLIA_API_KEY);
const index = client.initIndex('pets');

export { index };
