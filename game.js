var pjs = new PointJS('2d', 1200, 600);
pjs.system.initFullPage();
pjs.keyControl.initKeyControl('true');
pjs.mouseControl.initMouseControl();
pjs.touchControl.initTouchControl();

var game = pjs.game;
var menu = pjs.game;
var point = pjs.vector.point;

var height = game.getWH().h;
var width = game.getWH().w;
var angle = 7;

/// Global variables ///

var isInGame = false;
var isInMenu = false;
var Pause = false;

var buttonStart = null;
var buttonReplay = null;
var menuBackground = null;

var background0 = null;
var background1 = null;
var background2 = null;
var deathScreen = null;
var gr1 = null;
var gr2 = null;
var hand = null;
var badThing1 = null;
var badThing2 = null;

/// Constantly use ///

var scoreCounter = {
	score: 0,
	highScore: 0,
	write: function () {
		pjs.brush.drawText({
			text: 'Score: ' + (~~this.score),
			size: 20,
			color: '#ffffff'
		});
	},
	increase: function () {
		this.score += 0.125;
	},
};
var newPoints = {
	angle: angle,
	points: function(obj){
		var startPointX = obj.x;
		var startPointY = obj.y;
		var centreX = startPointX+obj.w/2;
		var centreY = startPointY+obj.h/2;

		var newP = {
			x: (startPointX-centreX)*(Math.cos(this.angle*(Math.PI/180)))-(startPointY-centreY)*(Math.sin(this.angle*(Math.PI/180)))+centreX,
			y: (startPointX-centreX)*(Math.sin(this.angle*(Math.PI/180)))+(startPointY-centreY)*(Math.cos(this.angle*(Math.PI/180)))+centreY
		}
		return newP;
	},
	railing: function(obj1, obj2){
		var newPointStart = newPoints.points(obj1);	//������ �������
		
		newPointStart.x += obj1.w*Math.cos(this.angle*(Math.PI/180));// ����� ������ �������
		newPointStart.y += obj1.w*Math.sin(this.angle*(Math.PI/180));
		
		obj2.x = obj2.y = 0;
		var newPointEnd = newPoints.points(obj2);	//������ �������
		
		obj2.x = newPointStart.x - newPointEnd.x;
		obj2.y = newPointStart.y - newPointEnd.y;
	},
	hand: function(obj1, obj2){
		var newPointStart = newPoints.points(obj1);	//������ �������
		
		newPointStart.x += (width/4)*Math.cos(this.angle*(Math.PI/180));// ����� ������ �������
		newPointStart.y += (width/4)*Math.sin(this.angle*(Math.PI/180));
		
		obj2.x = obj2.y = 0;
		var newPointEnd = newPoints.points(obj2);	//������ �������
		
		obj2.x = newPointStart.x - newPointEnd.x;
		obj2.y = newPointStart.y - newPointEnd.y - (obj2.h/Math.cos(this.angle*(Math.PI/180)));
		jump.startPosition = obj2.y;
	},
	light: function(obj1, obj2, region){//---
		var newPointStart = newPoints.points(obj1);
		newPointStart.x += ((width + width/region)/Math.cos(this.angle*(Math.PI/180)))*Math.cos(this.angle*(Math.PI/180));
		newPointStart.y += ((width + width/region)/Math.cos(this.angle*(Math.PI/180)))*Math.sin(this.angle*(Math.PI/180));
		
		obj2.x = obj2.y = 0;
		var newPointEnd = newPoints.points(obj2);
		
		obj2.x = newPointStart.x - newPointEnd.x;
		obj2.y = newPointStart.y - newPointEnd.y;
	}
}
var moveBackGround = function (s) {
    background1.move(point(-s / 2, 0));
    background2.move(point(-s / 2, 0));

    gr1.moveAngle(-s, angle);
    gr2.moveAngle(-s, angle);
    badThing1.moveAngle(-s, angle);
    badThing2.moveAngle(-s, angle);

    if (background1.x + background1.w < 0) {
        background1.x = background2.x + background2.w;
    }

    if (background2.x + background2.w < 0) {
        background2.x = background1.x + background1.w;
    }

    if (gr1.x + gr1.w < 0) {
        newPoints.railing(gr2, gr1);
        randLine(gr2, badThing1, Math.random()*(400 - 200)+200);
    }

    if (gr2.x + gr2.w < 0) {
        newPoints.railing(gr1, gr2);
        randLine(gr1, badThing2, Math.random()*(400-200)+200);
    }
};
var jump = {
	h: 250,
	speed: 9 * (height / 662),
	startPosition: 0,
	state: "down",
	isGrounded: true,
	up: function () {
		if (hand.y > this.startPosition/*(height * (height / width) - hand.h )*/ - this.h * (height / 662) && this.isGrounded) {
			hand.y -= this.speed;
			hand.drawFrames(4, 4);
		}
		else this.state = "down";
	},
	down: function () {
		if (hand.y < this.startPosition/*(height * (height / width) - hand.h )*/) {
            hand.y += this.speed;
			hand.drawFrames(2, 2);
			this.isGrounded = false;
		}
		else {
			hand.y = this.startPosition/*height * (height / width) - hand.h*/ ;
			this.state = "up";
			this.isGrounded = true;
		}
	},
	key: function () {
		if (pjs.keyControl.isDown("SPACE")|| pjs.touchControl.isDown()) {
			switch (this.state) {
				case "up":
					jump.up();
					break;
				case "down":
					jump.down();
					break;
			}
		}
		else{ 
            jump.down();
        }
	}
};

