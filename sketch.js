let textures = [];
let snow = [];
let w;
let h;

// ml5 Face Detection Model
let faceapi;
let detections = [];
// Video
let video;
const faceOptions = { 
  withLandmarks: true, 
  withExpressions: false, 
  withDescriptors: false
};

function preload() { //加载食物图片
  //spritesheet = loadImage('Ghostpixxells_pixelfood.png'); 
  // can = loadImage('farm-tool.png'); 
  // lake = loadImage('lake.png'); 
  gras = loadImage('gras.png'); 
  flowers = loadImage('flowers_plants.png'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight); //画布大小跟随窗口
  gravity = createVector(0, 0.5); //设定重力

  //裁剪鲜花素材
  w = flowers.width / 5;
  h = flowers.height / 4;
  //console.log(flowers.width, flowers.height, w, h);
  for (let x = 0; x < flowers.width; x += w) { 
    for (let y = 0; y < flowers.height; y += h) { 
      //console.log('🌟', x, y);
      let img = flowers.get(x, y, w, h); //获取单个鲜花图片
      image(img, x, y);
      textures.push(img); //放在textures里
    }
  }

  //准备camera
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide(); //让video显示在canvas上而不是堆叠元素
  faceapi = ml5.faceApi(video, faceOptions, faceReady); //调用api
}

function modelReady() {
  select("#status").html("Model Loaded");
}

let standup;
let sitdown;
function draw() {
  background(0, 255, 0);
  image(video, 0, 0, width, width * video.height / video.width);
 
  //围绕window四边画相框
    N =  windowWidth/16;
    M = windowHeight/16;
    for (let x = 0; x < N; x += 1){ //row
      image(gras, x*16, 0, 16, 16);
      image(gras, x*16, windowHeight-16, 16, 16);
    } 
    for (let y = 0; y < N; y += 1){ //column
      image(gras, 0, y*16, 16, 16);
      image(gras, windowWidth-16, y*16, 16, 16);
    } 

    //面部处理
    if (detections) { 
      //console.log('length:', detections.length);
      if (detections.length > 0) {//采集到面部图像 画出五官
        // drawBox(detections);
        drawLandmarks(detections);
        sitdown = second();
        //console.log('sitdown:', sitdown);
      }
      else{ //面部出框 检测站立时间
        standup = second();
        console.log('sitdown:', sitdown);
        console.log('standup:', standup);
        console.log('standup time:', standup - sitdown);
        if (standup - sitdown > 5){ //每站10s 产生鲜花
          console.log('🌹🌹🌹');
          blossom()
          sitdown = standup;
        }
        if (standup - sitdown < 0){ //异常值修正
          sitdown = second()
          standup = second();
        }
      }
    }

  //画生成的鲜花
  for(let x = 0; x < series.length; x += 1){
    image(textures[series[x]], posXs[x], posYs[x], 32, 32);
  }
}

function faceReady() {
  faceapi.detect(gotFaces);
}

// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

function drawLandmarks(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);
  for (let i = 0; i < detections.length; i += 1) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;
    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
    //return mouth
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }
  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

let number;
let posXs = [];
let posYs = [];
let series = [];
function blossom(){
  var number = Math.floor(Math.random() * 19); //随机选择一个鲜花
  series.push(number)
  var posX = Math.random() * windowWidth;
  var posY = Math.random() * windowHeight;
  if(Math.random()>0.5){
    if(Math.random()>0.5){ //x变为0或最大值
      posX = 0;
    }else{
      posX = windowWidth-32;
    }
  }else{
    if(Math.random()>0.5){ //y变为0或最大值
      posY = 0;
    }else{
      posY = windowHeight-32;
    }
  }
  posXs.push(posX);
  posYs.push(posY);
}

//min ≤ num ≤ max
//Math.round(Math.random() * (max - min)) + min;