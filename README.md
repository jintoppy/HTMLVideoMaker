HTMLVideoMaker
==============

A JavaScript library to create HTML videos

An example usage is given below

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
			url: 'img/image1.jpg'
		});

	HTMLMovieMaker.start();
</script>