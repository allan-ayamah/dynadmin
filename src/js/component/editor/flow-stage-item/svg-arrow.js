import React from 'react';

function computeEndingArrowDirectionVector(endingAnchor) {
  switch (endingAnchor) {
    case 'left':
      return { arrowX: -1, arrowY: 0 };
    case 'right':
      return { arrowX: 1, arrowY: 0 };
    case 'top':
      return { arrowX: 0, arrowY: -1 };
    case 'bottom':
      return { arrowX: 0, arrowY: 1 };
    default:
      return { arrowX: 0, arrowY: 0 };
  }
}

export function computeEndingPointAccordingToArrow(
  xEnd,
  yEnd,
  arrowLength,
  strokeWidth,
  endingAnchor,
) {
  const { arrowX, arrowY } = computeEndingArrowDirectionVector(endingAnchor);

  const xe = xEnd + (arrowX * arrowLength * strokeWidth) / 2;
  const ye = yEnd + (arrowY * arrowLength * strokeWidth) / 2;

  return { xe, ye };
}

export function computeStartingAnchorPosition( 
    xs,
    ys,
    xe,
    ye, 
    startingAnchor){
  if (startingAnchor === 'top' || startingAnchor === 'bottom') {
    return {
      xa1: xs,
      ya1: ys + (ye - ys) / 2,
    };
  }
  if (startingAnchor === 'left' || startingAnchor === 'right') {
    return {
      xa1: xs + (xe - xs) / 2,
      ya1: ys,
    };
  }

  return { xa1: xs, ya1: ys };
}

export function computeEndingAnchorPosition(
  xs,
  ys,
  xe,
  ye,
  endingAnchor,
) {
  if (endingAnchor === 'top' || endingAnchor === 'bottom') {
    return {
      xa2: xe,
      ya2: ye - (ye - ys) / 2,
    };
  }
  if (endingAnchor === 'left' || endingAnchor === 'right') {
    return {
      xa2: xe - (xe - xs) / 2,
      ya2: ye,
    };
  }

  return { xa2: xe, ya2: ye };
}

const SVGArrow = ({
  startingPoint,
  startingAnchor,
  endingPoint,
  endingAnchor,
  strokeColor,
  arrowLength,
  strokeWidth,
}) => {
  const actualArrowLength = arrowLength * 2;

  const xs = startingPoint.x;
  const ys = startingPoint.y;

  const { xe, ye } = computeEndingPointAccordingToArrow(
    endingPoint.x,
    endingPoint.y,
    actualArrowLength,
    strokeWidth,
    endingAnchor,
  );

  const { xa1, ya1 } = computeStartingAnchorPosition(
    xs,
    ys,
    xe,
    ye,
    startingAnchor,
  );
  const { xa2, ya2 } = computeEndingAnchorPosition(
    xs,
    ys,
    xe,
    ye,
    endingAnchor,
  );
  // 'M 0 0 L 190 100'
  //`M${xs},${ys} ` + `C${xa1},${ya1} ${xa2},${ya2} ` + `${xe},${ye}`;
  const pathString =
    `M ${startingPoint.x} ${startingPoint.y} ` + ` L ${endingPoint.x} ${endingPoint.y}`;
  
    //`M ${startingPoint.x} ${startingPoint.y} ` + ` L ${endingPoint.x} ${endingPoint.y}`;
    alert(pathString)
    const svgStyle = {
      position: 'absolute',
    }
    const svgWidth = endingPoint.x;
    const svgHeight = endingPoint.y;
  return (
    <svg style={svgStyle} width={svgWidth} height={svgHeight}>
      <path
        d={pathString}
        style={{ fill: 'none', stroke: strokeColor, strokeWidth }}
      />
      </svg>
  );
};

export default SVGArrow;