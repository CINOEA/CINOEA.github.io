var pjs = new PointJS('2d', 1200, 600);
pjs.system.initFullPage();
pjs.keyControl.initKeyControl('true');

var game = pjs.game;
var menu = pjs.game;
var point = pjs.vector.point;

var height = game.getWH().h;
var width = game.getWH().w;

var fon0 = game.newImageObject({
	x: 0, y: 0,
	file: 'imgs/background.jpg',
	h: height,
	w: width,
});
var fon1 = game.newImageObject({
	x: 0, y: 0,
	file: 'imgs/fon.png',
	h: height,
	w: width,
	onload: function () {
		fon2.x = fon1.x + fon1.w;
	}
});
var fon2 = game.newImageObject({
	x: 0, y: 0,
	file: 'imgs/fon.png',
	h: height
});
var gr1 = game.newImageObject({
	x: 0, y: height * (height / width),
	file: 'imgs/perila_4_angle.png',
	w: width,
	onload: function () {
		gr2.y = gr1.y + gr1.h / 2.9226;
		gr2.x = gr1.x + gr1.w;
		badThing1.x = gr1.x;
		badThing1.y = gr1.y;
		hand.y = height * (height / width) - hand.h / 2;
	}
});
var gr2 = game.newImageObject({
	x: 0, y: 0,
	file: 'imgs/perila_4_angle.png',
	w: width,
	onload: function () {
		badThing2.x = gr2.x;
		badThing2.y = gr2.y;
	}
});
var hand = game.newAnimationObject({
	x: width / 4, y: 0,
	h: (200 * height) / 662,
	w: (230 * width) / 1366,
	delay: 1,
	animation: pjs.tiles.newAnimation('imgs/run_hand.png', 249.625, 235, 8),
});
function LightLine(X, Y) {
	return game.newImageObject({
		x: X,
		y: Y,
		file: 'imgs/light.png',
		w: width / 10
	});
}
var badThing1 = game.newImageObject({
	x: 0,
	y: 0,
	file: 'imgs/light.png',
	w: width / 10
});
var badThing2 = game.newImageObject({
	x: 0,
	y: 0,
	file: 'imgs/light.png',
	w: width / 10
});
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
	}
};
var jump = {
	h: 250,
	speed: 9 * (height / 662),
	state: "down",
	isGrounded: true,
	up: function () {
		if (hand.y > (height * (height / width) - hand.h / 1.5) - this.h * (height / 662) && this.isGrounded) {
			hand.y -= this.speed;
			hand.drawFrames(4, 4);
		}
		else this.state = "down";
	},
	down: function () {
		if (hand.y < (height * (height / width) - hand.h / 1.5)) {
			hand.y += this.speed;
			hand.drawFrames(2, 2);
			this.isGrounded = false;
		}
		else {
			hand.y = height * (height / width) - hand.h / 1.5;
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
var moveBackGround = function (s) {
	fon1.move(point(-s / 2, 0));
	fon2.move(point(-s / 2, 0));

	gr1.moveAngle(-s, 6.598);
	gr2.moveAngle(-s, 6.598);
	badThing1.moveAngle(-s, 6.598);
	badThing2.moveAngle(-s, 6.598);

	if (fon1.x + fon1.w < 0) {
		fon1.x = fon2.x + fon2.w;
	}

	if (fon2.x + fon2.w < 0) {
		fon2.x = fon1.x + fon1.w;
	}

	if (gr1.x + gr1.w < 0) {
		gr1.x = gr2.x + gr2.w;
		gr1.y = gr2.y + gr2.h / 2.9226;
		badThing1.x = gr1.x;
		badThing1.y = gr1.y;
	}

	if (gr2.x + gr2.w < 0) {
		gr2.x = gr1.x + gr1.w;
		gr2.y = gr1.y + gr1.h / 2.9226;
		badThing2.x = gr2.x;
		badThing2.y = gr2.y;
	}
};
game.newLoop('game', function () {
	game.clear();
	game.fill('#D9D9D9');

	fon0.draw();
	fon1.draw();
	fon2.draw();
	gr1.draw();
	gr2.draw();
	badThing1.draw();
	badThing2.draw();
	hand.draw();

	scoreCounter.write();
	scoreCounter.increase();

	jump.key();

	if (hand.isIntersect(badThing1) || hand.isIntersect(badThing2)) {
		game.setLoop("menu");
	}

	moveBackGround(8 * (width / 1366));
});

game.newLoop('menu', function () {
	game.clear();
	fon0.draw();
	pjs.brush.drawText({
		y: (height / width) * 100,
		text: 'GAME OVER',
		size: (height / width) * 100,
		color: '#ff0000'
	});
	pjs.brush.drawText({
		y: (height / width) * 200,
		text: 'Score: '+(~~scoreCounter.score),
size: (height / width) * 100,
		color: '#32CD32',
	});
});
hand.turn(15);
game.startLoop('game');