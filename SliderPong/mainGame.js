//SocketIO
var socket = io.connect();

//Globals
var alpha = 0;
var beta = 0;
var gamma = 0;
var usingGyro = false;

//Ask for
function onReady(){
    socket.emit('ready', {});
}


import * as THREE from 'three';
import { Vector3 } from 'three';

//Create gamestate
let gameState;

class GameState {
    constructor(isListener){
        console.log("IS LISTENER? " + isListener + "")
        this.listener = isListener;
        this.player1 = new PlayerBoard(scene, world, 1, 0, -5, 0);
        player1 = this.player1;
        this.player2 = new PlayerBoard(scene, world, 2, 0, 12, 0);
        player2 = this.player2;
        this.ball = new PongBall(scene, world, 0, 0, 10, isListener);
        ball = this.ball;

        //Track important stats to sync across clients
        this.targetX = 0;
        this.targetY = 0;
        this.targetPlayer = isListener ? 1 : 2;

        this.otherPlayerRotation;
        this.otherPlayerPaddlePosition;

        this.ballTime = 0;
        this.ballSpeed = 10;

        this.score = {
            player1: 0,
            player2: 0
        }
        this.time = 0;
    }

    syncFromServer(serverGameState){
        if(this.listener){
            this.ball.updateFromServerData(serverGameState);
            this.player2.updateFromServerData(serverGameState);
        }else{
            //Only sync player2s paddle
            this.player2.updateFromServerData(serverGameState);
        }
    }

    syncToServer(){
        //Get latest values if not listener
        if(!this.listener){
            this.targetX = this.ball.targetX;
            this.targetY = this.ball.targetY;
            this.ballTime = this.ball.time;
            this.ballSpeed = this.ball.speed;
            this.targetPlayer = this.ball.playerTargeting;

            socket.emit("updateGameState", {
                targetX: this.targetX,
                targetY: this.targetY,
                targetPlayer: this.targetPlayer == 1 ? 2 : 1,
                otherPlayerRotation: this.player1.group.rotation,
                otherPlayerPaddlePosition: this.player1.paddleBody.position,
                ballTime: this.ballTime,
                ballSpeed: this.ballSpeed,
                timeSent: Date.now()
            })
        }else{
            socket.emit("updateGameState", {
                otherPlayerRotation: this.player1.group.rotation,
                otherPlayerPaddlePosition: this.player1.paddleBody.position,
            })
        }

        
    }

   
}


//A class to hold the board that one player controls, rendered by ThreeJS
class PlayerBoard {
    constructor(scene, world, playerId, x, y, z) {
        this.playerId = playerId;
        this.x = x;
        this.y = y;
        this.z = z;
        this.paddleVelocityX = 0;
        this.paddleVelocityY = 0;
        this.group = new THREE.Group();
        this.paddleSize = 4;
        this.scene = scene;
        this.world = world;
        this.woodMaterial = this.getWoodMaterial();
        this.boardSize = 14;
        this.previousPosition = new THREE.Vector3(0, 0, 0);
        this.init();
    }

    updateFromServerData(serverGameState){
        //Update the position of the paddle
        this.paddle.position.x = serverGameState.otherPlayerPaddlePosition.x;
        this.paddle.position.y = serverGameState.otherPlayerPaddlePosition.y;

        //Update the rotation of the group using quaternion
        this.group.setRotationFromEuler(new THREE.Euler(serverGameState.otherPlayerRotation.x, serverGameState.otherPlayerRotation.y, serverGameState.otherPlayerRotation.z, 'XYZ'));
    }


