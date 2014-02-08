var HTMLMovieMaker = (function($){

	'use strict';

	var OBJECT_TYPES = '',
		config = {
			width: 900,
			height: 700,
			name: 'Untitled',
			createBy: 'Jinto Jose',
			controls: true,
			containerDiv: '#movie-container'
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
		isMobileDevice;

	var Scene = function( options ){
		this.sceneConfig = {
			duration: 2000,
			name: 'Scene'
		};
		extend( this.sceneConfig, options );
		var parent = this;
		function create(){
			var divElement = document.createElement('div');
			divElement.className = 'scene';
			divElement.innerHTML = 'This is the scene object html';
			parent.dom = divElement;
			parent.dom.style.display = 'none';
			return parent;
		}

		create();

	};

	Scene.prototype.addObject = function(options){
		var movieObject = MovieObjectFactory.createObject(options);
		this.dom.appendChild(movieObject.dom);
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
	};

	var MovieObjectFactory = {
		createObject:  function(options){
			var movieObject,
				type = options? options.type : 'TEXT';
			switch(type){
				case 'TEXT':
					movieObject = new TextObject(options);
					break;
				case 'IMG':
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
	}

	function VideoObject(options){
		VideoObject.superclass.constructor.call(this, options);
	}

	function TextObject(options){
		TextObject.superclass.constructor.call(this, options);
		var options = this.objectConfig;
		var spanElement = document.createElement('span');
		spanElement.innerHTML = options.text;
		spanElement.className = 'text-object';
		for(var styleattr in options.style){
			spanElement.style[styleattr] = options.style[styleattr];
		}
		spanElement.style.position = "relative";
		spanElement.style.animationPlayState = "paused";
		spanElement.style.webkitAnimationPlayState = "paused";

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
		var startButton = $('<button id="start">Start</button>');
		var pauseButton = $('<button id="pause">Pause</button>');
		var stopButton = $('<button id="stop">Stop</button>');
		var toolbar = $('<div id="toolbar" />');

		toolbar.css({position: 'absolute', top: '50%', left: 10}).append([startButton, pauseButton, stopButton]);
		 
		$(config.containerDiv).append(toolbar);
			
	}

	function cacheDomElements(){
		dom.wrapper = $(config.containerDiv);
		dom.toolbar = $('#toolbar');
		dom.toolbar.startButton = $('#toolbar #start');
		dom.toolbar.pauseButton = $('#toolbar #pause');
		dom.toolbar.stopButton = $('#toolbar #stop');
	}

	function addScene( options ){
		var scene = new Scene(options);

		scene.dom.id = 'scene_'+ scenes.length;
		scene.dom.style.display = 'none';
		scenes.push(scene);
		dom.wrapper.append(scene.dom);
		return scene;
	}

	function setupDom(){
		if($(config.containerDiv).length === 0){
			$('<div id="movie-container" />').appendTo(document.body);

		}

		$(config.containerDiv).css({width: config.width, height: config.height});

		if(config.controls === true){
			addControls();
		}
		cacheDomElements();
		
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
					var animationTime = endTime - startTime;
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
							currentKeyFrameStyles += animStyle in document.body.style ?
									animStyle + ':' + currentKeyframe.styles[animStyle]+';' : 
									addVendorPrefixes(animStyle, currentKeyframe.styles[animStyle]);
						}

						if(i==0){
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
		createAnimationStyles();
		started = true;
		showScene(0);
		if(!features.animation){
			console.log('Animation not supported. Will not work.');
			return;
		}
		playScene();
	}

	function pause(){
		paused = true;
		pauseAnimationsOfObjectsInScene(currentScene.objects);
		scenes.forEach(function(scene){
			clearTimeout(scene.sceneConfig.timeoutObj);
		});
		currentScene.pausedTime = Date.now();
	}

	function resume(){
		paused = false;
		var elapsedTime =  currentScene.startedTime - currentScene.pausedTime;
		var remainingTime = currentScene.sceneConfig.duration - elapsedTime;
		resumeAnimationsOfObjectsInScene(currentScene.objects);
		currentScene.sceneConfig.timeoutObj = setTimeout(playScene, remainingTime);
	}

	function stop(){
		stopped = true;
		scenes.forEach(function(scene){
			clearTimeout(scene.sceneConfig.timeoutObj);
			removeAllAnimationsOfScene(scene);
		});

		setInitialValues();
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
		currentSceneIndex++;
		scenes[currentSceneIndex].sceneConfig.timeoutObj = setTimeout(playScene,scenes[currentSceneIndex].sceneConfig.duration);
	}

	function showScene(currentSceneCount){
		if(currentSceneCount !== 0){
			hideScene(currentSceneCount-1);	
		}

		scenes[currentSceneCount].startedTime = Date.now();
		scenes[currentSceneCount].dom.style.display ='block';
		currentScene = scenes[currentSceneCount];
		activeAnimationsOfObjectsInScene(scenes[currentSceneCount].objects);

	}

	function pauseAnimationsOfObjectsInScene(objects){
		if(objects.length>0){
			for(var objindex=0; objindex<objects.length;objindex++){
				var currentObject = objects[objindex];
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
				if(currentObject.animationName){
					currentObject.dom.style.animationPlayState = "running";
					currentObject.dom.style.webkitAnimationPlayState = "running";
				}
				
			}

		}
	}

	function activeAnimationsOfObjectsInScene(objects){
		if(objects.length>0){
			for(var objindex=0; objindex<objects.length;objindex++){

				var currentObject = objects[objindex];
				if(currentObject.animationName){
					currentObject.dom.style.animationName = currentObject.animationName;
					currentObject.dom.style.webkitAnimationName = currentObject.animationName;
					currentObject.dom.style.animationDuration = '2s';
					currentObject.dom.style.webkitAnimationDuration = '2s';

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

})(jQuery);