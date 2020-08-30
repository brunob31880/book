var svg=d3.select(".box").append('svg').attr("width",1000).attr("height",20);
svg.append("line").attr("x1",0).attr("y1",0).attr("x2",10).attr("y2",0)
.attr("style","stroke:rgb(0,0,255);stroke-width:5");
function anim(){
    svg.select('line')
    .transition().delay(500)
    .attr("x2",1000);
};
window.onload = function() { anim();  };