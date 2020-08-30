window.onload = function () {
    var canvas;
    var ctx;
    var delay=200;
    xCoord=30;
    yCoord=30;
    
    function init()
    {
    canvas=document.createElement('canvas');
    canvas.width=900;
    canvas.height=600;
    canvas.style.border="1px solid";
    document.body.appendChild(canvas);
    ctx=canvas.getContext('2d');
    refreshCanvas();
    }
    function refreshCanvas(){
    xCoord+=2;
    yCoord+=2;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#ff0000";
    ctx.fillRect(xCoord,yCoord,100,50);  
    setTimeout(refreshCanvas,delay);
    }
    init();
 }