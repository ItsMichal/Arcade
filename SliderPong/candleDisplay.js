 //Connect to socketio
 var socket = io.connect();
 var playerId = 0;

 //Get the accelerometer data from the DeviceMotionEvent
 var x = 0;
 var y = 0;
 var z = 0;

 //First request permission to use the accelerometer
 function getPermission(){
     //Append to debug
     if (typeof DeviceOrientationEvent.requestPermission === 'function') {
         //Debug
         DeviceOrientationEvent.requestPermission()
           .then(permissionState => {
             document.getElementById("debug").innerHTML += `Permission state is ${permissionState}<br>`;

             if (permissionState === 'granted') {
                 window.addEventListener('deviceorientation', function(event) {
                     //document.getElementById("debug").innerHTML += "Requesting permission 3...<br>";
                     //Get the data
                     x = event.alpha;
                     y = event.beta;
                     z = event.gamma;

                    
                     //document.getElementById("debug").innerHTML = `alpha: ${event.alpha}<br> beta: ${event.beta}<br> gamma: ${event.gamma}<br>`;
                 });
             }
         })
         document.getElementById("debug").innerHTML += "Requesting permission 4...<br>";

     } else {
         console.log("notios");
     }
 }
 window.getPermission = getPermission;
 
 //THREE
 import * as THREE from 'three';

 //We will render a game where the user tilts their device to
 //move the ball around the screen, with the goal of getting
 //into one of two zones to move pong up and down using socketio

 var upZoneX = 0;
 var upZoneY = -5;
 var downZoneX = 0;
 var downZoneY = 5;
 var currentUpZone = [0, -5];
 var currentDownZone = [0, 5];
 var planeSizeW = 13.5;
 var planeSizeH = 24;
 var zoneSize = 3;
 var ballRadius = 0.5;

 //THREEJS SETUP
 const scene = new THREE.Scene()
 const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 const renderer = new THREE.WebGLRenderer()
 renderer.setSize(window.innerWidth, window.innerHeight)
 document.body.appendChild(renderer.domElement);
 //THREEJS SETUP

 //CANNONJS
 const world = new CANNON.World();
 world.gravity.set(0, 0, -15);
 world.broadphase = new CANNON.NaiveBroadphase();
 world.solver.iterations = 10;
 //CANNONJS

 //LIGHT MAIN
 const light = new THREE.PointLight(0xffffff, 1, 200)
 light.position.set(0, 0, 20)
 scene.add(light)
 //LIGHT MAIN

 //BALL
 const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32)
 const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
 const ball = new THREE.Mesh(ballGeometry, ballMaterial);
 scene.add(ball);
 //Add cannon physics to the ball, with friction
 const ballBody = new CANNON.Body({
     mass: 2,
     position: new CANNON.Vec3(0, 0, 5),
     shape: new CANNON.Sphere(ballRadius),
     material: new CANNON.Material({ friction: 1 })
 });
 world.addBody(ballBody);
 //BALL

 //TRAIL
 const trailPoints = [];
 const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
 const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
 const trail = new THREE.Line(trailGeometry, trailMaterial);
 scene.add(trail);
 //TRAIL

 //UPZONE
 const upZoneGeometry = new THREE.CylinderGeometry(zoneSize,zoneSize, 1, 32);
 const upZoneMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
 const upZone = new THREE.Mesh(upZoneGeometry, upZoneMaterial);
 upZone.position.set(0, 5, 1);
 upZone.rotateX(Math.PI / 2);
 scene.add(upZone);
 //UPZONE


 //DOWNZONE
 const downZoneGeometry = new THREE.CylinderGeometry(zoneSize, zoneSize, 1, 32);
 const downZoneMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
 const downZone = new THREE.Mesh(downZoneGeometry, downZoneMaterial);
 downZone.position.set(0, -5, 1);
 downZone.rotateX(Math.PI / 2);
 scene.add(downZone);
 //DOWNZONE

 //PADDLE
 const planeGeometry = new THREE.BoxGeometry(planeSizeW, planeSizeH, 1);
 const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
 const plane = new THREE.Mesh(planeGeometry, planeMaterial);
 plane.position.set(0, 0, -1);
 scene.add(plane);
 
 //PADDLEPHYS
 const planeBody = new CANNON.Body({
     mass: 0,
     position: new CANNON.Vec3(0, 0, -1),
     shape: new CANNON.Box(new CANNON.Vec3(planeSizeW, planeSizeH, 1)),
 });
 world.addBody(planeBody);
 //PADDLEPHYS
 //PADDLE

 //ThreeJS
 const clock = new THREE.Clock()
 let delta
 camera.position.z = 20;


 function animate() {
     requestAnimationFrame(animate);
     delta = Math.min(clock.getDelta(), 0.1)
     world.step(delta);
    
     updateBall();
     renderTrail();
     updatePlane();
     moveUpDownZones();
     moveCameraWithTilt();

     document.getElementById("debug").innerHTML = `player: ${playerId}<br> x: ${x}<br> y: ${y}<br> z: ${z}<br>`;
     renderer.render(scene, camera);
 }
 animate();

 window.addEventListener('resize', onWindowResize, false)
 function onWindowResize() {
     camera.aspect = window.innerWidth / window.innerHeight
     camera.updateProjectionMatrix()
     renderer.setSize(window.innerWidth, window.innerHeight)
     render()
 }

 function updateBall(){
      //If balls distance is too far away, reset it
      if (false &&ball.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 20) {
         ballBody.position.set(0, 0, 5);
         ballBody.velocity.set(0, 0, 0);
         //Shake the camera for a second
         let shake = setInterval(() => {
             camera.position.x = Math.random() * 0.1 - 0.05;
             camera.position.y = Math.random() * 0.1 - 0.05;
         }, 10);
         setTimeout(() => {
             camera.position.x = 0;
             camera.position.y = 0;
             clearInterval(shake);
         }, 1000);
     }
     //Update the ball position
     ball.position.copy(ballBody.position); 
     ball.quaternion.copy(ballBody.quaternion);
 }

 function renderTrail(){
     //Add another point to the trail and update its geometry
     trailPoints.push(ball.position.clone());
     trailGeometry.setFromPoints(trailPoints);
     trailGeometry.verticesNeedUpdate = true;

     //Remove the last point of the trail if it is too long
     if (trailPoints.length > 200) {
         trailPoints.shift();
     }
 }

 function updatePlane(){
      //Set the rotation of the plane to the rotation of the device, using one line
      planeBody.quaternion.setFromEuler(y * Math.PI/180 ,z * Math.PI/180,0,   'XYZ');
      //planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), z * Math.PI/180);
      //Update the plane position
      plane.quaternion.copy(planeBody.quaternion);
      
 }

 function moveUpDownZones(){
     //After 5 seconds, move the zones to a random position on the plane, without intersecting one zone intersecting the other
     if (clock.getElapsedTime() > 5) {
         upZoneX = Math.random() * (planeSizeW - zoneSize*2) - (planeSizeW - zoneSize*2) / 2;
         upZoneY = Math.random() * (planeSizeH - zoneSize*2) - (planeSizeH - zoneSize*2) / 2;
         //Generate downzone until it doesnt intersect
         do {
             downZoneX = Math.random() * (planeSizeW - zoneSize) - (planeSizeW - zoneSize) / 2;
             downZoneY = Math.random() * (planeSizeH - zoneSize) - (planeSizeH - zoneSize) / 2;
         } while (Math.abs(downZoneX - upZoneX) < zoneSize*2 && Math.abs(downZoneY - upZoneY) < zoneSize*2)
         clock.start();
     }

     //Move the blue and red zones towards the target
     currentUpZone[0] += (upZoneX - currentUpZone[0]) * 0.1;
     currentUpZone[1] += (upZoneY - currentUpZone[1]) * 0.1;
     currentDownZone[0] += (downZoneX - currentDownZone[0]) * 0.1;
     currentDownZone[1] += (downZoneY - currentDownZone[1]) * 0.1;

     //Project the 2D coordinates onto the 3D mesh
     let finalUpZone = new THREE.Vector3(currentUpZone[0], currentUpZone[1], 1).applyMatrix4(plane.matrixWorld);
     let finalDownZone = new THREE.Vector3(currentDownZone[0], currentDownZone[1], 1).applyMatrix4(plane.matrixWorld);
      
     //Update the position of the zones
     upZone.position.set(finalUpZone.x, finalUpZone.y, finalUpZone.z);
     downZone.position.set(finalDownZone.x, finalDownZone.y, finalDownZone.z);

     //Align the direction of the plane normal with the direction of the cylinder normal
     upZone.quaternion.copy(plane.quaternion);
     downZone.quaternion.copy(plane.quaternion);

     //Rotate the zones 90 degrees
     upZone.rotateX(Math.PI/2);
     downZone.rotateX(Math.PI/2);

     //Check if ball is within the cylinder, accounting for ball and cylinder radius
     if (ballBody.position.distanceTo(finalUpZone) < zoneSize) {
         //If it is, check if it is within the zone
       //  if (Math.abs(ball.position.x - finalUpZone.x) < zoneSize && Math.abs(ball.position.y - finalUpZone.y) < zoneSize) {
             
            //Change the color of the ball
             ball.material.color.setHex(0x0000ff);
        
     }else{
         ball.material.color.setHex(0xffffff);
     }
     
     
 }

 function moveCameraWithTilt(){
     //Rotate the camera slightly with the tilt of the device for a parallax effect

     

     //Look at the ball slightly
     camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

     camera.rotation.x += -0.1 * y * Math.PI/180;
     camera.rotation.y += -0.1 * z * Math.PI/180;
     
 }