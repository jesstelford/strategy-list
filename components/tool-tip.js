import React from 'react';
import styled from 'styled-components';

// From https://codepen.io/cbracco/pen/qzukg
const ToolTip = styled.div`
  position: relative;
  z-index: 2;
  cursor: pointer;

  /* Hide the tooltip content by default */
  &:before,
  &:after {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  /* Position tooltip above the element */
  &:before {
    content: "${props => props.tip}";
    position: absolute;
    ${props => (props.verticalPos !== 'below' ? 'bottom' : 'top')}: 150%;
    left: 80px;
    margin-${props => (props.verticalPos !== 'below' ? 'bottom' : 'top')}: 5px;
    margin-left: -80px;
    padding: 7px;
    width: 160px;
    border-radius: 3px;
    background-color: #000;
    background-color: hsla(0, 0%, 20%, 0.9);
    color: #fff;
    font-weight: bold;
    text-align: center;
    font-size: 14px;
    line-height: 1.2;
  }

  /* Triangle hack to make tooltip look like a speech bubble */
  &:after {
    position: absolute;
    ${props => (props.verticalPos !== 'below' ? 'bottom' : 'top')}: 150%;
    left: 80px;
    margin-left: -5px;
    width: 0;
    border-${props =>
      props.verticalPos !== 'below' ? 'top' : 'bottom'}: 5px solid #000;
    border-${props =>
      props.verticalPos !== 'below'
        ? 'top'
        : 'bottom'}: 5px solid hsla(0, 0%, 20%, 0.9);
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
    content: " ";
    font-size: 0;
    line-height: 0;
  }

  /* Show tooltip content on hover */
  &:hover:before,
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;

export default ToolTip;