/// Constructors ///

function GetPlayer() {
    return game.newAnimationObject({
        x: width / 4,
        y: 0,
        h: (200 * height) / 662,
        w: (230 * width) / 1366,
        delay: 1,
        animation: pjs.tiles.newAnimation('imgs/run_hand.png', 249.625, 235, 8),
    });
}
function GetLightLine(X, Y) {
    return game.newImageObject({
        x: X,
        y: Y,
        file: 'imgs/light.png',
        w: 200,
        h: 20,
    });
}
function GetBackground(path , X) {
    return game.newImageObject({
        x: X==null?0:X,
        y: 0,
        file: path == null ? 'imgs/background.jpg' : path,
        h: height,
        w: width,
    });
}
function GetGround() {
    return game.newImageObject({
        x: 0, y: height-(height/3),
        file: 'imgs/perila_4_flat.png',
        w: width,

    });
}
function GetButton(path, X, Y){
    return game.newImageObject({
        x: X==null?width/2-200:X,
        y: Y==null?height/2-100:Y,
        file: path==null?'imgs/test.jpg':path,
        w: 400,
        h: 200,
    });
}

/// Main functions ///

function intersection() {
	var startLight1 = badThing1.x;
	var startLight2 = badThing2.x;
	var endLight1 = startLight1 + badThing1.w*Math.cos(angle * Math.PI / 180);
	var endLight2 = startLight2 + badThing2.w*Math.cos(angle * Math.PI / 180);
	
	var star = hand.x + hand.w*Math.cos(angle * Math.PI / 180)*(0.4);
	var end = hand.x + hand.w*Math.cos(angle * Math.PI / 180)*(0.8);
	if (hand.isIntersect(badThing1) && ((star <= startLight1 && endLight1 <= end) || (startLight1 <= star && endLight1 >= star) || (startLight1 <= end && endLight1 >= end))){
		mianMusic.stop();
		deathSound.play();
        drawDeathScreen();
        game.setLoop("deathScreen");
        //hand.drawDynamicBox('black');
	}
	else{
		if (hand.isIntersect(badThing2) && ((star <= startLight2 && endLight2 <= end) || (startLight2 <= star && endLight2 >= star) || (startLight2 <= end && endLight2 >= end))){
			mianMusic.stop();
			deathSound.play();
            drawDeathScreen();
            game.setLoop("deathScreen");
            //hand.drawDynamicBox('black');
		}
	}
}
function createMenus(){
    createMenu();
    createDeathScreen();
}
function drawMenu(){
    menuBackground.draw();
    buttonStart.draw();
}
function drawDeathScreen(){
    deathScreen.draw();
    buttonReplay.draw();
    scoreCounter.highScore = scoreCounter.highScore<=scoreCounter.score?scoreCounter.score:scoreCounter.highScore;
    pjs.brush.drawMultiText({
        y: (height / width) * 100,
        text: 'HighScore: '+ ~~scoreCounter.highScore+'\nScore: '+~~scoreCounter.score,
        size: (height / width) * 100,
        color: 'white'
    });
}
function randLine(obj1, obj2, len){
	var max = 3;
	var min = 1;
	var region = Math.random() * (max - min) + min;
    obj2.w = len;
	newPoints.light(obj1, obj2, region);
}