    getWoodMaterial() {
        //Create wood material from color, height, normal, and roughness maps
        
        //Load colormap
        const woodColorMap = new THREE.TextureLoader().load('textures/wood/colormap.jpg');
        woodColorMap.wrapS = THREE.RepeatWrapping;
        woodColorMap.wrapT = THREE.RepeatWrapping;
        woodColorMap.repeat.set(1, 1);

        //Load heightmap
        const woodHeightMap = new THREE.TextureLoader().load('textures/wood/heightmap.png');
        woodHeightMap.wrapS = THREE.RepeatWrapping;
        woodHeightMap.wrapT = THREE.RepeatWrapping;
        woodHeightMap.repeat.set(1, 1);

        //Load normalmap
        const woodNormalMap = new THREE.TextureLoader().load('textures/wood/normalmap.png');
        woodNormalMap.wrapS = THREE.RepeatWrapping;
        woodNormalMap.wrapT = THREE.RepeatWrapping;
        woodNormalMap.repeat.set(1, 1);

        //Load roughnessmap
        const woodRoughnessMap = new THREE.TextureLoader().load('textures/wood/roughmap.jpg');
        woodRoughnessMap.wrapS = THREE.RepeatWrapping;
        woodRoughnessMap.wrapT = THREE.RepeatWrapping;
        woodRoughnessMap.repeat.set(1, 1);

       

        //If playerid is 1, make the board red
       
        
        return new THREE.MeshStandardMaterial({
            map: woodColorMap,
            normalMap: woodNormalMap,
            normalMapType: THREE.TangentSpaceNormalMap,
            roughnessMap: woodRoughnessMap,
            // roughnessMap: woodRoughnessMap,
            // displacementMap: woodHeightMap,
            displacementScale: 0.1,
        });
    }

    init() {
        //Create the board
        const boardGeometry = new THREE.BoxGeometry(this.boardSize, this.boardSize, 0.25);
        
        //Create standard material
        const boardMaterial = new THREE.MeshStandardMaterial(this.woodMaterial);
        boardMaterial.color = this.playerId == 1 ? new THREE.Color(0xFF0000) : new THREE.Color(0x0000FF);

        this.board = new THREE.Mesh(boardGeometry, boardMaterial);
        this.board.castShadow = true;
        this.board.receiveShadow = true;
        this.board.position.set(0, 0, -0.75);
        // this.scene.add(this.board);
        this.group.add(this.board);

        //Create frictionless physics material
        const physicsMaterial = new CANNON.Material("slipperyMaterial");
        const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
            physicsMaterial,
            0, // friction coefficient
            1  // restitution
        );

