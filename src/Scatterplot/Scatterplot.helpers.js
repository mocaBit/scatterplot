export function generateFakeWebMetrics(startDate, endDate, dataCount) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    // Ensure the range is large enough to accommodate the dataCount
    if ((end - start) / oneDay < dataCount) {
        throw new Error('Date range is not large enough for the specified data count');
    }

    const data = [];
    for (let i = 0; i < dataCount; i++) {
        const date = new Date(start + i * oneDay);
        const rowCount = Math.floor(Math.random() * 10) + 1; // Generate a random number of rows per day (1 to 10)
        for (let j = 0; j < rowCount; j++) {
            const time = Math.floor(Math.random() * 24 * 60 * 60 * 1000); // Generate a random time within a day
            const dateTime = new Date(date.getTime() + time);
            data.push({
                datetime: dateTime.toISOString().split('.')[0], // format datetime as YYYY-MM-DDTHH:MM:SS
                LCP: Math.random() * 2.5, // LCP: 0 to 2.5 seconds
                CLS: Math.random(), // CLS: 0 to 1
                FID: Math.random() * 100 // FID: 0 to 100 milliseconds
            });
        }
    }

    return data;
}

export const drawXaxis = (context, xScale, Y, xExtent) => {
    const [startX, endX] = xExtent;
    const tickSize = 6;
    const xTicks = xScale.ticks(); // You may choose tick counts. ex: xScale.ticks(20)
    const xTickFormat = xScale.tickFormat(20); // you may choose the format. ex: xScale.tickFormat(tickCount, ".0s")

    context.strokeStyle = "black";

    context.beginPath();
    xTicks.forEach(d => {
        context.moveTo(xScale(d), Y);
        context.lineTo(xScale(d), Y + tickSize);
    });
    context.stroke();

    context.beginPath();
    context.moveTo(startX, Y + tickSize);
    context.lineTo(startX, Y);
    context.lineTo(endX, Y);
    context.lineTo(endX, Y + tickSize);
    context.stroke();

    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "black";
    xTicks.forEach(d => {
        context.beginPath();
        context.fillText(xTickFormat(d), xScale(d), Y + tickSize);
    });
}

export const drawYaxis = (context, yScale, X, yExtent) => {
    const [startY, endY] = yExtent;

    const tickPadding = 3,
        tickSize = 6,
        yTicks = yScale.ticks(),
        yTickFormat = yScale.tickFormat();

    context.strokeStyle = "black";
    context.beginPath();
    yTicks.forEach((d) => {
        context.moveTo(X, yScale(d));
        context.lineTo(X - tickSize, yScale(d));
    });
    context.stroke();

    context.beginPath();
    context.moveTo(X - tickSize, startY);
    context.lineTo(X, startY);
    context.lineTo(X, endY);
    context.lineTo(X - tickSize, endY);
    context.stroke();

    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    yTicks.forEach((d) => {
        context.beginPath();
        context.fillText(yTickFormat(d), X - tickSize - tickPadding, yScale(d));
    });
}