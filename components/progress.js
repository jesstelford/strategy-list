import colors from 'colors.css';
import React from 'react';
import propTypes from 'prop-types';
import styled, { css } from 'styled-components';

const BG_COLOR = 'black';

const Text = styled.div`
  position: absolute;
  ${props =>
    props.progress <= 10
      ? css`
          color: ${props => colors[props.visualColor]};
          left: calc(100% + 0.5em);
        `
      : css`
          color: ${props => colors[props.bgColor]};
          left: 0;
          right: 0;
        `}
  top: 0;
  bottom: 0;
  text-align: center;
  font-weight: bold;
  white-space: nowrap;
`;

const Outer = styled.div`
  position: relative;
  background-color: ${props => colors[props.bgColor]};
  border-radius: calc(${props => props.visualHeight} / 2);
  padding: ${props => props.visualPadding};
`;

const Inner = styled.div`
  position: relative;
  background-color: ${props => colors[props.visualColor]};
  width: ${props => props.progress}%;
  height: calc(
    ${props => props.visualHeight} - calc(${props => props.visualPadding} * 2)
  );
  line-height: calc(
    ${props => props.visualHeight} - calc(${props => props.visualPadding} * 2)
  );
  border-radius: calc(
    calc(${props => props.visualHeight} / 2) -
      calc(${props => props.visualPadding})
  );
`;

const Progress = ({
  progress,
  max,
  height = '20px',
  padding = '3px',
  color = 'orange',
  bgColor = 'black',
}) => {
  let roundedProgress;

  if (!max) {
    roundedProgress = Math.floor(progress * 100);
  } else {
    roundedProgress = Math.floor((progress / max) * 100);
  }

  return (
    <Outer visualHeight={height} visualPadding={padding} bgColor={bgColor}>
      <Inner
        progress={roundedProgress}
        visualHeight={height}
        visualPadding={padding}
        visualColor={color}
      >
        <Text visualColor={color} progress={roundedProgress} bgColor={bgColor}>
          {max ? `${progress} / ${max}` : `${roundedProgress}%`}
        </Text>
      </Inner>
    </Outer>
  );
};

Progress.propTypes = {
  color: propTypes.oneOf(Object.keys(colors)),
  bgColor: propTypes.oneOf(Object.keys(colors)),
};

export default Progress;
