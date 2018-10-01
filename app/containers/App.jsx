import React, { Component, Fragment } from 'react';
import getOHLCData from '../utils/api';
import Button from '../components/Button';
import Canvas from '../components/Chart';

const STOCK_CHOICES = ['AMZN', 'MSFT', 'AAPL', 'GOOG', 'INTC', 'AMD', 'TSLA', 'NFLX', 'ORCL', 'LUV', 'HOG'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStock: localStorage.getItem('selectedStock') || 'TSLA',
      stockData: [],
    };
    this.setStock = this.setStock.bind(this);
  }

  componentDidMount() {
    const { selectedStock } = this.state;
    this.setStock(selectedStock);
  }

  setStock(selectedStock) {
    this.setState({
      selectedStock,
    });
    localStorage.setItem('selectedStock', selectedStock);
    getOHLCData(selectedStock).then((stockData) => {
      this.setState({
        stockData,
      });
    });
  }

  render() {
    const { selectedStock, stockData } = this.state;
    return (
      <Fragment>
        <div className="Header">A HEADER</div>
        <div className="Main">
          <div className="StockChoices">
            {STOCK_CHOICES.map(stock => (
              <Button
                key={stock}
                isActive={stock === selectedStock}
                value={stock}
                onButtonClick={this.setStock}
              />
            ))}
          </div>
          <Canvas data={stockData} />
        </div>
        <div className="Footer">a footer</div>
      </Fragment>
    );
  }
}

export default App;
