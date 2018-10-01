import axios from 'axios';

const ALPHA_VANTAGE_KEY = 'OIDCOTBBCUFLC8KU';
const SERIES_LENGTH = 50;

const getOHLCData = (stock) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock}&apikey=${ALPHA_VANTAGE_KEY}`;
  return axios.get(url).then((res) => {
    const seriesData = res.data['Time Series (Daily)'];
    // convert object to array,
    // truncate to selected length,
    // reverse so most recent is last (right of chart)
    const data = Object.keys(seriesData)
      .map(key => (seriesData[key]))
      .slice(0, SERIES_LENGTH)
      .reverse();
    return data;
  });
};

export default getOHLCData;
