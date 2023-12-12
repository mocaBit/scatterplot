'use client';
import React, { useRef, useEffect } from 'react';
import { scaleLinear, scaleTime } from 'd3';
import { drawXaxis, drawYaxis } from './Scatterplot.helpers';

export const Scatterplot = ({ height = 400, width = 600, data }) => {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const selectionRef = useRef({ start: null, end: null });

  useEffect(() => {
    if (canvasRef.current) {
      const margin = { left: 35, right: 25, top: 25, bottom: 25 };
      const xRange = [margin.left, width - margin.right];
      const yRange = [margin.top, height - margin.bottom];
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context === null) return;
      canvas.width = width;
      canvas.height = height;

      // Create scales for x and y axis
      const xScale = scaleTime()
        .domain([
          new Date(data[0].datetime).getTime(),
          new Date(data[data.length - 1].datetime).getTime(),
        ]) // Replace with your data domain
        .range(xRange);

      const yScale = scaleLinear()
        .domain([5, 0]) // Replace with your data domain
        .range(yRange);

      drawXaxis(context, xScale, yRange[1], xRange);
      drawYaxis(context, yScale, xRange[0], yRange);

      const drawPoint = (time, seconds, color) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(xScale(time) + margin.left, yScale(seconds) - margin.bottom, 5, 0, 2 * Math.PI);
        context.fill();
      };

      data.forEach((item) => {
        const time = new Date(item.datetime).getTime();
        drawPoint(time, item.CLS, '#69b3a2');
        drawPoint(time, item.FID, '#6973b3');
        drawPoint(time, item.LCP, '#b36969');
      });
    }
  }, []);

  // Handle zoom out event
  const handleZoomOut = () => {
    // TODO: Implement zoom out logic
    console.log('zoom out');
  };

  // Handle zoom in event
  const handleZoomIn = () => {
    // TODO: Implement zoom in logic
    console.log('zoom in');
  };

  const getRelativePosition = (x, y) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const canvasDimension = canvasRef.current.getBoundingClientRect();
    return {
      x: x - canvasDimension.left,
      y: y - canvasDimension.top,
    };
  };

  // Handle select portion event
  const handleStartSelectPortion = (e) => {
    selectionRef.current.start = getRelativePosition(e.clientX, e.clientY);
    console.log(selectionRef.current.start);
  };

  const handleEndSelectPortion = (e) => {
    selectionRef.current.end = getRelativePosition(e.clientX, e.clientY);
    console.log(selectionRef.current.end);
  };

  // Handle select portion event
  const handleOnMove = (e) => {
    const tempPosition = getRelativePosition(e.clientX, e.clientY);
    console.log(tempPosition);

    /* console.log(e);
     e.preventDefault();
        e.stopPropagation();
        var mouseX = e.clientX - offsetX;
        var mouseY = parseInt(e.clientY - offsetY);

        var dx = mouseX - circle.cx;
        var dy = mouseY - circle.cy;
        var isInside = dx * dx + dy * dy <= circle.radius * circle.radius;

        if (isInside && !circle.wasInside) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          // drawCircle(circle, isInside);
        } else if (!isInside && circle.wasInside) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          // drawCircle(circle, isInside);


      // Add event listeners
      canvas.addEventListener('wheel', handleZoomOut);
      canvas.addEventListener('dblclick', handleZoomIn);
      canvas.addEventListener('mousedown', handleSelectPortion);
      canvas.addEventListener('mousemove', handleOnMove);
        } */
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: 'white' }}
        onWheel={handleZoomOut}
        onDoubleClick={handleZoomIn}
        onMouseDown={handleStartSelectPortion}
        onMouseUp={handleEndSelectPortion}
        onMouseMove={handleOnMove}
      ></canvas>
      <svg
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        ref={svgRef}
        width={width}
        height={height}
      />
    </div>
  );
};
