var game = new Phaser.Game(480, 320, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
});

var ball;
var paddle;
var bricks;
var brickInfo;
var scoreText;
var score = 0;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.stage.backgroundColor = '#eee';

    game.load.image('ball', 'img/ball.png');
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Generic world
    game.physics.arcade.checkCollision.down = false;

    createBall();
    createPlayersPaddle();

    // Initial position and movement:
    ball.body.velocity.set(250, -250);
    //ball.body.gravity.y = 100;

    paddle.x = game.input.x || game.world.width*0.5;

    initBricks();

    score = 0;
    scoreText = game.add.text(5, 5, 'Points: '+score, {font: '18px Arial', fill: '#0095DD'});

    function createPlayersPaddle() {
        paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
        paddle.anchor.set(0.5, 1);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        //paddle.body.collideWorldBounds = true;
        //paddle.body.bounce.set(1);
        paddle.body.immovable = true;
    }

    function createBall() {
        ball = game.add.sprite(game.world.width * 0.5, game.world.height * 0.5, 'ball');
        ball.anchor.set(0.5);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);

        ball.checkWorldBounds = true;
        ball.events.onOutOfBounds.add(function () {
            alert("Game Over!");
            location.reload();
        }, this);
    }

    function initBricks() {
        brickInfo = {
            width: 50,
            height: 20,
            count: {
                col: 1,
                row: 1
            },
            offset: {
                top: 50,
                left: 60
            },
            padding: 10
        }

        bricks = game.add.group();

        deltaX = brickInfo.width + brickInfo.padding;
        deltaY = brickInfo.height + brickInfo.padding;
        for (let c = 0; c < brickInfo.count.col; c++) {
            for (let r = 0; r < brickInfo.count.row; r++) {
                var x = brickInfo.offset.left + c * deltaX;
                var y = brickInfo.offset.top + r * deltaY;
                newBrick = game.add.sprite(x, y, 'brick');
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);
            }
        }
    }
}

function update() {
    game.physics.arcade.collide(ball, paddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    paddle.x = game.input.x;
}

function ballHitBrick(ball, brick) {
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
}
