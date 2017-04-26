var pjs = new PointJS('2d', 1200, 600);
pjs.system.initFullPage();
pjs.keyControl.initKeyControl('true');

var game = pjs.game;
var menu = pjs.game;
var point = pjs.vector.point;

var height = game.getWH().h;
var width = game.getWH().w;

var isInGame = false;
var angle = 7;

var fon0 = null;
var fon1 = null;
var fon2 = null;
var gr1 = null;
var gr2 = null;
var hand = null;
var badThing1 = null;
var badThing2 = null;

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
    points: function (obj) {
        var startPointX = obj.x;
        var startPointY = obj.y;
        var centreX = startPointX + obj.w / 2;
        var centreY = startPointY + obj.h / 2;

        var newP = {
            x: (startPointX - centreX) * (Math.cos(this.angle * (Math.PI / 180))) - (startPointY - centreY) * (Math.sin(this.angle * (Math.PI / 180))) + centreX,
            y: (startPointX - centreX) * (Math.sin(this.angle * (Math.PI / 180))) + (startPointY - centreY) * (Math.cos(this.angle * (Math.PI / 180))) + centreY
        }
        return newP;
    },
    railing: function (obj1, obj2) {
        var newPointStart = newPoints.points(obj1);	//������ �������

        newPointStart.x += obj1.w * Math.cos(this.angle * (Math.PI / 180));// ����� ������ �������
        newPointStart.y += obj1.w * Math.sin(this.angle * (Math.PI / 180));

        obj2.x = obj2.y = 0;
        var newPointEnd = newPoints.points(obj2);	//������ �������

        obj2.x = newPointStart.x - newPointEnd.x;
        obj2.y = newPointStart.y - newPointEnd.y;
    },
    hand: function (obj1, obj2) {
        var newPointStart = newPoints.points(obj1);	//������ �������

        newPointStart.x += (width / 4) * Math.cos(this.angle * (Math.PI / 180));// ����� ������ �������
        newPointStart.y += (width / 4) * Math.sin(this.angle * (Math.PI / 180));

        obj2.x = obj2.y = 0;
        var newPointEnd = newPoints.points(obj2);	//������ �������

        obj2.x = newPointStart.x - newPointEnd.x;
        obj2.y = newPointStart.y - newPointEnd.y - (obj2.h / Math.cos(this.angle * (Math.PI / 180)));
        jump.startPosition = obj2.y;
    }
};
var moveBackGround = function (s) {
    fon1.move(point(-s / 2, 0));
    fon2.move(point(-s / 2, 0));

    gr1.moveAngle(-s, angle);
    gr2.moveAngle(-s, angle);
    badThing1.moveAngle(-s, angle);
    badThing2.moveAngle(-s, angle);

    if (fon1.x + fon1.w < 0) {
        fon1.x = fon2.x + fon2.w;
    }

    if (fon2.x + fon2.w < 0) {
        fon2.x = fon1.x + fon1.w;
    }

    if (gr1.x + gr1.w < 0) {
        newPoints.railing(gr2, gr1);
        newPoints.railing(gr2, badThing1);
    }

    if (gr2.x + gr2.w < 0) {
        newPoints.railing(gr1, gr2);
        newPoints.railing(gr1, badThing2);
    }
    Intersection();
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
		if (pjs.keyControl.isDown("SPACE")) {
			switch (this.state) {
				case "up":
					jump.up();
					break;
				case "down":
					jump.down();
					break;
			}
		}
		else jump.down();
	}
};

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
        w: width / 10,
    });
}
function GetBackground(path) {
    return game.newImageObject({
        x: fon1==null?0:fon1.x+fon1.w,
        y: 0,
        file: path == null ? 'imgs/background.jpg' : path,
        h: height,
        w: width,
    });
}
function GetGround() {
    return game.newImageObject({
        x: 0, y: (height*1.5)*(height/width),
        file: 'imgs/perila_4_flat.png',
        w: width,

    });
}

function Intersection() {
	var startLight1 = badThing1.x;
	var startLight2 = badThing2.x;
	var endLight1 = startLight1 + badThing1.w*Math.cos(angle * Math.PI / 180);
	var endLight2 = startLight2 + badThing2.w*Math.cos(angle * Math.PI / 180);
	
	var star = hand.x + hand.w*Math.cos(angle * Math.PI / 180)*(0.4);
	var end = hand.x + hand.w*Math.cos(angle * Math.PI / 180)*(0.8);
	if (hand.isIntersect(badThing1) && ((star <= startLight1 && endLight1 <= end) || (startLight1 <= star && endLight1 >= star) || (startLight1 <= end && endLight1 >= end))){
		endGame();
        game.setLoop("deathScreen");
	}
	else{
		if (hand.isIntersect(badThing2) && ((star <= startLight2 && endLight2 <= end) || (startLight2 <= star && endLight2 >= star) || (startLight2 <= end && endLight2 >= end))){
			endGame();
            game.setLoop("deathScreen");
		}
	}
}
function createGame() {
	game.clear();
	scoreCounter.score = 0;
    fon0 = GetBackground();
    fon1 = GetBackground('imgs/fon.png');
    fon2 = GetBackground('imgs/fon.png');
    gr1 = GetGround();
    gr2 = GetGround();
    badThing1 = GetLightLine(gr1.x,gr1.y);
    badThing2 = GetLightLine(gr2.x,gr2.y);
    hand = GetPlayer();
    newPoints.hand(gr1, hand);
    newPoints.railing(gr2, badThing2);
    hand.turn(angle);
    gr1.turn(angle);
    gr2.turn(angle);
    newPoints.railing(gr1, gr2);
    badThing1.turn(angle);
    badThing2.turn(angle);
    isInGame = true;
}
function endGame(){
    fon1 = null;
    fon2 = null;
    gr1 = null;
    gr2 = null;
    hand = null;
	mianMusic.stop();
	deathSound.play();
}

game.newLoop('game', function () {
    if (!isInGame) {
        createGame();
    }
	game.clear();
    fon0.draw();
    fon1.draw();
    fon2.draw();
    gr1.draw();
    gr2.draw();
    badThing2.draw();
    badThing1.draw();
    hand.draw();

    scoreCounter.write();
	scoreCounter.increase();

    jump.key();
	if(!mianMusic.playing)
		mianMusic.replay();
    moveBackGround(6 * (width / 1366));
});
game.newLoop('deathScreen', function () {
    game.clear();
    fon0.draw();
    scoreCounter.highScore = scoreCounter.highScore<=scoreCounter.score?scoreCounter.score:scoreCounter.highScore;
    pjs.brush.drawMultiText({
        y: (height / width) * 100,
        text: 'GAME OVER\nHighScore: '+ scoreCounter.highScore+'\nScore: '+scoreCounter.score,
        size: (height / width) * 100,
        color: 'black'
    });
    if (pjs.keyControl.isPress("SPACE")) {
        isInGame = false;
        game.setLoop('game');
    }
});
var mianMusic = pjs.audio.newAudio("Sound/PLAY_1.mp3", 0.1);
var deathSound = pjs.audio.newAudio("Sound/DEATH_1.mp3", 0.5);
var jumpSound = pjs.audio.newAudio("Sound/Jump.mp3", 1);
mianMusic.play();
game.startLoop('game');