/// Loop constrctors ///

function createMenu(){
    menuBackground = GetBackground("imgs/menuBackground.jpg");
    buttonStart = GetButton("imgs/startbutton.jpg");
    isInMenu = true;
}
function createDeathScreen(){
    deathScreen = GetBackground("imgs/deathscreen.png");
    buttonReplay = GetButton("imgs/replaybutton.jpg", width/2-200,height-250);
    isInGame = false;    
}
function createGame() {
	game.clear();
	scoreCounter.score = 0;
    background0 = GetBackground();
    background1 = GetBackground('imgs/fon.png');
    background2 = GetBackground('imgs/fon.png', background1.x+background1.w);
    gr1 = GetGround();
    gr2 = GetGround();
    badThing1 = GetLightLine(0,0);
    badThing2 = GetLightLine(0,0);
    hand = GetPlayer();
    badThing1.turn(angle);
    badThing2.turn(angle);
    hand.turn(angle);
    gr1.turn(angle);
    gr2.turn(angle);
    newPoints.hand(gr1, hand);
    newPoints.railing(gr1, gr2);
    newPoints.light(gr1, badThing1, 1000);
    newPoints.light(gr2, badThing2, 1000);
    isInGame = true;
}

/// Loops ///

game.newLoop('game', function () {
	if(!mianMusic.playing)
		mianMusic.replay();
	game.clear();
    background0.draw();
    background1.draw();
    background2.draw();
    gr1.draw();
    gr2.draw();
    badThing2.draw();
    badThing1.draw();
    hand.draw();
    //hand.drawDynamicBox('#ff0000');
    //badThing1.drawDynamicBox();
    //badThing2.drawDynamicBox();
    scoreCounter.write();
    if(pjs.keyControl.isPress("X")){
        game.setLoop("deathScreen");
    }
    if(pjs.keyControl.isPress('P')){
        Pause = !Pause;
    }
    if(!Pause){
    moveBackGround(20);
	scoreCounter.increase();
    jump.key();
    }
    intersection();    
});
game.newLoop('menu', function(){
	if(!mianMenuMusic.playing)
		mianMenuMusic.replay();
	game.clear();
    drawMenu();
    if(pjs.mouseControl.isPeekObject('LEFT', buttonStart) || pjs.keyControl.isPress("Z") || pjs.touchControl.isDown()){
		mianMenuMusic.stop();
        createGame();
        isInMenu = false;
        game.setLoop('game');
    }
});
game.newLoop('deathScreen', function () {
    if (pjs.keyControl.isPress("R") || pjs.touchControl.isDown()) {
		deathSound.stop();
        createGame();
        game.setLoop('game');
    }
});

/// Start game ///
var mianMusic = pjs.audio.newAudio("Sound/PLAY_2.mp3", 0.1);
var deathSound = pjs.audio.newAudio("Sound/DEATH_1.mp3", 0.5);
var mianMenuMusic = pjs.audio.newAudio("Sound/MIAN_MENU_2.mp3", 0.1);
createMenus();
game.startLoop('menu');