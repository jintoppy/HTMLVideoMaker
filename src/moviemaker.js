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
		currentSceneIndex=-1,
		totalDurationPlayed,
		features= {},
		dom = {},
		scenes = [],
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

		$(config.containerDiv).html('This is your movie').css({width: config.width, height: config.height});

		if(config.controls === true){
			addControls();
		}

		cacheDomElements();
		
	}

	function start(){
		scenes[0].dom.style.display ='block';
		console.log(scenes[0].duration);
		setTimeout(playFrame,scenes[0].sceneConfig.duration);
	}

	function playFrame(){
		currentSceneIndex++;
		console.log(currentSceneIndex);
		console.dir(scenes[currentSceneIndex]);
		if(currentSceneIndex !== 0){
			scenes[currentSceneIndex-1].dom.style.display ='none';
		}
		
		scenes[currentSceneIndex].dom.style.display ='block';
		currentScene = scenes[currentSceneIndex];
		if(currentSceneIndex == scenes.length-1){
			return;
		}
		setTimeout(playFrame,scenes[currentSceneIndex].sceneConfig.duration);
	}


	function pause(){

	}

	function stop(){

	}

	/**
	 * Inspect the client to see what it's capable of, this
	 * should only happens once per runtime.
	 */
	function checkCapabilities() {

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
		addScene: addScene
	};

})(jQuery);