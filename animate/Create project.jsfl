fl.outputPanel.clear();
var compFolder = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/") + 1);
compFolder = 'file://' + FLfile.uriToPlatformPath(compFolder);

var imagesFolder = compFolder + 'images/';

if (compConfig) {
	var doc = fl.createDocument("timeline");
	var timeline = doc.getTimeline();

	var projectFile = compFolder + compConfig.compName + '.fla';
	if (fl.fileExists(projectFile)) {
		alert("Animate project already exists, delete it and retry.");
	} else {
		var imagesExtension = compConfig.fileName.split('.')[1];

		// Grab all png files in the source folder
		var fileMask = "*." + imagesExtension;
		var fileList = FLfile.listFolder(imagesFolder + fileMask, "files");

		timeline.deleteLayer(0);
		timeline.setLayerProperty('name', 'from_after_effects');
		timeline.currentFrame = 1;
		timeline.clearFrames(0);

		doc.library.newFolder(compConfig.compName);
		// Now process through each one and export it as a swf
		for (var i = 0; i < fileList.length; i++) {
			// Import the file
			var URI = imagesFolder + fileList[i];

			// make room
			timeline.currentFrame = i + 1;
			if (i > 0) timeline.insertBlankKeyframe();

			doc.importFile(URI, true);
			doc.library.moveToFolder(compConfig.compName, fileList[i], true);
			
			doc.library.addItemToDocument({
				x: compConfig.width * 0.5,
				y: compConfig.height * 0.5
			}, compConfig.compName + '/' + fileList[i]);

		}
		
		timeline.setLayerProperty('locked', true);
		timeline.addNewLayer('Paint');

		doc.width = compConfig.width;
		doc.height = compConfig.height;
		doc.frameRate = compConfig.frameRate;
		fl.trace(projectFile);
		doc.saveAsCopy(projectFile);
		fl.openDocument(projectFile);
	}


} else {
	alert('No compConfig file found in script, can\'t import...');
}