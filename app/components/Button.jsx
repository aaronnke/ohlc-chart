import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    const { value, isActive } = this.props;
    return (
      <button className={`Button${isActive ? ' Button--active' : ''}`} type="button" onClick={this.handleClick}>{value}</button>
    );
  }
}

Button.propTypes = {
  value: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

export default Button;
