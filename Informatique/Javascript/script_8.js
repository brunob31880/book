var snakee;
var applee;
var snakeGame;

/*
*/
function SnakeGame(canvasWidth,canvasHeight,blockSize,delay){
    this.canvasW=canvasWidth;
    this.canvasH=canvasHeight;
    this.blockSize=blockSize;
    this.delay=delay;
    this.canvas=document.createElement('canvas');
    this.canvas.width=canvasWidth;
    this.canvas.height=canvasHeight;
    this.canvas.style.border="1px solid";
    document.body.appendChild(this.canvas);
    this.ctx=this.canvas.getContext('2d');
    this.widthInBlock=canvasWidth/blockSize;
    this.heightInBlock=canvasHeight/blockSize;
    this.score;
    var instance=this;
    var timeout;
    this.init=function init(snake,apple)
    {
        this.snake=snake;
        this.apple=apple;
        clearTimeout(timeout);
        this.score=0;
        refreshCanvas();
    }
    this.drawScore=function(){
        this.ctx.save();
        console.log(this.score);
        this.ctx.fillText(this.score.toString(),5,15);
        this.ctx.restore();
    }
    this.gameOver=function(){
        this.ctx.save();
        this.ctx.fillText("Game Over",5,15);
        this.ctx.fillText("Appuyer sur la touche espace pour rejouer",5,25);
        this.ctx.restore();
    }
    this.checkCollision=function(){
        var wallCollision=false;
        var snakeCollision=false;
        var head=this.snake.body[0];
        var rest=this.snake.body.slice(1);
        var snakeX=head[0];
        var snakeY=head[1];
        wallCollision=(!(snakeX>=0&&snakeX<this.widthInBlock))||(!(snakeY>=0&&snakeY<this.heightInBlock));
        console.log("WallCollision="+wallCollision);
        for (var i=0;i<rest.length;i++){
            if ((snakeX===rest[i][0])&&(snakeY===rest[i][1])) snakeCollision=true;
        }
        console.log("SnakeCollision="+snakeCollision);
        return wallCollision||snakeCollision;
    }
    var refreshCanvas=function(){
        instance.snake.advance();
        if (instance.checkCollision())
        {
            instance.gameOver();
        }
        else {
            if (instance.snake.isEatingApple(instance.apple)) {
                instance.score++;
                console.log("Pomme mangée");
                do {
                    instance.apple.setNewPosition(instance.widthInBlock,instance.heightInBlock);
                }while(instance.apple.isOnSnake(instance.snake))
                    instance.snake.ateApple=true;
            }
            else instance.snake.ateApple=false;
            instance.ctx.clearRect(0,0,instance.canvas.width,instance.canvas.height);
            instance.snake.draw(instance.ctx,instance.blockSize);
            instance.apple.draw(instance.ctx,instance.blockSize);
            instance.drawScore();
            timeout=setTimeout(refreshCanvas,instance.delay);
        }  
    }
    }

function Snake(body,direction){
    this.body=body;
    this.direction=direction;
    this.ateApple=false;
    this.draw=function(ctx,blockSize){
        ctx.save();
        ctx.fillStyle="#ff0000";
        for(var i=0 ;i<this.body.length;i++){
            var x=this.body[i][0]*blockSize;
            var y=this.body[i][1]*blockSize; 
            ctx.fillRect(x,y,blockSize,blockSize);
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

    this.isEatingApple=function(apple){
        var head=this.body[0];
        var snakeX=head[0];
        var snakeY=head[1];
        return (snakeX===apple.position[0]&&snakeY===apple.position[1]);
    }
}


function Pomme(position){
    this.position=position;
    this.draw=function(ctx,blockSize){
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
    this.setNewPosition=function(widthInBlock,heightInBlock){
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

window.onload = function () {    
    snakeGame=new SnakeGame(900,600,30,200);
    snake=new Snake([[6,4],[5,4],[4,4],[3,4]],"right");
    apple=new Pomme([10,10]);
    snakeGame.init(snake,apple);
    this.restart=function(){
        snake=new Snake([[6,4],[5,4],[4,4],[3,4]],"right");
        apple=new Pomme([10,10]);
        snakeGame.init(snake,apple);
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
        snakeGame.snake.setDirection(newDirection);
    }
}
