var snakee;
var applee;
var blockSize=30;
var canvas;
var ctx;
var delay=200;
var canvasW=900;
var canvasH=600;
var widthInBlock=canvasW/blockSize;
var heightInBlock=canvasH/blockSize;
score=0;

window.onload = function () {    
    function init()
    {
    canvas=document.createElement('canvas');
    canvas.width=canvasW;
    canvas.height=canvasH;
    canvas.style.border="1px solid";
    document.body.appendChild(canvas);
    ctx=canvas.getContext('2d');
    snakee=new snake([[6,4],[5,4],[4,4],[3,4]],"right");
    applee=new pomme([10,10]);
    refreshCanvas();
    }
    function refreshCanvas(){
    
    snakee.advance();
    if (snakee.checkCollision())
        {
            gameOver();
        }
    else {
        if (snakee.isEatingApple(applee)) {
            score++;
   
            console.log("Pomme mangée");
            do {
                applee.setNewPosition();
            }while(applee.isOnSnake(snakee))
            snakee.ateApple=true;
        }
        else snakee.ateApple=false;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        snakee.draw();
        applee.draw();
        drawScore();
        setTimeout(refreshCanvas,delay);
    }  
        
    
    }
   
    function gameOver(){
        ctx.save();
        ctx.fillText("Game Over",5,15);
        ctx.fillText("Appuyer sur la touche espace pour rejouer",5,25);
        ctx.restore();
    }
    function drawBlock(ctx,position){
        var x=position[0]*blockSize;
        var y=position[1]*blockSize; 
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    function snake(body,direction){
     this.body=body;
     this.direction=direction;
     this.ateApple=false;
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
            switch(this.direction){
                case "left":
                    nextPosition[0]--;
                    break;
                case "right":
                    nextPosition[0]++;
                    break;
                case "up":
                    nextPosition[1]--;
                    break;
                case "down":
                    nextPosition[1]++;
                    break;
                default:
                    throw("Invalid direction");
            }
           
            this.body.unshift(nextPosition);
            if (!this.ateApple) this.body.pop();
        };
        this.setDirection=function(newDirection){
            var allowedDirections;
            switch(this.direction){
                case "left":
                    allowedDirections=["up","down"];
                    break;
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "up":
                     allowedDirections=["right","left"];
                    break;
                case "down":
                    allowedDirections=["right","left"];
                    break;
                default:
                    throw("Invalid direction");
            }
           console.log(newDirection+" "+allowedDirections+" index="+allowedDirections.indexOf(newDirection));
           if (allowedDirections.indexOf(newDirection)>-1) {
               console.log(newDirection);
               this.direction=newDirection;
           }
        };
        this.checkCollision=function(){
            var wallCollision=false;
            var snakeCollision=false;
            var head=this.body[0];
            var rest=this.body.slice(1);
            var snakeX=head[0];
            var snakeY=head[1];
            wallCollision=(!(snakeX>=0&&snakeX<widthInBlock))||(!(snakeY>=0&&snakeY<heightInBlock));
            console.log("WallCollision="+wallCollision);
            for (var i=0;i<rest.length;i++){
                if ((snakeX===rest[i][0])&&(snakeY===rest[i][1])) snakeCollision=true;
            }
             console.log("SnakeCollision="+snakeCollision);
            return wallCollision||snakeCollision;
        }
        this.isEatingApple=function(apple){
            var head=this.body[0];
            var snakeX=head[0];
            var snakeY=head[1];
            return (snakeX===apple.position[0]&&snakeY===apple.position[1]);
        }
    }
    function pomme(position){
     this.position=position;
     this.draw=function(){
       ctx.save();
       ctx.fillStyle="#33cc33";
       ctx.beginPath();
       var radius=blockSize/2;     
       var x=this.position[0]*blockSize+radius;
       var y=this.position[1]*blockSize+radius;
       ctx.arc(x,y,radius,0,Math.PI*2,true);
       ctx.fill();     
       ctx.restore();   
     };
    this.setNewPosition=function(){
      newX=Math.round(Math.random()*(widthInBlock-1));
      newY=Math.round(Math.random()*(heightInBlock-1));
      console.log("Nouvelle position ("+newX+","+newY+")");
      this.position=[newX,newY];
    };
    this.isOnSnake=function(snake){
        var snakeCollision=false;
        for (var i=0;i<snake.length;i++){
                if ((position[0]===snake.body[i][0])&&(this.position[1]===snake.body[i][1])) return true;
            }
        return snakeCollision;
    }
}
function restart(){
        snakee=new snake([[6,4],[5,4],[4,4],[3,4]],"right");
        applee=new pomme([10,10]);
        score=0;
        refreshCanvas();
    }
function drawScore(){
    ctx.save();
    console.log(score);
    ctx.fillText(score.toString(),5,15);
    ctx.restore();
}
document.onkeydown=function handleKeyDown(e){
    var key=e.keyCode;
    var newDirection;
    console.log(key);
    switch(key){
        case 37:
            newDirection="left";
            break;
        case 38:
            newDirection="up";
            break;
        case 39:
            newDirection="right";
            break;
        case 40:
            newDirection="down";
            break;
        case 32:
            restart();
            return;
        default:
            return;
    }
    console.log("Change to "+newDirection);
    snakee.setDirection(newDirection);
}
    init();
 }
