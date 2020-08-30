const svg=d3.select('.box').append('svg').attr('width',600).attr('height',600).style('background','White');
const margin={top:20,right: 20,bottom :20,left:100};
const graphW=600-margin.left-margin.right;
const graphH=600-margin.top-margin.left;
const g=svg.append('g').attr('width',graphW).attr('height',graphH).attr('transform',`translate(${margin.left}, ${margin.top})`);
const gX=g.append('g');
const gY=g.append('g');
d3.json('datas.json').then(d => { 
    const dmin=d3.min(d,data => data.prix);
    const dmax=d3.max(d,data => data.prix);
    const x=d3.scaleBand().domain(d.map (item => item.nom)).range([0,480]).paddingInner(0.3).paddingOuter(0.2);
    const y=d3.scaleLinear().domain([0,dmax]).range([graphH,0]);
    g.selectAll('rect')
       .data(d)
       .attr('x',d => x(d.nom))
       .attr('width',x.bandwidth)
       .attr('height', d => graphH-y(d.prix))
       .attr('y', function(d){return y(d.prix)})
       .attr('fill', 'teal')
       .enter()
       .append('rect')
       .attr('fill', 'teal')
      //.attr('width',50)
       .attr('width',x.bandwidth())
       .attr('height', d => graphH-y(d.prix))
       .attr('y', function(d){return y(d.prix)})
      // .attr('x', (d,i) => i*75);
       .attr('x',d => x(d.nom));
    const axeX=d3.axisBottom(x);
    const axeY=d3.axisLeft(y).ticks(5).tickFormat(d => d+' euros');
    gX.call(axeX);
    gX.attr('transform',`translate (0,${graphH})`);
    gY.call(axeY);
})