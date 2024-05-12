// Set up the canvas
const court = document.getElementById("court");
const ctx = court.getContext("2d");
const courtRadius = 150
court.height = 2*courtRadius;
court.width = 2*courtRadius;
const canvasColour = "#000033";

// Ball Properties
const ballSize = 5;
let ballCanvasX = courtRadius;
let ballCanvasY = courtRadius;
let ballCartesianX = ballCanvasX-courtRadius; 
let ballCartesianY = -ballCanvasY+courtRadius;
let ballRadius = Math.sqrt(ballCartesianX**2+ballCartesianY**2);
let ballSpeed = 2.5;
let dx = Math.random()*ballSpeed;
let dy = Math.sqrt(ballSpeed**2-dx**2);
let ballAngle;
const ballColour = "red";

// Paddle Properties
const paddleWidth = 0.2*Math.PI;
const paddleThickness = 10;
let paddleAngle = 0.5*Math.PI;
let paddleNegEdge = -paddleWidth/2+paddleAngle;;
let paddlePosEdge = paddleWidth/2+paddleAngle;
const paddleRadius = courtRadius -15;
let paddleSpeed = 0.5;
const paddleColour = "white";

// Keyboard Controls
let pointerCartesianX;
let pointerCartesianY;
let pointerRadius;
document.addEventListener("keydown", keyDownHandler, false);
const startButton = document.getElementById("start");
startButton.addEventListener("click", start);
const stopButton = document.getElementById("stop");
stopButton.addEventListener("mouseup", stop);
let gameInPlay = false;

// Timer Properties
let time = 0;
const timerIntervalLength = 100;
const clock = document.getElementById("clock");
let timerInterval;

// ----------------------------------------------------------------------------

function logData() {
    const data = {
        "ballCanvasX": ballCanvasX,
        "ballCanvasY": ballCanvasY,
        "ballCartesianX": ballCartesianX,
        "ballCartesianY": ballCartesianY,
        "ballRadius": ballRadius,
        "ballAngle": ballAngle,
        "ballSpeed": ballSpeed,
        "dx": dx,
        "dy": dy,
        "paddleAngle": paddleAngle,
        "paddleNedEdge": paddleNegEdge,
        "paddlePosEdge": paddlePosEdge,
        "paddleSpeed": paddleSpeed,
        "pointerCartesianX": pointerCartesianX,
        "pointerCartesianY": pointerCartesianY
    }

    return data;
}

// Write message to screen
function writeToScreen(message) {
    ctx.font = "24px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(message, courtRadius, courtRadius);
}

// Draw the court
function drawCourt() {
    ctx.beginPath();
    ctx.arc(courtRadius, courtRadius, courtRadius, 0, 2*Math.PI);
    ctx.fillStyle = canvasColour;
    ctx.fill();
    ctx.closePath();
}

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.arc(courtRadius, courtRadius, paddleRadius, paddleNegEdge, paddlePosEdge);
    ctx.lineWidth = paddleThickness;
    ctx.strokeStyle = paddleColour;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
}

//Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballCanvasX, ballCanvasY, ballSize, 0, 2*Math.PI);
    ctx.fillStyle = ballColour;
    ctx.fill();
    ctx.closePath();
}

function moveBall() {
    ballCartesianX = ballCanvasX-courtRadius;
    ballCartesianY = -ballCanvasY+courtRadius;
    ballRadius = Math.sqrt((ballCartesianX)**2 + (ballCartesianY)**2);

    // Advance ball
    ballCanvasX += dx;
    ballCanvasY += dy;
}

// Update paddle postion
function movePaddle() {
    paddleNegEdge = -paddleWidth/2+paddleAngle;
    paddlePosEdge = paddleWidth/2+paddleAngle;
}

// Pointer controls
function keyDownHandler(e) {
    if (e.key === 'Left' || e.key === "ArrowLeft") {
        paddleAngle -= paddleSpeed;
    }
    if (e.key === 'Right' || e.key === "ArrowRight") {
        paddleAngle += paddleSpeed;
    }
}

