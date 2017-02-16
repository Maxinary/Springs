const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const worldStates = {"matrix":0, "spring":1};
var state = worldStates["matrix"];

var points = [];

var springs = [];

var holding = false;
var cling = {};
var clingRef = new Tuple(0,0);

var pinCorners = false;
var drawPoints = true;
var drawSprings = true;
var gravity = new Tuple(0, 0.5);
var friction = 0.7;
var maxForce = 30;


function tick(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  if(drawSprings){
    for(var i in springs){
      var logPercent = sigmoid(2+Math.log10(springs[i].tension+0.01));
      context.lineWidth = map(sigmoid(4*springs[i].tension-2),0,1,1,8);
      context.strokeStyle = "rgb("+Math.floor(map(logPercent,0,1,0,255))+",0,0)";
      context.beginPath();
      context.moveTo(points[springs[i].points[0]].pos.x, points[springs[i].points[0]].pos.y);
      context.lineTo(points[springs[i].points[1]].pos.x, points[springs[i].points[1]].pos.y);
      context.stroke();
    }
  }
  
  if(drawPoints){
    for(var i in points){
      var size;
      if(points[i].pinned){
        context.fillStyle = "#0F0";
        size = 6;
      }else{
        context.fillStyle = "#000";
        size = Math.log(points[i].mass+1)
      }
      context.fillRect(points[i].pos.x - size, points[i].pos.y - size, 2*size, 2*size);
    }
  }
  
  for(var i in springs){
    springs[i].tick();
  }

  var keys = Object.keys(cling);
  for(var i in points){
    if(!points[i].pinned){
      if(keys.indexOf(i) == -1){
        points[i].velocity.add(gravity);
        points[i].tick();
        points[i].velocity.scale(friction);
      }
    }
  }


  requestAnimationFrame(tick);
}

//init
(function(){
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  
  if(state == worldStates["matrix"]){
    points = [];
    springs = [];
    
    var side = 16;
    var size = (canvas.height-100)/side * 2/3;
    var disp = 0;
    for(var i=0; i<side; i++){
      for(var j=0; j<side; j++){
        points.push(new Point(new Tuple((i+1)*size, (j+1)*size), 16*16/(side*side)));
        
        if(j === 0){
           points[points.length-1].pin();
        }
        
        if(j<side-1){
          springs.push(new Spring(size*(1+(j%2)*2*disp-disp), 0.4, i*side+j, i*side+j+1));
        }
        
        if(i<side-1){
          springs.push(new Spring(size*(1+(i%2)*2*disp-disp), 0.4, i*side+j, (i+1)*side+j));
        }
      }
    }
    
    if(pinCorners){
      points[0].pin();
      points[side-1].pin();
      points[side*(side-1)].pin();
      points[side*side-1].pin();
    }
  }else if(state == worldStates["spring"]){
    points = [];
    springs = [];
    
    points.push(new Point(new Tuple(550, 100), 1000));
    points.push(new Point(new Tuple(850, 100)));
    
    springs.push(new Spring(500, 0.005, 0, 1));
  }

  tick();
})();


document.onmousedown = function(event){
  cling = {};
  var clingRef = new Tuple(event.clientX, event.clientY);
  for(var i in points){
    if(dist(clingRef, points[i].pos) < 30){
      cling[i] = new Tuple(points[i].pos.x - clingRef.x, points[i].pos.y - clingRef.y);
    }
  }
  holding = true;
};

document.onmousemove = function(event){
  if(holding){
    for(var i in cling){
      points[i].pos.x = event.clientX + cling[i].x;
      points[i].pos.y = event.clientY + cling[i].y;
    }
  }
};

document.onmouseup = function(event){
  holding = false;
  cling = {};
};