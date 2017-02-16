function sigmoid(x){
  return 1/(1+Math.pow(Math.E, -x));
}

function square(v){
  return v*v;
}

function dist(tup1, tup2){
  return Math.sqrt(square(tup1.x - tup2.x) + square(tup1.y - tup2.y));
}

function map(a, min, max, outMin, outMax){
  return ( (a - min) / (max - min) ) * (outMax - outMin) + outMin;
}

function min(arr){
  var minim = arr[0];
  for(var i=1; i<arr.length; i++){
    if(arr[i] < minim){
      minim = arr[i];
    }
  }
  return minim;
}

function sign(x){
  if(x < 0){
    return -1;
  }else if(x === 0){
    return 0;
  }else{
    return 1;
  }
}

class Tuple{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  
  add(tuple){
    this.x += tuple.x;
    this.y += tuple.y;
  }
  
  multiply(tup){
    this.x *= tup.x;
    this.y *= tup.y;
  }
  
  scale(num){
    this.x *= num;
    this.y *= num;
  }
  
  length(){
    return Math.sqrt(square(this.x) + square(this.x));
  }
}

class Point{
  constructor(position, mass){
    if(mass === undefined){
      mass = 1;
    }
    
    this.pos = position;
    this.mass = mass;
    this.invMass = 1/mass;
    this.pinned = false;
    
    this.velocity = new Tuple(0, 0);
  }
  
  tick(){
    var len = this.velocity.length();
    if(len > maxVelocity){
      this.velocity = new Tuple(maxVelocity * this.velocity.x/len, maxVelocity * this.velocity.y/len);
    }
    this.pos.add(this.velocity);
  }
  
  force(f){
    var f1 = new Tuple(f.x, f.y);
    f1.scale(this.invMass);
    this.velocity.add(f1);
  }
  
  pin(){
    this.pinned = true;
  }
  
  unpin(){
    this.pinned = false;
  }
}

class Spring{
  constructor(length, k, p1, p2){
    this.points = [p1, p2];//indices
    this.length = length;
    this.k = k;
    
    this.tension = 0;
  }
  
  tick(){
    var pointDist = dist(points[this.points[0]].pos, points[this.points[1]].pos);
    var force = this.k * (pointDist - this.length);

    this.tension = Math.abs(pointDist - this.length)/this.length;
    var cos = (points[this.points[1]].pos.x-points[this.points[0]].pos.x)/pointDist;
    var sin = (points[this.points[1]].pos.y-points[this.points[0]].pos.y)/pointDist;
    var out = new Tuple(force*cos, force*sin);
    points[this.points[0]].force(out);
    out.scale(-1);
    points[this.points[1]].force(out);
  }
}