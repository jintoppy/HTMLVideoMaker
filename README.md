HTMLVideoMaker[![Build Status](https://travis-ci.org/jintoppy/HTMLVideoMaker.png)](https://travis-ci.org/jintoppy/HTMLVideoMaker)
==============

A JavaScript library to create HTML videos

An example usage is given below

```html
<script src="moviemaker.js"></script>

<script type="text/javascript">
	HTMLMovieMaker.createMovie({
		name: 'My Movie'
	});
	var scene1 = HTMLMovieMaker.addScene({duration: 1000});

	scene1.addObject({
		text: 'Dynamic one', 
		type: 'TEXT'
	});

	var scene2 = HTMLMovieMaker.addScene();
	scene2.addObject(
		{ 
			type:'IMAGE', 
			src: 'img/image1.jpg'
		});

	HTMLMovieMaker.start();
</script>
```

There are three types of object supported right now. TEXT(this is the default one), IMAGE, VIDEO

You can add eventlisteners to each scene show. 
```html
		var scene2 = HTMLMovieMaker.addScene({duration: 5000});
		var scene2Elm = scene2.getSceneElement();
		scene2Elm.addEventListener('onsceneshow', function(e){
			// do what you want when scene 2 is shown 
		});

```