function calculateAngle(x,y) {
    return -Math.atan2(y, x);
}

function handleMouseMove(e) {
    // Calculate mouse x, y coordinates
    // (0,0) at centre of canvas
    pointerCartesianX =  e.clientX-court.offsetLeft - courtRadius;
    pointerCartesianY = -e.clientY + court.offsetTop + courtRadius;
    pointerRadius = Math.sqrt(pointerCartesianX**2 + pointerCartesianY**2);
    paddleAngle = calculateAngle(pointerCartesianX, pointerCartesianY);
}

function handleTouchMove(e) {
    // Calculate finger x, y coordinates
    // (0,0) at centre of canvas
    pointerCartesianX =  e.touches[0].clientX-court.offsetLeft - courtRadius;
    pointerCartesianY = -e.touches[0].clientY + court.offsetTop + courtRadius;
    pointerRadius = Math.sqrt(pointerCartesianX**2 + pointerCartesianY**2);
    paddleAngle = calculateAngle(pointerCartesianX, pointerCartesianY);
}

function deflectBall() {
    // Calculate random dx dy
    dx = Math.random()*ballSpeed
    dy = Math.sqrt(ballSpeed**2-dx**2)
    
    // Add negative coefficient on dx and/or dy depending on ball quadrant
    // 00: Upper left; 10: Upper right; 01: Lower left; 11: lower right
    const ballQuaderant = `${Math.floor(ballCanvasX/courtRadius)}${Math.floor(ballCanvasY/courtRadius)}`;
    switch (ballQuaderant) {
        case "00":
            break;
        case "10":
            dx *= -1;
            break;
        case "01":
            dy *= -1;
            break;
        case "11":
            dx*=-1;
            dy*=-1;
            break;
    }
}

function paddleCollisionDetected() {
    ballAngle = calculateAngle(ballCartesianX, ballCartesianY);
    if(ballAngle > paddleNegEdge && ballAngle < paddlePosEdge) {
        return true;
    } else {
        return false;
    }
}

function clearCanvas() {
    ctx.clearRect(0,0,court.width, court.height);
}

function draw() {
    // Stop game
    if (!gameInPlay) {
        writeToScreen("GAME OVER");
        return 0;
    }

    clearCanvas();
    drawCourt();
    movePaddle();
    moveBall();
    drawPaddle();
    drawBall();

    // Check collision if ball is near target space
    if (paddleRadius - ballRadius - paddleThickness < ballSpeed) {
        if (paddleCollisionDetected()) {
            deflectBall();
        } else {
            stop();
        }
    }

    requestAnimationFrame(draw);
}

function timer() {
    time += timerIntervalLength/1000;
    clock.innerText = `time: ${time.toFixed(2)}s`;
}

function start() {
    if(!gameInPlay) {
        // Initialize settings
        ballCanvasX = courtRadius;
        ballCanvasY = courtRadius;
        ballCartesianX = ballCanvasX-courtRadius;
        ballCartesianY = -ballCanvasY+courtRadius;
        ballRadius = Math.sqrt(ballCartesianX**2+ballCartesianY**2);
        ballSpeed = 2.5;
        dx = Math.random()*ballSpeed;
        dy = Math.sqrt(ballSpeed**2-dx**2);
        paddleAngle = 0.5*Math.PI;
        paddleSpeed = 0.5;
        time = 0;

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleTouchMove);
        gameInPlay = true;
        drawCourt();
        drawBall();
        drawPaddle()
        window.setTimeout(() => {
            draw();
            timerInterval = setInterval(timer, timerIntervalLength);
        },
        1000
        );
    }
}

function stop() {
    clearInterval(timerInterval);
    gameInPlay=false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("touchmove", handleTouchMove);
}

drawCourt();
drawBall();
drawPaddle();