const dims={height :300, width :300, radius: 150};
const svg=d3.select('.box')
    .append('svg')
    .attr('width',dims.width+150)
    .attr('height',dims.height+150);
const graph=svg.append('g')
                .attr('transform',`translate(${dims.width/2+5},${dims.height/2+5})`);
const pie=d3.pie()
        .sort(null)
        .value(d => d.prix);
const arcPath=d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius/2);

const couleur=d3.scaleOrdinal(d3['schemeAccent']);

const groupeLegend=svg.append('g')
                .attr('class',"legend")
                .attr('transform',`translate(${dims.width + 40},10)`);
const legend=d3.legendColor()
                .shape('circle')
                .scale(couleur);

const maj=(donnees)=>{
    couleur.domain(donnees.map(d=> d.nom));
    groupeLegend.call(legend);
    groupeLegend.selectAll('text')
        .attr('fill','#fff');
    const paths=graph.selectAll('path')
                     .data(pie(donnees));
    paths.exit()
        .remove();
    paths.attr('d',arcPath);
    paths.enter()
        .append('path')
       // .attr('d',arcPath)
        .attr('stroke','#fff')
        .attr('strocke-width',3)
        .attr('fill',d => couleur(d.data.nom))
        .transition()
        .duration(600)
        .attrTween('d',animEnter);
    graph.selectAll('path').on('click',deleteClick);
};
var donnees=[];

db.collection('depenses').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc={...change.doc.data(),id:change.doc.id};
        switch(change.type){
            case 'added':
                donnees.push(doc);
                break;
            case 'modified':
                const index=donnees.findIndex(item=>item.id==doc.id);
                donnees[index]=doc;
            case 'removed':
                donnees=donnees.filter(item=>item.id!==doc.id);
                break;
            default:
                break;
        };
        maj(donnees);
    })
})

const animEnter=(d) => {
    var i=d3.interpolate(d.startAngle,d.endAngle);
    return function(t){
        d.endAngle=i(t);
        return arcPath(d);
    }

};
const deleteClick=(e) =>{
    const id=e.data.id;
    db.collection('depenses').doc(id).delete();
};