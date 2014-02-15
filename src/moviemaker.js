var HTMLMovieMaker = (function(undefined){

	'use strict';

	var OBJECT_TYPES = '',
		config = {
			width: 800,
			height: 500,
			name: 'Untitled',
			createBy: 'Jinto Jose',
			controls: true,
			allowFullScreen: false
		},
		loaded = false,
		paused = false,
		started = false,
		stopped = false,
		autoplay = false,
		currentScene,
		currentSceneIndex=0,
		totalDurationPlayed,
		features= {},
		dom = {},
		scenes = [],
		animationStyle,
		keyframeprefix = '-webkit-',
		fullScreenActive = false,
		isMobileDevice;

	var Scene = function( options ){
		this.sceneConfig = {
			duration: 2000,
			name: 'Scene',
			style:{
				backgroundColor: '#fff'
			}
		};
		extend( this.sceneConfig, options );
		var parent = this;
		function create(){
			var divElement = document.createElement('div');
			var parentStyleOptions = parent.sceneConfig.style;
			updateSceneDomStyles(divElement, parentStyleOptions);
			divElement.className = 'scene';
			parent.dom = divElement;
			parent.dom.style.display = 'none';
			parent.dom.style.width = '100%';
			parent.dom.style.position = "relative";
			parent.dom.style.height = '100%';
			return parent;
		}

		create();

	};

	function updateSceneDomStyles(element, options){
		for(var styleElm in options){
			element.style[styleElm] = options[styleElm];
		}
	}

	Scene.prototype.addObject = function(options){
		var movieObject = MovieObjectFactory.createObject(options);
		this.objects = this.objects || [];
		movieObject.dom.id= 'object_' + this.objects.length;
		this.objects.push(movieObject);
		return movieObject;
	};

	Scene.prototype.getProperties = function(){
		return this.sceneConfig;
	};

	Scene.prototype.setProperties = function(options){
		extend(this.sceneConfig, options );
		updateSceneDomStyles(this.dom, this.sceneConfig.style);
	};

	Scene.prototype.getSceneElement = function(){
		return this.dom;
	};

	var MovieObjectFactory = {
		createObject:  function(options){
			var movieObject,
				type = options? options.type : 'TEXT';
			switch(type){
				case 'TEXT':
					movieObject = new TextObject(options);
					break;
				case 'IMAGE':
					movieObject = new ImageObject(options);
					break;
				case 'VIDEO':
					movieObject = new VideoObject(options);
					break;
				default:
					movieObject = new TextObject(options);
					break;

			}
			return movieObject;
		}
	};

	var MovieObject = function( options ){
		
		this.objectConfig = {
			type: 'TEXT',
			text: 'Test content',
			style: {
				color: 'blue'
			}
		};

		extend( this.objectConfig, options );
	};

	MovieObject.prototype.getProperties =function(){
		return this.objectConfig;
	};

	MovieObject.prototype.setProperties = function(options){
			extend( this.objectConfig, options );
	};

	MovieObject.prototype.setInitialStyles = function(element, options){
		var styleOptions = options.styles;
		for(var styleattr in styleOptions){
			element.style[styleattr] = styleOptions[styleattr];
		}

		element.style.position = "absolute";
		element.style.top = options.y? options.y + "px" : "0px";
		element.style.left = options.x? options.x + "px" : "0px";
		element.style.animationPlayState = "paused";
		element.style.MozAnimationPlayState = "paused";
		element.style.webkitAnimationPlayState = "paused";
		element.style.animationFillMode = "forwards";
		element.style.MozAnimationFillMode = "forwards";
		element.style.webkitAnimationFillMode = "forwards";
	};

	function inherit(subClass, superClass){
		var F = function(){};
		F.prototype= superClass.prototype;
		subClass.prototype	= new F();
		subClass.prototype.constructor = subClass;

		subClass.superclass = superClass.prototype;
		if(superClass.prototype.constructor == Object.prototype.constructor){
			superClass.prototype.constructor = superClass;
		}
	}

	function ImageObject(options){
		ImageObject.superclass.constructor.call(this, options);
		var imageOptions = this.objectConfig;
		var imageEl = document.createElement('img');
		imageEl.src = imageOptions.src;
		imageEl.alt = imageOptions.text;
		this.setInitialStyles(imageEl, imageOptions);
		this.dom = imageEl;
		return this;

	}

	function VideoObject(options){
		VideoObject.superclass.constructor.call(this, options);
		var videoOptions = this.objectConfig;
		var videoEl = document.createElement('video');
		videoEl.src = videoOptions.src;
		videoEl.autoplay = false;
		videoEl.poster = videoOptions.posterImageUrl?videoOptions.posterImageUrl: '' ;
		this.setInitialStyles(videoEl, videoOptions);
		this.dom = videoEl;
		return this;
	}

	function TextObject(options){
		TextObject.superclass.constructor.call(this, options);
		var textOptions = this.objectConfig;
		var spanElement = document.createElement('span');
		spanElement.innerHTML = textOptions.text;
		spanElement.className = 'text-object';
		this.setInitialStyles(spanElement, textOptions);
		this.dom = spanElement;
		return this;
	}

	//inheriting from the MovieObject
	inherit(ImageObject, MovieObject);
	inherit(VideoObject, MovieObject);
	inherit(TextObject, MovieObject);


	function createMovie( options ){
		checkCapabilities();
		extend( config, options );
		setupDom();

	}

	function setInitialValues(){
		currentSceneIndex = 0;
		currentScene = {};

		if(animationStyle) {
			var elm = document.getElementById(animationStyle.id);
			animationStyle = null;
			if(elm)
			{
				elm.remove();
			}
		}
	}

	function addControls(){
		var playPauseButton = document.createElement('button');
		playPauseButton.id = "play-pause-button";
		playPauseButton.className = "play";
		playPauseButton.title = "play";
		playPauseButton.style.float = "left";
		playPauseButton.innerHTML = "Play";

		var stopButton = document.createElement('button');
		stopButton.id = "stop";
		stopButton.title = "stop";
		stopButton.style.float = "left";
		stopButton.style.display = "none";
		stopButton.innerHTML = "Stop";

		var fullScreenButton = document.createElement('button');
		fullScreenButton.id = "fullscreen-button";
		fullScreenButton.title = "FullScreen";
		fullScreenButton.innerHTML = "FullScreen";

		var toolbar = document.createElement('div');
		toolbar.id = "video-controls";
		toolbar.appendChild(playPauseButton);
		toolbar.appendChild(stopButton);

		var topValue = dom.wrapper.offsetTop + config.height + 10;
		var leftValue = dom.wrapper.offsetLeft + ((config.width/2) - 100);

		toolbar.style.position = "absolute";
		toolbar.style.top = topValue+ "px";
		toolbar.style.left = leftValue + "px";
		toolbar.style.display ="block";
		if(config.allowFullScreen){
			toolbar.appendChild(fullScreenButton);
		}
		
		document.body.appendChild(toolbar);
	}

	function toggleControlsDisplay(){
		if(started){
			var isHidden = dom.toolbar.style.display === 'none' || dom.toolbar.style.visibility === 'hidden';
			dom.toolbar.style.display = isHidden? "block": "none";
		}
	}

	function togglePlayPauseElement(addPlay){
		var playPauseBtn = dom.toolbar.playPauseButton;
		if(addPlay){
			playPauseBtn.title = "play";
			playPauseBtn.innerHTML = "Play";
			playPauseBtn.className = "play";
		}
		else{
			playPauseBtn.title = "pause";
			playPauseBtn.innerHTML = "Pause";
			playPauseBtn.className = "pause";
		}
	}

	function togglePlayPause(){
		var playPauseBtn = dom.toolbar.playPauseButton;

		if(playPauseBtn.title === "play"){
			playPauseBtn.title = "pause";
			playPauseBtn.innerHTML = "Pause";
			playPauseBtn.className = "pause";
			if(started === false){
				start();
			}
			else {
				resume();
			}
		}
		else{
			playPauseBtn.title = "play";
			playPauseBtn.innerHTML = "Play";
			playPauseBtn.className = "play";
			pause();
		}
		
	}

	function goFullScreen(){

		var elem = document.body;
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		}

		//dom.wrapper.style.width = "100%";
		//dom.wrapper.style.height = "100%";

		fullScreenActive = true;

	}

	function restoreContainerSize(){
		dom.wrapper.style.width = config.width + "px";
		dom.wrapper.style.height = config.height + "px";
	}

	function onFullScreenChange(){
		var fullScreenElement = FullScreenElement || msFullscreenElement ||
									mozFullScreenElement || webkitFullscreenElement;
		if(fullScreenActive && fullScreenElement){
			fullScreenActive = false;
			restoreContainerSize();
		}
	}

	function attachEvents(){
		//dom.wrapper.addEventListener('mouseover', toggleControlsDisplay);
		//dom.wrapper.addEventListener('mouseout', toggleControlsDisplay);

		dom.toolbar.playPauseButton.addEventListener("click", togglePlayPause);

		dom.toolbar.stopButton.addEventListener("click", stop);

		dom.toolbar.fullScreenButton.addEventListener("click", goFullScreen);

		//document.body.addEventListener('webkitfullscreenchange mozfullscreenchange fullscreenchange', onFullScreenChange);

	}

	function cacheDomElements(){
		dom.toolbar = document.querySelector('#video-controls');
		dom.toolbar.playPauseButton = document.querySelector('#video-controls #play-pause-button');
		dom.toolbar.stopButton = document.querySelector('#video-controls #stop');
		dom.toolbar.fullScreenButton = document.querySelector('#video-controls #fullscreen-button');
	}

	function addScene( options ){
		var scene = new Scene(options);

		scene.dom.id = 'scene_'+ scenes.length;
		scene.dom.style.display = 'none';
		scenes.push(scene);
		return scene;
	}

	function setupDom(){
		var movieContainer;
		if(!config.containerDiv || document.querySelector(config.containerDiv).length === 0){
			movieContainer = document.createElement('div');
			movieContainer.id =  "movie-container";
			movieContainer.className = "moviemaker-wrapper";
			document.body.appendChild(movieContainer);
		}
		else{
			movieContainer = document.querySelector(config.containerDiv);
		}

		movieContainer.style.width = parseInt(config.width, 10) + 'px';
		movieContainer.style.height = parseInt(config.height, 10) + 'px';

		dom.wrapper = movieContainer;
		if(config.controls === true){
			addControls();
		}

		cacheDomElements();

		attachEvents();
		addGeneralStyles();
	}

	function addGeneralStyles(){
		var generalStyleDOM = document.createElement('style');
		var wrapperStyle = dom.wrapper.style;
		var styles = ".moviemaker-wrapper * { max-width: "+ wrapperStyle.width+"; max-height: "+ wrapperStyle.height+"; }";
		generalStyleDOM.innerHTML = styles;
		document.head.appendChild(generalStyleDOM);

	}

	function addVendorPrefixes(style, stylevalue){
		var styleString = '';
		styleString += style.toLowerCase() + ': '+ stylevalue+ ';';
		styleString += '-webkit-' + style.toLowerCase() + ': '+ stylevalue+ ';';
		styleString += '-moz-' + style.toLowerCase() + ': '+ stylevalue+ ';';
		styleString += '-ms-' + style.toLowerCase() + ': '+ stylevalue+ ';';
		return styleString;
	}

	function createAnimationStyles(){
		var styleDOM = document.createElement('style');
		var keyFramesString= '';
		for(var index=0, sceneCount= scenes.length; index < sceneCount; index++ ){
			var objects = scenes[index].objects;
			for(var objectIndex=0,objectCount = objects.length; objectIndex < objectCount; objectIndex++){
				var currentObject = objects[objectIndex];
				var keyframes = currentObject.objectConfig.keyframes;

				if(keyframes){
					var totalKeyframes = keyframes.length;
					if(totalKeyframes>0){
					var startTime = keyframes[0].start;
					
					var endTime = keyframes[totalKeyframes-1].start;
					var animationTime = parseInt(endTime,10) - parseInt(startTime,10);
					var animationName = 'scene_'+index+'_object_'+objectIndex+'_anim';

					//adding the animations to the elements
					currentObject.animationName = animationName;
					currentObject.animationTime = animationTime;
					currentObject.dom.style.animationDelay = startTime;
					currentObject.dom.style.webkitAnimationDelay = startTime;
					keyFramesString += '@' + keyframeprefix + 'keyframes ' + animationName +' { ';
					for(var i=0; i<totalKeyframes; i++){

						var currentKeyframe = keyframes[i];

						var currentKeyFrameStyles = '';
						for(var animStyle in currentKeyframe.styles){
							currentKeyFrameStyles +=  (animStyle!= 'filter' && animStyle in document.body.style) ?
									animStyle + ':' + currentKeyframe.styles[animStyle] +';' :
									addVendorPrefixes(animStyle, currentKeyframe.styles[animStyle]);
						}

						if(i===0){
							keyFramesString += '0% {' + currentKeyFrameStyles  +' }';
						}
						else if(i==totalKeyframes-1){
							keyFramesString += '100% {' + currentKeyFrameStyles  +' }';
						}
						else{
							var currentKeyFramePercent =  Math.floor((currentKeyframe.start/endTime)*100);
							keyFramesString += currentKeyFramePercent +'% {' + currentKeyFrameStyles  +' }';
						}

					}

					keyFramesString += '}';

				}

				}
				
				
			}

		}

		styleDOM.innerHTML = keyFramesString;
		styleDOM.id = "moviemaker-animation-style";
		document.head.appendChild(styleDOM);
		animationStyle = styleDOM;

	}

	function start(){
		setInitialValues();
		addAllScenesToDom();
		createAnimationStyles();
		started = true;
		dom.toolbar.stopButton.style.display = "block";
		if(!features.animation){
			console.log('Animation not supported. Will not work.');
			return;
		}
		playScene();

	}

	function addAllScenesToDom(){
		scenes.forEach(function(scene){
			dom.wrapper.appendChild(scene.dom);
			addAllObjectsToSceneDom(scene);
		});
		
	}

	function addAllObjectsToSceneDom(scene){
		scene.objects.forEach(function(movieObject){
			scene.dom.appendChild(movieObject.dom);
		});
	}

	function pause(){
		paused = true;
		pauseAnimationsOfObjectsInScene(currentScene.objects);
		scenes.forEach(function(scene){
			clearTimeout(scene.sceneConfig.timeoutObj);
		});
		currentScene.pausedTime = Date.now();
		var elapsedTime =  currentScene.pausedTime - currentScene.startedTime;
		currentScene.playedTime = currentScene.playedTime?  currentScene.playedTime + elapsedTime: elapsedTime;
		
	}

	function resume(){
		paused = false;
		var remainingTime = currentScene.sceneConfig.duration - currentScene.playedTime;
		resumeAnimationsOfObjectsInScene(currentScene.objects);
		currentScene.startedTime = Date.now();
		currentScene.sceneConfig.timeoutObj = setTimeout(playScene, remainingTime);
	}

	function stop(){
		stopped = true;
		started = false;
		scenes.forEach(function(scene){
			clearTimeout(scene.sceneConfig.timeoutObj);
			removeAllAnimationsOfScene(scene);
		});
		dom.toolbar.stopButton.style.display = "none";
		setInitialValues();
		togglePlayPauseElement(true);

	}

	function removeAllAnimationsOfScene(scene){
		scene.dom.style.animation = '';
		scene.dom.style.webkitAnimation= '';
		scene.dom.style.display ='none';
	}

	

	function playScene(){
		showScene(currentSceneIndex);
		if(currentSceneIndex == scenes.length-1){
			return;
		}
		scenes[currentSceneIndex+1].sceneConfig.timeoutObj = setTimeout(playScene,scenes[currentSceneIndex].sceneConfig.duration);
		currentSceneIndex++;
	}

	function triggerEvent(eventName, element, properties){

		var event = new CustomEvent(eventName, properties);
		element.dispatchEvent(event);
	}

	function showScene(currentSceneCount){
		if(currentSceneCount !== 0){
			hideScene(currentSceneCount-1);
		}
		scenes[currentSceneCount].startedTime = Date.now();
		scenes[currentSceneCount].dom.style.display ='block';
		currentScene = scenes[currentSceneCount];
		triggerEvent("onsceneshow", currentScene.dom, currentScene);
		activeAnimationsOfObjectsInScene(scenes[currentSceneCount], scenes[currentSceneCount].objects);
	}

	function pauseAnimationsOfObjectsInScene(objects){
		if(objects && objects.length>0){
			for(var objindex=0; objindex<objects.length;objindex++){
				var currentObject = objects[objindex];
				if(currentObject.objectConfig.type === 'VIDEO'){
					pauseVideo(currentObject);
				}
				if(currentObject.animationName){
					currentObject.dom.style.animationPlayState = "paused";
					currentObject.dom.style.webkitAnimationPlayState = "paused";
				}
				
			}

		}
	}

	function resumeAnimationsOfObjectsInScene(objects){
		if(objects.length>0){
			for(var objindex=0; objindex<objects.length;objindex++){

				var currentObject = objects[objindex];
				if(currentObject.objectConfig.type === 'VIDEO'){
					playVideo(currentObject);
				}
				if(currentObject.animationName){
					currentObject.dom.style.animationPlayState = "running";
					currentObject.dom.style.webkitAnimationPlayState = "running";
				}
				
			}

		}
	}

	function playVideo(object){
		object.dom.play();
	}
	function pauseVideo(object){
		object.dom.pause();
	}

	function activeAnimationsOfObjectsInScene(scene, objects){
		if(objects.length>0){
			for(var objindex=0; objindex<objects.length;objindex++){
				var currentObject = objects[objindex];
				if(currentObject.objectConfig.type === 'VIDEO'){
					playVideo(currentObject);
				}
				if(currentObject.animationName){
					currentObject.dom.style.animationName = currentObject.animationName;
					currentObject.dom.style.webkitAnimationName = currentObject.animationName;
					var duration = currentObject.animationTime + 's';
					currentObject.dom.style.animationDuration = duration;
					currentObject.dom.style.webkitAnimationDuration = duration;

					currentObject.dom.style.animationPlayState = "running";
					currentObject.dom.style.webkitAnimationPlayState = "running";
				}
				
			}

		}
	}

	function hideScene(previousSceneIndex){
		var sceneToBeHidden = scenes[previousSceneIndex];
		removeAllAnimationsOfScene(sceneToBeHidden);
	}


	/**
	 * Inspect the client to see what it's capable of, this
	 * should only happens once per runtime.
	 */
	function checkCapabilities() {
		
		features.animation = 'webkitAnimation' in  document.body.style ||
								'animation' in document.body.style;

		features.transforms3d = 'WebkitPerspective' in document.body.style ||
								'MozPerspective' in document.body.style ||
								'msPerspective' in document.body.style ||
								'OPerspective' in document.body.style ||
								'perspective' in document.body.style;

		features.transforms2d = 'WebkitTransform' in document.body.style ||
								'MozTransform' in document.body.style ||
								'msTransform' in document.body.style ||
								'OTransform' in document.body.style ||
								'transform' in document.body.style;

		features.requestAnimationFrameMethod = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
		features.requestAnimationFrame = typeof features.requestAnimationFrameMethod === 'function';

		features.canvas = !!document.createElement( 'canvas' ).getContext;

		isMobileDevice = navigator.userAgent.match( /(iphone|ipod|android)/gi );

	}

	/**
	 * Extend object a with the properties of object b.
	 * If there's a conflict, object b takes precedence.
	 */
	function extend( a, b ) {

		for( var i in b ) {
			a[ i ] = b[ i ];
		}

	}

	return {
		createMovie: createMovie,
		start: start,
		pause: pause,
		stop: stop,
		resume: resume,
		addScene: addScene
	};

})();