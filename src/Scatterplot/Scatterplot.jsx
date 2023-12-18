'use client';
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { scaleLinear, scaleTime, select, axisBottom, axisLeft, pointer } from 'd3';

const STYLES = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#000000AA',
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 1000,
    display: 'none',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: '2px solid #7a7474',
  },
  selection: {
    fill: '#00000055',
    stroke: '#000000AA',
  },
  selectionControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'justify',
  }
};

const MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
const BOTTOM_AXIS_HEIGHT = 20;
const LEFT_AXIS_WIDTH = 30;

const COLORS = {
  CLS: {
    fill: '#6973b3',
    stroke: '#304cff',
  },
  FID: {
    fill: '#69b3a2',
    stroke: '#208970',
  },
  LCP: {
    fill: '#cf4a4a',
    stroke: '#ff3d3d',
  },
};

export const Scatterplot = ({ height = 400, width = 600, data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const sliceRef = useRef(null);

  const [selectedDomain, setSelectedDomain] = useState(null);
  // const [selectedData, setSelectedData] = useState(data);

  const leftAxisHeight = height - BOTTOM_AXIS_HEIGHT - MARGINS.bottom - MARGINS.top;
  const bottomAxisWidth = width - LEFT_AXIS_WIDTH - MARGINS.left - MARGINS.right;

  const { xScale, yScale } = useMemo(() => {
    const { min, max } =
      selectedDomain !== null
        ? selectedDomain
        : data.reduce(
          (acc, item) => {
            const x = new Date(item.datetime).getTime();
            if (x < acc.min.x) acc.min.x = x;
            if (x > acc.max.x) acc.max.x = x;

            acc.min.y = Math.min(item.CLS, item.FID, item.LCP, acc.min.y);
            acc.max.y = Math.max(item.CLS, item.FID, item.LCP, acc.max.y);

            return acc;
          },
          { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } }
        );
    return {
      xScale: scaleTime().domain([min.x, max.x]).range([0, bottomAxisWidth]),
      yScale: scaleLinear().domain([min.y, max.y]).range([leftAxisHeight, 0]),
    };
  }, [data, bottomAxisWidth, leftAxisHeight, selectedDomain]);

  const [visibleData, setVisibleData] = useState({ FID: true, CLS: true, LCP: true });

  const appendAxis = (width, height) => {
    const container = select(svgRef.current).attr('width', width).attr('height', height);

    container
      .append('g')
      .attr('width', bottomAxisWidth)
      .attr('height', BOTTOM_AXIS_HEIGHT)
      .attr(
        'transform',
        `translate(${MARGINS.left + LEFT_AXIS_WIDTH}, ${height - BOTTOM_AXIS_HEIGHT - MARGINS.bottom
        })`
      )
      .call(axisBottom(xScale));

    container
      .append('g')
      .attr('width', LEFT_AXIS_WIDTH)
      .attr('height', leftAxisHeight)
      .attr('transform', `translate(${LEFT_AXIS_WIDTH + MARGINS.left}, ${MARGINS.top})`)
      .call(axisLeft(yScale));
  };

  const appendDots = (data, visibleData) => {
    const dotsContainer = select(svgRef.current)
      .append('g')
      .attr('width', bottomAxisWidth)
      .attr('height', leftAxisHeight)
      .attr('transform', `translate(${MARGINS.left + LEFT_AXIS_WIDTH}, ${MARGINS.top})`);

    const xAxisGrid = axisBottom(xScale).tickSize(leftAxisHeight).tickFormat('').ticks(10);
    const yAxisGrid = axisLeft(yScale).tickSize(-bottomAxisWidth).tickFormat('').ticks(10);
    dotsContainer.append('g').attr('class', 'grid').call(xAxisGrid);
    dotsContainer.append('g').attr('class', 'grid').call(yAxisGrid);

    Object.entries(visibleData).forEach(([key, isVisible]) => {
      if (!isVisible) return;
      dotsContainer
        .append('g')
        .attr('width', bottomAxisWidth)
        .attr('height', leftAxisHeight)
        .selectAll('dot')
        .data(data)
        .enter()
        .filter((d) => {
          const time = new Date(d.datetime).getTime();
          const isValidX = time >= xScale.domain()[0] && time <= xScale.domain()[1];
          const isValidY = d[key] >= yScale.domain()[0] && d[key] <= yScale.domain()[1];
          return isValidX && isValidY;
        })
        .append('circle')
        .attr('cx', ({ datetime }) => xScale(new Date(datetime).getTime()))
        .attr('cy', (d) => yScale(d[key]))
        .attr('r', 3)
        .style('fill', COLORS[key].fill)
        .style('stroke', COLORS[key].stroke)
        .on('mouseover', handleMouseHover)
        .on('mouseleave', handleMouseLeave);
    });

    select(svgRef.current)
      .on('mousedown', handleMouseDown)
      .on('mousemove', handleMouseMove)
      .on('mouseup', handleMouseUp);
  };

  const handleMouseHover = (e, data) => {
    if (select(sliceRef.current).attr('data-active') === 'true') return;

    const style = tooltipRef.current.style;
    style.display = 'block';
    style.top = `${e.clientY}px`;
    style.left = `${e.clientX}px`;
    tooltipRef.current.innerHTML = `
        <div>
          <div>CLS: ${parseInt(data.CLS)} secs</div>
          <div>FID: ${parseInt(data.FID)} secs</div>
          <div>LCP: ${parseInt(data.LCP)} secs</div>
        </div>
      `;
  };

  const handleMouseLeave = () => {
    tooltipRef.current.style.display = 'none';
    tooltipRef.current.innerHTML = ``;
  };

  const handleMouseDown = (e) => {
    const slice = select(sliceRef.current);
    if (slice.attr('data-active') === 'true') return;

    const [x, y] = pointer(e);
    slice
      .attr('x', x)
      .attr('y', y)
      .attr('data-x1', x)
      .attr('data-y1', y)
      .attr('width', 0)
      .attr('height', 0)
      .attr('data-active', 'true');
  };

  const handleMouseMove = (e) => {
    const slice = select(sliceRef.current);
    if (slice.attr('data-active') !== 'true') return;

    const x1 = +slice.attr('data-x1');
    const y1 = +slice.attr('data-y1');
    const [x2, y2] = pointer(e);

    /* calculate limits
    const isOutOfLimits = MARGINS.top > y2 > MARGINS.top + leftAxisHeight;

    if (isOutOfLimits) return; */

    const newX = Math.min(x2, x1);
    const newY = Math.min(y2, y1);
    const newWidth = Math.abs(x1 - x2);
    const newHeight = Math.abs(y1 - y2);


    const innerHtml = `[${xScale.invert(newX)}, ${xScale.invert(newX + newWidth)}]`;
    slice.attr('x', newX).attr('y', newY).attr('width', newWidth).attr('height', newHeight);
    slice.select('text').text(innerHtml);
  };

  const handleMouseUp = (e) => {
    if (!sliceRef.current) return;

    const slice = select(sliceRef.current);
    slice.attr('data-active', 'false');
    const x1 = +slice.attr('data-x1');
    const y1 = +slice.attr('data-y1');
    const [x2, y2] = pointer(e);

    const newX = Math.min(x2, x1);
    const newY = Math.min(y2, y1);
    const newWidth = Math.abs(x1 - x2);
    const newHeight = Math.abs(y1 - y2);

    if (newWidth < 50 && newHeight < 50) return;

    slice
      .attr('data-x1', undefined)
      .attr('data-y1', undefined)
      .attr('width', 0)
      .attr('height', 0)
      .attr('data-active', undefined);

    const newRange = {
      min: {
        x: xScale.invert(newX),
        y: yScale.invert(newY + newHeight)
      },
      max: {
        x: xScale.invert(newX + newWidth),
        y: yScale.invert(newY)
      },
    }
    const newData = data.filter((item) => {
      const x = new Date(item.datetime).getTime();
      const y = item.CLS;
      return x >= newRange.min.x && x <= newRange.max.x && y >= newRange.min.y && y <= newRange.max.y;
    });
    setSelectedDomain(newRange);
    // setSelectedData(newData)
  };

  useEffect(() => {
    if (data.lenght === 0) return;
    appendAxis(width, height);
    appendDots(data, visibleData);
    return () => select(svgRef.current).selectAll('g').remove();
  }, [visibleData, data, width, height, selectedDomain]);

  return (
    <div style={STYLES.root}>
      <svg ref={svgRef}>
        <rect ref={sliceRef} width={0} height={0} style={STYLES.selection} aria-disabled />
      </svg>
      <div style={STYLES.tooltip} ref={tooltipRef}></div>
      <div style={STYLES.controls}>
        {['FID', 'CLS', 'LCP'].map((key) => (
          <label key={key} style={{ color: COLORS[key].stroke, fontWeight: 'bold' }}>
            <input
              type="checkbox"
              name={key}
              checked={visibleData[key]}
              onChange={() => setVisibleData({ ...visibleData, [key]: !visibleData[key] })}
            />
            {key}
          </label>
        ))}
        {selectedDomain !== null ? (
          <div style={STYLES.selectionControls}>
            <strong>Selected Ranges</strong>
            Horizontal: [{new Date(selectedDomain.min.x).toLocaleDateString()} - {new Date(selectedDomain.max.x).toLocaleDateString()}]
            <br />
            Vertical: [{parseInt(selectedDomain.min.y)} - {parseInt(selectedDomain.max.y)}]
            <button onClick={() => {
              setSelectedDomain(null);
              // setSelectedData(data);
            }}>Reset Selection</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
