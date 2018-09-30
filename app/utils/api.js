import axios from 'axios';

const ALPHA_VANTAGE_KEY = 'OIDCOTBBCUFLC8KU';

const getOHLCData = (stock) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock}&apikey=${ALPHA_VANTAGE_KEY}`;
  return axios.get(url);
};

export default getOHLCData;
