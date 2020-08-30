const svg=d3.select('.box').append('svg').attr('width',600).attr('height',600).style('background','White');
const margin={top:20,right: 20,bottom :20,left:100};
const graphW=600-margin.left-margin.right;
const graphH=600-margin.top-margin.left;
const g=svg.append('g').attr('width',graphW).attr('height',graphH).attr('transform',`translate(${margin.left}, ${margin.top})`);
const gX=g.append('g');
gX.attr('transform',`translate (0,${graphH})`);
const gY=g.append('g');

var d=[];
const dmax=d3.max(d,data => data.prix);
const x=d3.scaleBand().range([0,480]).paddingInner(0.3).paddingOuter(0.2);
const y=d3.scaleLinear().range([graphH,0]);

const axeX=d3.axisBottom(x);
const axeY=d3.axisLeft(y).ticks(5).tickFormat(d => d+' euros');


// fonction de mise à jour 
const maj=(d) =>{
    x.domain(d.map (item => item.nom));
    y.domain([0,d3.max(d,data => data.prix)]);
    const rects=g.selectAll('rect').data(d);

    rects.attr('x',d => x(d.nom))
       .attr('width',x.bandwidth)
       .attr('fill', 'teal')
       .transition()
       .duration(600)
       .attr('height', d => graphH-y(d.prix))
       .attr('y', d => y(d.prix));

    rects.exit().remove();
    

    rects.enter()
       .append('rect')
       .attr('fill', 'teal')
       
     //  .attr('height', d => graphH-y(d.prix))
       .attr('x',d => x(d.nom))
       .attr('y',graphH)
       .attr('width',x.bandwidth())
       .attr('height',0)
       .transition()
       .duration(600)
       .attr('y', d=> y(d.prix))
       .attr('height', d => graphH-y(d.prix));

       gX.call(axeX);

       gY.call(axeY);

};   

// db.collection('pays').get().then(res => { 
    
//     res.docs.forEach(doc => {
//         //console.log(doc.data());
//         d.push(doc.data());
//     });
//     //const dmin=d3.min(d,data => data.prix);
//    maj(d);
    
// })
db.collection('pays').onSnapshot(res => {   
    console.log(res.docChanges());
    res.docChanges().forEach(change => {
       // console.log(change);
       const doc={...change.doc.data(),id:change.doc.id};
       switch(change.type){
           case 'added':
               d.push(doc);
               break;
            case 'modified':
                const index=d.findIndex(item => item.id==doc.id);
                d[index]=doc;
                break;
            case 'removed':
                d=d.filter(item => item.id !== doc.id);
                break;
            default:
                break;
       }
       maj(d);
    })
})