        //Create the physics body
        this.boardBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, -0.25),
            shape: new CANNON.Box(new CANNON.Vec3(this.boardSize/2, this.boardSize/2, 0.25/2)),
        });

        //Set it frictionless
        this.boardBody.material = physicsContactMaterial;
        
        //Add it to the world
        this.world.addBody(this.boardBody);

        //Create the borders for the board
        const borderGeometry = new THREE.BoxGeometry(this.boardSize+1, 1, 2);
        const borderMaterial = this.woodMaterial;
        this.borderTop = new THREE.Mesh(borderGeometry, borderMaterial);
        this.borderTop.position.set(0, 0 + (this.boardSize/2), 0);
        this.borderTop.castShadow = true;
        this.borderTop.receiveShadow = true;
        this.group.add(this.borderTop);

        this.borderBottom = new THREE.Mesh(borderGeometry, borderMaterial);
        this.borderBottom.position.set(0, 0 - (this.boardSize/2), 0);
        this.borderBottom.castShadow = true;
        this.borderBottom.receiveShadow = true;
        this.group.add(this.borderBottom);

        this.borderLeft = new THREE.Mesh(borderGeometry, borderMaterial);
        this.borderLeft.position.set(0 - (this.boardSize/2), 0, 0);
        this.borderLeft.rotateZ(Math.PI / 2);
        this.borderLeft.castShadow = true;
        this.borderLeft.receiveShadow = true;
        this.group.add(this.borderLeft);

        this.borderRight = new THREE.Mesh(borderGeometry, borderMaterial);
        this.borderRight.position.set(0 + (this.boardSize/2), 0, 0);
        this.borderRight.rotateZ(Math.PI / 2);
        this.borderRight.castShadow = true;
        this.borderRight.receiveShadow = true;
        this.group.add(this.borderRight);

        //Add the borders to the physics world
        this.borderTopBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0 + (this.boardSize/2), 0),
            shape: new CANNON.Box(new CANNON.Vec3(this.boardSize/2, 0.5, 0.5)),
        });

        this.borderBottomBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0 - (this.boardSize/2), 0),
            shape: new CANNON.Box(new CANNON.Vec3(this.boardSize/2, 0.5, 0.5)),
        });
        
        
        this.borderLeftBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0 - (this.boardSize/2), 0, 0),
            shape: new CANNON.Box(new CANNON.Vec3(this.boardSize/2, 0.5, 0.5)),
        });
        //rotate
        this.borderLeftBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
        

        this.borderRightBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0 + (this.boardSize/2), 0, 0),
            shape: new CANNON.Box(new CANNON.Vec3(this.boardSize/2, 0.5, 0.5)),
        });

        //rotate
        this.borderRightBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
       
       
        

        //Add a paddle that the player can control
        const paddleGeometry = new THREE.BoxGeometry(this.paddleSize, this.paddleSize, 0.5);
        const paddleMaterial = new THREE.MeshStandardMaterial(this.woodMaterial);
        // paddleMaterial.emissive = new THREE.Color(0xFFFFFF);
        // paddleMaterial.emissiveIntensity = 0.1;
        this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.paddle.castShadow = true;
        this.paddle.receiveShadow = true;
        this.paddle.position.set(0, 0, 0);
        this.group.add(this.paddle);

        //Add physics body to the paddle
        this.paddleBody = new CANNON.Body({
            mass: 0.01,
            position: new CANNON.Vec3(0, 0, 0.25),
            shape: new CANNON.Box(new CANNON.Vec3(this.paddleSize/2, this.paddleSize/2, 0.5)),
            fixedRotation: true,
        });

        //Make it frictionless
        this.paddleBody.material = physicsContactMaterial;


        if(this.playerId == 1){

            this.world.addContactMaterial(physicsContactMaterial);
            this.world.addBody(this.borderTopBody);
            this.world.addBody(this.borderBottomBody);
            this.world.addBody(this.borderLeftBody);
            this.world.addBody(this.borderRightBody);
            // this.world.addBody(this.boardBody);
            this.world.addBody(this.paddleBody);
        }


        //Add a point light to the paddle
        const pointLight = new THREE.PointLight(0xffffff, 1, 40);
        pointLight.position.set(0, 0, 0 + 20);
        this.group.add(pointLight);

        this.group.position.set(this.x, this.y, this.z);

        scene.add(this.group);


    }

    updateBoard(position, rotation){
        //Update the borders 
        this.group.position.set(position.x, position.y, position.z);
        this.group.quaternion.copy(rotation);

        //Upda
    }

    updatePaddle(position, rotation){
        //Remove any Z axis rotation/velocity
        // this.paddleBody.velocity.set(this.paddleBody.velocity.x, this.paddleBody.velocity.y, this.paddleBody/);

        //Update the paddle, sliding it around if the board is tilted
        this.accelerationX = (gamma/ 90) * (9.81 / 10);
        this.accelerationY = (-beta/ 90) * (9.81 / 10);

        //Apply the acceleration to the paddle Velocity
        this.paddleVelocityX += this.accelerationX;
        this.paddleVelocityY += this.accelerationY;

        //Apply frictive force
        this.paddleVelocityX *= 0.9;
        this.paddleVelocityY *= 0.9;

        // console.log(this.accelerationX, this.accelerationY, this.paddleVelocityX, this.paddleVelocityY);

        //Apply velocity to the paddlebody itself
        this.paddleBody.velocity.set(this.paddleVelocityX, this.paddleVelocityY,  this.paddleBody.velocity.z);

        //Apply force to paddle body
        
        // this.paddleBody.applyForce(new CANNON.Vec3(this.accelerationX, this.accelerationY, 0), new CANNON.Vec3(0, 0, 0));

    }

    updateBorders(){
       //Update borders to be aligned with their bodies
        this.borderTop.position.copy(this.borderTopBody.position);
        this.borderTop.quaternion.copy(this.borderTopBody.quaternion);
        this.borderBottom.position.copy(this.borderBottomBody.position);
        this.borderBottom.quaternion.copy(this.borderBottomBody.quaternion);
        this.borderLeft.position.copy(this.borderLeftBody.position);
        this.borderLeft.quaternion.copy(this.borderLeftBody.quaternion);
        this.borderRight.position.copy(this.borderRightBody.position);
        this.borderRight.quaternion.copy(this.borderRightBody.quaternion);

        
    }

    updateDisplayToPhyisics() {
        //Update the position of the board
        this.board.position.copy(this.boardBody.position);
        this.board.quaternion.copy(this.boardBody.quaternion);

        //Update the position of the paddle
        this.paddle.position.copy(this.paddleBody.position);
        this.paddle.quaternion.copy(this.paddleBody.quaternion);


        this.updateBorders();

    }
    update() {
        // let baseRot = new THREE.Quaternion().setFromEuler(beta * Math.PI/180 ,gamma * Math.PI/180,0,'XYZ');
        if(this.playerId == 1){
            this.updateBoard(this.group.position, this.group.quaternion.setFromEuler(new THREE.Euler(beta * Math.PI/180 ,gamma * Math.PI/180,0,'XYZ')));
            this.updatePaddle(this.group.position, this.group.quaternion);
            this.updateDisplayToPhyisics();
        }
        
        //Update the position of the paddle using alpha and beta
    }
}

