async function drawChart() {

    // access data
    const pathToJSON = 'data.json';
    let data = await d3.json(pathToJSON);
    const regex = /^.*q3.*$/;
    data = data.filter(d => regex.test(d.time));

    console.log(data);
    // var dataReady = data.map(function(d) { // .map allows to do something for each element of the list
    //     return {
    //         name: d.emp,
    //         values: data.map(function(d) {
    //             return { time: d.time };
    //         })
    //     };
    // });


    //define dimensions
    const width = 600;
    const dimensions = {
        width,
        height: width * 0.6,
        margin: {
            top: 30,
            right: 100,
            bottom: 50,
            left: 100
        }
    };
    
    const boundedWidth =
        dimensions.width - dimensions.margin.left - dimensions.margin.right;
    
    const boundedHeight =
        dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    

    const root = d3.select('#wrapper');
  
    const wrapper = root.append('svg')
        .attr('width', dimensions.width + 200)
        .attr('height', dimensions.height);
    
    const bounds = wrapper.append('g')
        .attr('width', boundedWidth)
        .attr('height', boundedHeight)
        .attr(
            'transform',
            `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
        );
    
    const dateParser = d3.timeParse('%Y');
    // const xAccessor = d => dateParser(d.time.substring(0,4))
    const xAccessor = d => dateParser(d.time.substring(0, 4));
    const y0Accessor = d => d.vl;
    const y1Accessor = d => d.ur;
    
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, boundedWidth])
        .nice();
  
    
    const makeScale = (accessor) => (
        d3.scaleLinear()
            .domain([0, d3.max(data, accessor) + 1])
            .range([boundedHeight, 0])
            .nice()
    );
  
    const y0Scale = makeScale(y0Accessor);
    const y1Scale = makeScale(y1Accessor);
  
    function drawData(g, accessor, color, cl){ 
        // draw circles
        g.selectAll('circle').data(data).enter() .append('circle')
            .attr('r', 3)
            .attr('cx', d => xScale(xAccessor(d)))
            .attr('cy', accessor)
            .attr('fill', color);
  // draw lines
        const lineGenerator = d3.line().curve(d3.curveCardinal) 
            .x(d=>xScale(xAccessor(d)))
            .y(accessor);
        g.append('path')
            .attr('fill', 'none')
            .attr('d', lineGenerator(data))
            .attr('stroke', color)
            .attr('class', cl);
    //.style("fill", (d, i) => color(i))
    
    }
    
    const g1 = bounds.append('g');
    const g2 = bounds.append('g');
    
    drawData(g1, d => y0Scale(y0Accessor(d)), '#e41a1c', 'emp');
    drawData(g2, d => y1Scale(y1Accessor(d)), '#377eb8', 'unemp');
    
  
    bounds.append('defs').append('clipPath')
        .attr('id', 'bounds-clip-path')
        .append('rect')
        .attr('width', boundedWidth)
        .attr('height', boundedHeight);
  
    const clip = bounds.append('g')
        .attr('clip-path', 'url(#bounds-clip-path)');
    

  
    const y0AxisGenerator = d3.axisLeft()
        .scale(y0Scale)
        .ticks(5);
        
    
    const y1AxisGenerator = d3.axisRight()
        .scale(y1Scale);
  
    const y0Axis = bounds.append('g')
        .attr('class', 'y-axis')
        .call(y0AxisGenerator)
        .attr('transform', 'translate(-10, 0)');

    
    const y1Axis = bounds.append('g')
        .attr('class', 'y-axis')
        .call(y1AxisGenerator)
        .attr('transform', `translate(${boundedWidth + 10}, 0)`);


    const y0AxisLabel = y0Axis.append('text')
        .attr('class', 'y-axis-label')
        .attr('x', -boundedHeight / 2)
        .attr('y', -dimensions.margin.left + 50)
        .html('Vacancy rate (% of labour force)');

    const y1AxisLabel = y1Axis.append('text')
        .attr('class', 'y-axis-label')
        .attr('x', -boundedHeight / 2)
        .attr('y', dimensions.margin.left - 50)
        .html('Unemployment rate (% of labour force)');
  
    const formatYear = d3.timeFormat('%Y');

    const xAxisGenerator = d3.axisBottom()
        .scale(xScale);
        // .tickFormat(d => formatYear(d) + 'q3');
        
        
    const xAxis = bounds.append('g')
        .attr('class', 'x-axis')
        .style('transform', `translateY(${boundedHeight}px)`)
        .call(xAxisGenerator);
    


//interactions

    // bounds.selectAll('path')
    //     .on('mouseenter', function(data, index, nodes) { console.log({ data, index, nodes });
    //     });

    // if (i === 0) {
    //     accessor = y0Accessor;
    //     scale = y0Scale;
    // }
    // else { 
    //     accessor = y1Accessor;
    //     scale = y1Scale;}


    const tooltip = d3.select('#tooltip');

    // bounds.selectAll('circle')
    //     .on('mouseover', function(d) {
    //     //Get this bar's x/y values, then augment for the tooltip

    //         var xPosition = parseFloat(d3.select(this).attr('cx')) + xScale(xAccessor(d)) / 2; 
    //         var yPosition = parseFloat(d3.select(this).attr('cy')) / 2 + boundedHeight / 2;
    //     //Update the tooltip position and value

    //         tooltip.style('transform', `translate(
    //     ${xPosition}px, ${yPosition}px`);
    //         // tooltip
    //         //     .style('left', xPosition + 'px') 
    //         //     .style('top', yPosition + 'px') .select('#value')
    //         //     .text(d);
    //     //Show the tooltip
    //         tooltip.style('opacity', 1);
    //     });

    const lineSvg = wrapper.append('g');

    const focus = wrapper.append('g')
        .style('display', 'none');

    // lineSvg.append('path')
    //     .attr('class', 'line')
    //     .attr('d', g1);

    // console.log(lineSvg);
    
    g1.selectAll('circle')
        // .on('mouseenter', onMouseEnter)
        .on('mouseenter', () => tooltip.call(onMouseEnter, y0Scale, y0Accessor, data))
        .on('mouseleave', onMouseLeave);

    g2.selectAll('circle')
        // .on('mouseenter', onMouseEnter)
        .on('mouseenter', () => tooltip.call(onMouseEnter, y1Scale, y1Accessor, data))
        .on('mouseleave', onMouseLeave);

        
    function onMouseEnter(yScale, accessor, data) {
        tooltip.text(accessor(data));

        const x = xScale(xAccessor(data))
        + dimensions.margin.left;
        const y = yScale(accessor(data))
        + dimensions.margin.top;

        tooltip.style('transform', `translate(`
        + `calc(-50% + ${x}px),`
        + `calc(-100% + ${y}px)`
        + `)`);
        tooltip.style('opacity', 1);
    }

    function onMouseLeave() {
        tooltip.style('opacity', 0);
    }

    // Legend
    const ordinal = d3.scaleOrdinal()
        .domain(['Vacancy Level', 'Unemployment Rate'])
        .range(d3.schemeSet1);

    wrapper.append('g')
        .attr('class', 'legendOrdinal')
        .attr('transform', `translate(${width}, 50)`);

    const legendOrdinal = d3.legendColor()

        .shape('path', d3.symbol().type(d3.symbolCircle).size(100)())
        .shapePadding(10)
  //use cellFilter to hide the "e" cell
        .cellFilter(function(d){ return d.label !== 'e'; })
        .scale(ordinal);

    wrapper.select('.legendOrdinal')
        .call(legendOrdinal);
    
}


drawChart();
