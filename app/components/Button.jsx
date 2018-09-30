import React, { Component } from 'react';

class Button extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { onButtonClick, value } = this.props;
    onButtonClick(value);
  }

  render() {
    const { value, activeValue } = this.props;
    const isActive = value === activeValue;
    return (
      <button className={`Button${isActive ? ' Button--active' : ''}`} type="button" onClick={this.handleClick}>{value}</button>
    );
  }
}

export default Button;
