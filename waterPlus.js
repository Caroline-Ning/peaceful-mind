//1. direction控制线的方向random，是否每个人都有差别
//2. 是否要用happy程度控制线的方向random，体现波动；如果这样，可用mouthHeight控制frameRate

let faceapi;
let detections = [];

let video;
let canvas;

let cols;
let rows;
let current; // = new float[cols][rows];
let previous; // = new float[cols][rows];

let dampening = 0.99;

let x, y;

let ants = []; // empty array to hold ants
let num = 1; //number of ants

// let test;
let r = 1, g = 1, b = 1; //colors
let mouthRatio, eyesRatio, browRatio//嘴占脸，眼距占脸，眉距占脸
let happy = 0 //later frame=happy
let frame = 25, direction = 1

let music
let medi

function preload() {
  soundFormats('mp3', 'ogg');
  medi = loadSound('medi.mp3')
  music = loadSound('music.mp3');
}

function setup() {
  // canvas = createCanvas(windowWidth, windowHeight);
  // canvas.id("canvas");
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);// Creat the video
  video.id("video");
  video.size(width, height);
  video.hide()

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };
  //Initialize the model
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  pixelDensity(1);
  // The following line initializes a 2D cols-by-rows array with zeroes
  // in every array cell, and is equivalent to this Processing line:
  // current = new float[cols][rows];

  cols = width;
  rows = height;
  current = new Array(cols).fill(0).map(n => new Array(rows).fill(0));
  previous = new Array(cols).fill(0).map(n => new Array(rows).fill(0));

  for (i = 0; i < num; i++) {
    ants.push(new Ant());
  }
}

function faceReady() {
  faceapi.detect(gotFaces);// Start detecting faces
}

// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections

  getLandmarks(detections);// Get all the face points
  drawExpressions(detections);//Get expressions

  faceapi.detect(gotFaces);// Call the function again at here
}


function getLandmarks(detections) {
  if (detections.length > 0) {//If at least 1 face is detected
    for (f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      //find positions of mouth/eyes and width/height
      for (let i = 0; i < points.length; i++) {
        let faceWidth = points[16]._x - points[0]._x
        let mouthWidth = points[64]._x - points[60]._x
        // let eyesWidth = points[42]._x - points[36]._x
        // let browWidth = points[22]._x - points[17]._x
        let mouthHeightOut = points[57]._y - points[51]._y
        let mouthHeightIn = points[66]._y - points[62]._y
        // mouthHRatio = mouthHeightIn / mouthHeightOut
        mouthRatio = mouthWidth / faceWidth
        // eyesRatio = eyesWidth / faceWidth
        // browRatio = browWidth / faceWidth
      }
    }
  }
}

function drawExpressions(detections) {
  if (detections.length > 0) {//If at least 1 face is detected
    let { neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[0].expressions;
    direction = map(neutral, 1, 0, 1, 20)

    //color control
    r = map(mouthRatio, 0, 0.7, 0, 10)
    // r=10
    g = 2
    b = map(neutral, 0, 1, 0, 15)
  }
}
function draw() {

  frameRate(25) //这里也可以控制速度
  background(0);
  if (detections.length > 0) {
    for (let ant of ants) {
      ant.display();
      ant.update();
      ant.edge();
    }

    loadPixels();
    previous[x][y] = 1000;
    //Every pixel is calculated by the pixels located around it
    for (let i = 1; i < cols - 1; i++) {
      for (let j = 1; j < rows - 1; j++) {
        current[i][j] =
          (previous[i - 1][j] +
            previous[i + 1][j] +
            previous[i][j - 1] +
            previous[i][j + 1]) /
          2 -
          current[i][j];
        current[i][j] = current[i][j] * dampening;
        //As pixels array in p5.js has four entries for each pixel
        //the index is multiplied by 4
        //the entry for each color component is set separately
        let index = (i + j * cols) * 4;
        pixels[index + 0] = current[i][j] * r;
        pixels[index + 1] = current[i][j] * g;
        pixels[index + 2] = current[i][j] * b;
      }
    }
    //display
    updatePixels();
    //swap
    let temp = previous;
    previous = current;
    current = temp;
  }
}

class Ant {

  constructor() {
    this.position = createVector(width / 2, height / 2);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(0.5, 0.6));
  } //decrease the speed

  display() {
    x = Math.floor(this.position.x);
    y = Math.floor(this.position.y);
  }

  update() {
    this.position.x = this.position.x + random(-direction, direction);//input-change direction
    this.position.y = this.position.y + random(-direction, direction);//input-change direction
    this.position.add(this.velocity); 
  }

  edge() {
    if (this.position.x >= width) {
      this.position.x = 1;
    } else if (this.position.x <= 0) {
      this.position.x = width - 1;
    }
    if (this.position.y >= height) {
      this.position.y = 1;
    } else if (this.position.y <= 0) {
      this.position.y = height - 1;
    }
  }
}

function keyPressed() {
  if (keyCode === 77) {
    music.play();
  }
  if (keyCode === 71) {
    medi.play()
  }
}
