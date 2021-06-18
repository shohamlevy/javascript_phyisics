var game = new Phaser.Game(960, 640, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
});

var ball;
var paddle;
var bricks;
var brickInfo;
var scoreText;
var score = 0;

var lives = 3;
var livesText;
var lifeLostText;
var playing = false;
var startButton;

var textStyle = {font: '18px Arial', fill: '#0095DD'};

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.stage.backgroundColor = '#eee';

    // game.load.image('ball', 'img/ball.png');
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Generic world
    game.physics.arcade.checkCollision.down = false;

    createPlayBoard();
    createBall();
    createPlayersPaddle();
    initBricks();

    function createPlayBoard() {
        score = 0;
        scoreText = game.add.text(5, 5, 'Points: ' + score, textStyle);

        livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
        livesText.anchor.set(1, 0);
        lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle);
        lifeLostText.anchor.set(0.5);
        lifeLostText.visible = false;

        startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
        startButton.anchor.set(0.5);
    }

    function startGame() {
        startButton.destroy();
        setBallInMotion();
        playing = true;
    }

    function createPlayersPaddle() {
        paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
        paddle.anchor.set(0.5, 1);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        //paddle.body.collideWorldBounds = true;
        //paddle.body.bounce.set(1);
        paddle.body.immovable = true;
    }

    function createBall() {
        // ball = game.add.sprite(game.world.width * 0.5, game.world.height * 0.5, 'ball');
        ball = game.add.sprite(100, 500, 'ball');
        ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 12);
        ball.anchor.set(0.5);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);

        ball.checkWorldBounds = true;
        ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    }

    function initBricks() {
        brickInfo = {
            width: 100,
            height: 40,
            count: {
                col: 7,
                row: 4
            },
            offset: {
                top: 100,
                left: 120
            },
            padding: 10
        }

        bricks = game.add.group();

        deltaX = brickInfo.width + brickInfo.padding;
        deltaY = brickInfo.height + brickInfo.padding;
        for (var c = 0; c < brickInfo.count.col; c++) {
            for (var r = 0; r < brickInfo.count.row; r++) {
                var x = brickInfo.offset.left + c * deltaX;
                var y = brickInfo.offset.top + r * deltaY;
                newBrick = game.add.sprite(x, y, 'brick');
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);
            }
        }

        bricks.children.forEach((br, indx) => {
            game.add.tween(br.scale).to({x:2.5, y:2.5}, (indx+1)*50, Phaser.Easing.Elastic.Out, true, 100).onComplete.addOnce(function(){
                game.add.tween(br.scale).to({x:2, y:2}, (indx+1)*50, Phaser.Easing.Elastic.In, true, 100);
            });
        });
    }

    function ballLeaveScreen() {
        lives--;
        if (lives) {
            livesText.setText('Lives: '+lives);
            lifeLostText.visible = true;
            game.input.onDown.addOnce(function(){
                lifeLostText.visible = false;
                setBallInMotion();
            });
        } else {
            alert("Game Over!");
            location.reload();
        }
    }

    function setBallInMotion() {
        ball.reset(game.world.width * 0.5, game.world.height - 25);
        paddle.reset(game.world.width * 0.5, game.world.height - 5);
        ball.body.velocity.set(250, -250);
    }
}

function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if (playing) {
        paddle.x = game.input.x || game.world.width * 0.5;
    }
}

function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0, y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function() {
        brick.kill();
        score += 10;
        scoreText.setText('Points: ' + score);
    
        winCondition = true;
        bricks.children.forEach(b => {
            if (b.alive) {
                winCondition = false;
            }
        });
        if (winCondition) {
            alert('You won the game, congratulations!');
            location.reload();
        }
    }, this);
    killTween.start();
}

function ballHitPaddle() {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
}
