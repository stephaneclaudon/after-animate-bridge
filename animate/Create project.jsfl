fl.outputPanel.clear();
var compFolder = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/") + 1);
compFolder = 'file://' + FLfile.uriToPlatformPath(compFolder);

var imagesFolder = compFolder + 'images/';

if (config) {
	var doc = fl.createDocument("timeline");
	var timeline = doc.getTimeline();

	var projectFile = compFolder + config.compName + '.fla';
	if (fl.fileExists(projectFile)) {
		alert("Animate project already exists, delete it and retry.");
	} else {
		var imagesExtension = config.fileName.split('.')[1];

		// Grab all png files in the source folder
		var fileMask = "*." + imagesExtension;
		var fileList = FLfile.listFolder(imagesFolder + fileMask, "files");

		timeline.deleteLayer(0);
		timeline.setLayerProperty('name', config.compName);
		timeline.currentFrame = 1;
		timeline.clearFrames(0);

		doc.library.newFolder(config.compName);
		// Now process through each one and export it as a swf
		for (var i = 0; i < fileList.length; i++) {
			// Import the file
			var URI = imagesFolder + fileList[i];

			// make room
			timeline.currentFrame = i + 1;
			if (i > 0) timeline.insertBlankKeyframe();

			doc.importFile(URI, true);
			doc.library.moveToFolder(config.compName, fileList[i], true);
			
			doc.library.addItemToDocument({
				x: config.width * 0.5,
				y: config.height * 0.5
			}, config.compName + '/' + fileList[i]);

		}
		
		timeline.setLayerProperty('locked', true);
		timeline.addNewLayer('Paint');

		doc.width = config.width;
		doc.height = config.height;
		doc.frameRate = config.frameRate;
		fl.trace(projectFile);
		doc.saveAsCopy(projectFile);
		fl.openDocument(projectFile);
	}


} else {
	alert('No config file found in folder, can\'t import...');
}