class PongBall {
    constructor(scene, world, x, y, z, isListening = false, playerToTargetFirst = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.targetX = 0;
        this.targetY = 0;
        this.time = 0;
        this.speed = 15;
        this.world = world;
        this.playerTargeting = playerToTargetFirst;
        this.group = new THREE.Group();
        this.previousPosition = new THREE.Vector3(0, 0, 0);
        this.reversed = false;
        this.ballSize = 0.5;
        this.isListener = isListening;

        //Create the ball
        const ballGeometry = new THREE.SphereGeometry(this.ballSize, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.castShadow = true;
        this.ball.receiveShadow = true;
        this.ball.position.set(this.x, this.y, this.z);
        this.group.add(this.ball);

        //Create a cylinder of light to show where the ball is going to land
        const lightGeometry = new THREE.CylinderGeometry(this.ballSize, 0.5, 2, 32);
        const lightMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        this.light = new THREE.Mesh(lightGeometry, lightMaterial);
        //Make it transparent
        this.light.material.transparent = true;
        this.light.material.opacity = 0.2;
        // this.light.material.emissive = new THREE.Color(0x000000);
        // this.light.material.emissiveIntensity = 10;
        this.light.position.set(this.x, this.y, this.z +50);
        this.light.rotation.x = Math.PI / 2;
        this.group.add(this.light);


        //Create bouncy contact material
        // const bouncyContactMaterial = new CANNON.ContactMaterial(
        //     new CANNON.Material("default"),
        //     new CANNON.Material("default"),
        //     {
        //         friction: 0,
        //         restitution: 1,
        //     }
        // );

        // //Add physics body to the ball, make it really light and bouncy
        // this.ball = new CANNON.Body({
        //     mass: 0.005,
        //     position: new CANNON.Vec3(this.x, this.y, this.z),
        //     shape: new CANNON.Sphere(1),
        // });
        // this.ball.linearDamping = 0.9;

        // //Make it frictionless
        // this.ball.material = bouncyContactMaterial;

        // this.world.addBody(this.ball);
        scene.add(this.group);

        this.bounceToPlayer(this.playerTargeting);
    }

    updateFromServerData(serverGameState){
        console.log(serverGameState);
        this.targetX = serverGameState.targetX;
        this.targetY = serverGameState.targetY;
            this.time = serverGameState.ballTime;
        this.speed = serverGameState.ballSpeed;
        this.playerTargeting = serverGameState.targetPlayer;
        // this.reversed = serverGameState.reversed;
    }

    retrieveServerData(){
        return {
            targetX: this.targetX,
            targetY: this.targetY,
            ballTime: this.time,
            ballSpeed: this.speed,
            targetPlayer: this.playerTargeting,
        }
    }

    lerpGroupPositionOffset(t){
        let offsetOne = player1.group.position;
        let offsetTwo = player2.group.position;

        let offset = new THREE.Vector3();
        if(this.reversed){
            offset.lerpVectors(offsetOne, offsetTwo, t);
        }else{
            offset.lerpVectors(offsetTwo, offsetOne, t);
        }

        this.group.position.set(offset.x, offset.y, this.group.position.z);
    }

    update() {
        this.slerpPositionToTarget(this.targetX, this.targetY);

        if(!this.isListener){
            this.detectCollision();
            this.time += 0.01;

        }
        
        

        //Update the position of the ball
        // this.ball.position.copy(this.ball.position);
        // this.ball.quaternion.copy(this.ball.quaternion);

        //Update the position of the light
        this.light.position.copy(new THREE.Vector3(this.ball.position.x, this.ball.position.y, 0));

        //rotate light by 90 degrees
        //Always make light aligned with z axis
        if(!this.isListener){
            this.time += 0.01;
            this.detectCollision();
        }
    }

    resetBall() {
        //Reset the ball to the center
        this.ball.position.set(0, 0, 10);

        if(!this.isListener){
            this.speed = 15;
            this.time = 0;
        }

        this.bounceToPlayer(this.playerTargeting == 1 ? 2 : 1);

    }

    collisionWithKillZone() {
        //If the ball falls below 30 units, reset it
        if (this.ball.position.z < -30) {
            this.resetBall();
        }
    }

    slerpPositionToTarget() {
        //Slerp the ball's position to the target position
        if(this.time/this.speed < 1){
            if(this.time/this.speed < 0.3){
                if(this.playerTargeting == 1){
                    this.lerpGroupPositionOffset(1 - (this.time/this.speed)*(this.time/this.speed)/0.09);
                }else{
                    this.lerpGroupPositionOffset((this.time/this.speed)*(this.time/this.speed)/0.09);
                }
            }
    
            if(this.time/this.speed < 0.3){
                this.ball.position.z = ((this.time/this.speed)/0.3) * 10;
            }else if(this.time/this.speed > 0.3){
                //Animate the ball from its current position to the target position
                this.ball.position.x = THREE.MathUtils.lerp(this.previousPosition.x, this.targetX, (this.time/this.speed - 0.3)/0.7);
                this.ball.position.y = THREE.MathUtils.lerp(this.previousPosition.y, this.targetY, (this.time/this.speed - 0.3)/0.7);
                this.ball.position.z = THREE.MathUtils.lerp(10, -1, (this.time/this.speed - 0.3)/0.7);
            }
        }else{
            this.ball.position.x = this.targetX;
            this.ball.position.y = this.targetY;
            this.ball.position.z = -1;
        }
        
        // this.ball.position.slerp(new CANNON.Vec3(this.targetX, this.targetY, -1), this.time/this.speed);
    }

    bounceToPlayer(player) {
        //Bounce the ball to a spot on the other player's board
        //Get the position of the player's board
        //let playerBoardPosition = player == "1" ? player1.boardBody.position : player2.boardBody.position;
        let playerBoardSideLength = player == 1 ? player1.boardSize : player2.boardSize;

        //Get a random X and Y position on the board, using the board's width and height
        

        //Set the target position to the random X and X using sidelentghs
        this.previousPosition = new THREE.Vector3(this.ball.position.x, this.ball.position.y, 10);
        this.targetX = (Math.random() - 0.5) * (playerBoardSideLength-2);
        this.targetY = (Math.random() - 0.5) * (playerBoardSideLength -2);
        this.time = 0;
        this.speed *= 0.9;

    }

    collisionWithPaddle(){
        //Check if collided with paddle
        //If so, bounce the ball to the other player
       

        // //If targeting player 1
        // console.log(this.playerTargeting);
        if(this.playerTargeting == 2 && this.time > 0.3){
            //Check Z distance to see if within range of paddle, using ball radius and paddle height
            // console.log(this.playerTargeting, this.ball.position.z - player1.group.position.z);
            // console.log(this.ball.position.x - player1.paddleBody.position.x , this.ball.position.y - player1.paddleBody.position.y);

            if(Math.abs(this.ball.position.z - player1.group.position.z) <  0.5){
                // console.log(Math.abs(this.ball.position.x - player1.paddleBody.position.x), Math.abs(this.ball.position.y - player1.paddleBody.position.y))
                //Check to see if ball X and Y are within paddle X and Y
                if(Math.abs(this.ball.position.x - player1.paddleBody.position.x) < player1.paddleSize/2 + this.ballSize*2 
                && Math.abs(this.ball.position.y - player1.paddleBody.position.y) < player1.paddleSize/2 + this.ballSize*2){
                    //If so, change the target to player 2
                    console.log("HIT! P1 - ", this.ball.position.x - player1.paddleBody.position.x, this.ball.position.y - player1.paddleBody.position.y)
                    this.playerTargeting = 1;
                    //Bounce the ball to player 2
                    this.bounceToPlayer(1);
                }else{
                    console.log("MISS! P1 - ", this.ball.position.x - player1.paddleBody.position.x, this.ball.position.y - player1.paddleBody.position.y)

                    


                    this.resetBall();
                }
            }
        }

        //If targeting player 2
        if(this.playerTargeting == 1 && this.time > 0.3){

            //Check Z distance to see if within range of paddle, using ball radius and paddle height
            if(Math.abs(this.ball.position.z - player2.group.position.z) <  0.5){
                // console.log(Math.abs(this.ball.position.x - player1.paddleBody.position.x), Math.abs(this.ball.position.y - player1.paddleBody.position.y))

                //Check to see if ball X and Y are within paddle X and Y
                if(Math.abs(this.ball.position.x - player2.paddle.position.x) < player2.paddleSize/2 + this.ballSize*2
                && Math.abs(this.ball.position.y - player2.paddle.position.y) < player2.paddleSize/2 + this.ballSize*2){
                    console.log("HIT! P2 - ", this.ball.position.x - player2.paddle.position.x, this.ball.position.y - player2.paddle.position.y)

                    //If so, change the target to player 1
                    this.playerTargeting = 2;
                    //Bounce the ball to player 1
                    this.bounceToPlayer(2);
                }else{
                    console.log("MISS! P2 - ", this.ball.position.x - player2.paddle.position.x, this.ball.position.y - player2.paddle.position.y)

                    this.resetBall();
                }
            }
        }


            
    }


    detectCollision() {
        this.collisionWithKillZone();
        this.collisionWithPaddle();
    }


}

//A class mostly used to render the skybox and other environmental
//details (like sound, particles, etc.)
class Environment {
    constructor(scene) {
        //Create the skybox
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'textures/skybox/yellowcloud_lf.jpg',
            'textures/skybox/yellowcloud_rt.jpg',
            'textures/skybox/yellowcloud_dn.jpg',
            'textures/skybox/yellowcloud_up.jpg',

            'textures/skybox/yellowcloud_ft.jpg',

            'textures/skybox/yellowcloud_bk.jpg',

            
        ]);

