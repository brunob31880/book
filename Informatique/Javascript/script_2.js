window.onload = function () {
    var canvas;
    var ctx;
    var delay=200;
    var canvasW=900;
    var canvasH=600;
    var blockSize=30;
    var snakee;
    function init()
    {
    canvas=document.createElement('canvas');
    canvas.width=canvasW;
    canvas.height=canvasH;
    canvas.style.border="1px solid";
    document.body.appendChild(canvas);
    ctx=canvas.getContext('2d');
    snakee=new snake([[6,4],[5,4],[4,4]]);
    refreshCanvas();
    }
    function refreshCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    snakee.draw();
    snakee.advance();
    setTimeout(refreshCanvas,delay);
    }
    function drawBlock(ctx,position){
        var x=position[0]*blockSize;
        var y=position[1]*blockSize; 
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    function snake(body){
     this.body=body;
     this.draw=function(){
       ctx.save();
       ctx.fillStyle="#ff0000";
       for(var i=0 ;i<this.body.length;i++){
           drawBlock(ctx,this.body[i]);
       }
       ctx.restore();   
     };   
        this.advance=function(){
            var nextPosition=this.body[0].slice();
            nextPosition[0]++;
            this.body.unshift(nextPosition);
            this.body.pop();
        }
    }
    init();
 }