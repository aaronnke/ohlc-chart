import React, { Component, Fragment } from 'react';
import getOHLCData from '../utils/api';
import Button from './Button';

// width of viewport - padding - buttons width
const CANVAS_WIDTH = window.innerWidth - (30 * 2) - 200;
const CANVAS_HEIGHT = 480;
const PADDING = 12;

class Chart extends Component {
  static drawLine(ctx, startX, startY, endX, endY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  static drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedStock: localStorage.getItem('selectedStock') || 'MSFT',
    };
    this.canvas = React.createRef();
    this.setStock = this.setStock.bind(this);
  }

  componentDidMount() {
    const { selectedStock } = this.state;
    getOHLCData(selectedStock).then((res) => {
      const fullData = res.data['Time Series (Daily)'];
      const data = Object.keys(fullData).map(key => (
        fullData[key]
      )).slice(0, 50).reverse();
      this.drawChart(data);
    });
  }

  setStock(selectedStock) {
    this.setState({
      selectedStock,
    });
    localStorage.setItem('selectedStock', selectedStock);
    getOHLCData(selectedStock).then((res) => {
      const fullData = res.data['Time Series (Daily)'];
      const data = Object.keys(fullData).map(key => (
        fullData[key]
      )).slice(0, 50).reverse();
      this.drawChart(data);
    });
  }

  drawChart(data) {
    const ctx = this.canvas.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let maxValue = 0;
    let minValue = 99999;
    data.forEach((day) => {
      maxValue = Math.max(maxValue, day['2. high']);
      minValue = Math.min(minValue, day['3. low']);
    });
    minValue = Math.floor(minValue / 10) * 10;
    maxValue = Math.ceil(maxValue / 10) * 10;

    const canvasActualWidth = CANVAS_WIDTH - PADDING * 2;
    const canvasActualHeight = CANVAS_HEIGHT - PADDING * 2;

    let gridValue = minValue;
    // const gridScale = (maxValue - minValue) / 10;
    const gridScale = 10; // keep scale to 10 for consistent comparison between stocks
    while (gridValue <= maxValue) {
      const gridY = canvasActualHeight * (1 - ((gridValue - minValue) / (maxValue - minValue)))
        + PADDING;
      Chart.drawLine(ctx, 36, gridY, 42, gridY, 'black');
      // grid markers
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`$${gridValue}`, 32, gridY + 4);
      ctx.restore();
      gridValue += gridScale; // a marker every $10
    }
    // full-length line at 0
    Chart.drawLine(ctx, 36, canvasActualHeight + PADDING, canvasActualWidth + PADDING, canvasActualHeight + PADDING, 'black');

    // vertical lines
    const valuePadding = 32;
    let x = 0;
    while (x <= data.length) {
      const gridX = (((canvasActualWidth - valuePadding) / data.length) * x)
        + valuePadding + PADDING;
      Chart.drawLine(ctx, gridX, PADDING, gridX, canvasActualHeight + PADDING, 'grey');
      x += 1;
    }

    // data
    data.forEach((day, index) => {
      // high-low bars
      const thickness = 4;
      const open = day['1. open'];
      const high = day['2. high'];
      const low = day['3. low'];
      const close = day['4. close'];
      const color = open > close ? 'red' : 'green';
      const upperLeftCornerX = (((canvasActualWidth - valuePadding) / data.length) * (index + 1))
        + valuePadding + PADDING - (thickness / 2);
      const upperLeftCornerY = canvasActualHeight
        * (1 - ((high - minValue) / (maxValue - minValue))) + PADDING;
      const lowerLeftCornerY = canvasActualHeight
        * (1 - ((low - minValue) / (maxValue - minValue))) + PADDING;
      const height = lowerLeftCornerY - upperLeftCornerY;
      Chart.drawBar(ctx, upperLeftCornerX, upperLeftCornerY, thickness, height, color);

      // open-close ticks
      const tickWidth = 6;
      const tickHeight = thickness / 2;
      const openUpperLeftCornerX = (((canvasActualWidth - valuePadding) / data.length)
        * (index + 1)) + valuePadding + PADDING - (thickness / 2) - tickWidth;
      // - tickHeight / 2 to normalise
      const openUpperLeftCornerY = canvasActualHeight
        * (1 - ((open - minValue) / (maxValue - minValue))) + PADDING - (tickHeight / 2);
      const closeUpperLeftCornerX = openUpperLeftCornerX + tickWidth + thickness;
      const closeUpperLeftCornerY = canvasActualHeight
        * (1 - ((close - minValue) / (maxValue - minValue))) + PADDING - (tickHeight / 2);
      Chart.drawBar(ctx, openUpperLeftCornerX, openUpperLeftCornerY,
        tickWidth, tickHeight, color);
      Chart.drawBar(ctx, closeUpperLeftCornerX, closeUpperLeftCornerY,
        tickWidth, tickHeight, color);
    });
  }

  render() {
    const { selectedStock } = this.state;
    const stockChoices = ['AMZN', 'MSFT', 'AAPL', 'GOOG', 'INTC', 'AMD', 'TSLA', 'NFLX', 'ORCL', 'LUV', 'HOG'];
    return (
      <Fragment>
        <div className="Header">A HEADER </div>
        <div className="Main">
          <div className="StockChoices">
            {stockChoices.map(stock => (
              <Button
                key={stock}
                activeValue={selectedStock}
                value={stock}
                onButtonClick={this.setStock}
              />
            ))}
          </div>
          <div className="CanvasContainer">
            <canvas ref={this.canvas} className="Canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          </div>
        </div>
        <div className="Footer">a footer</div>
      </Fragment>
    );
  }
}

export default Chart;