        scene.background = texture;
    }

}


//Render the ThreeJS and CannonJS scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Set environment
const environment = new Environment(scene);

//Create the physics world
const world = new CANNON.World();
world.gravity.set(0, 0, -1);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

const clock = new THREE.Clock()
let delta

//Create the lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 0, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);



//Await socketio matchmake


//Create the player boards
let player1;
let player2;
let ball;

socket.on('startGame', function(data){
    console.log("STARTING GAME")
    document.getElementById("loadingBox").style.display = "none";
    gameState = new GameState(data.listener);
    animate();
    setInterval(() => {
        gameState.syncToServer();
    }, 10);

});

socket.on('updateGameState', function(data){

    gameState.syncFromServer(data);
});

socket.on('resetGame', function(data){
    //Refresh the window
    window.location.reload();
});


//Animate the scene
function animate() {
    requestAnimationFrame(animate);

    //Update the gamestate
    player1 = gameState.player1;
    player2 = gameState.player2;
    ball = gameState.ball;

    delta = Math.min(clock.getDelta(), 0.1)
    cameraTiltMovement();
    world.step(0.1);
    player1.update();
    ball.update();


   

    renderer.render(scene, camera);
}

function cameraTiltMovement(){
    //Tilts the camera with the device for a 3D effect
    if(true || usingGyro){
        camera.rotation.x = 0.15* beta * Math.PI/180;
        camera.rotation.y = 0.15*gamma * Math.PI/180;
    }
}



//Get device orientation
function getPermission(){
    //Append to debug
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        //Debug
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {

            if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', function(event) {
                    //Get the data
                    alpha = event.alpha;
                    beta = event.beta > 45 ? 45 : event.beta < -45 ? -45 : event.beta;
                    gamma = event.gamma > 45 ? 45 : event.gamma < -45 ? -45 : event.gamma;
                    usingGyro = true;
                   
                });
            }
        })

    } else {
        window.addEventListener('deviceorientation', function(event) {
            //Get the data
            alpha = event.alpha;
            beta = event.beta > 45 ? 45 : event.beta < -45 ? -45 : event.beta;
            gamma = event.gamma > 45 ? 45 : event.gamma < -45 ? -45 : event.gamma;
            usingGyro = true;
        });
    }
}

//Create alternate controls using WASD to change global alpha and beta
//as long as GYRO is not being used
function alternateControls(event){
    if(!usingGyro){
       //Use event from keypress
         if(event.code == "KeyA"){
            gamma += 3;
        }
        if(event.code == "KeyD"){
            gamma -= 3;
        }
        if(event.code == "KeyW"){
            beta += 3;
        }
        if(event.code == "KeyS"){
            beta -= 3;
        }
    }
}

//Create listener on keypress 
window.addEventListener("keydown", function (e) {
    alternateControls(e);
}, false);

var ready =false;

function startButton(){
    //Listener on tap screen
    ready = true;
    getPermission();
    onReady();
    document.getElementById("startBox").style.display = "none";
    document.getElementById("loadingBox").style.display = "block";
    
}

window.startButton = startButton;