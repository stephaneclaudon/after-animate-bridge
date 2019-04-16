#include 'json.jsx'

var scriptName = "After / Animate Bridge";
var description = "Export current comp to Animate, import Animate layers to exported comp";
var btn1text = "Export Current Comp";
var btnhelptip1 = "Export the selected Comp to an Animate timeline";
var btn2text = "Import Animate layers";
var btnhelptip2 = "Import all layers created in Animate";

// Creating project
var project = app.project;
var OutputTemplate = "PNG with Alpha";
var Pathtemplate = "Comp Folder and Name";
var activeItem = app.project.activeItem;
var animateTemplateScriptFilePath = File($.fileName).parent.parent.fsName + '/animate/Create project.jsfl';
var animateProjectScriptFilePath = '';
var animateFolderName = '';
var currentCompFolderName = '';
var imagesFolderName = '';
var theRender = null;

var config = {
  frameRate: 0,
  framesCount: 0,
  width: 0,
  height: 0,
  fileName: '',
  compName: ''
}

if (activeItem != null && activeItem instanceof CompItem) {
	
  app.beginUndoGroup("Export Comp to PNG Sequence");

	theRender = app.project.renderQueue.items.add(activeItem);
  theRender.outputModules[1].applyTemplate(OutputTemplate);
  
  createFileSystemFolders();
  createLibraryFolders();
  
  var newFile = new File(imagesFolderName + activeItem.name + '_[#####].png');
  theRender.outputModules[1].file = newFile;
  app.project.renderQueue.render();

  buildConfig();
  createAnimateScriptFile(config);
  createAnimateProject();

	app.endUndoGroup();
} else {
	alert("Select the comp you want to render first");
}

function buildConfig() {
  config.compName = activeItem.name;
  config.frameRate = activeItem.frameRate;
  config.framesCount = activeItem.duration * activeItem.frameRate;
  config.width = activeItem.width;
  config.height = activeItem.height;
  config.fileName = decodeURI(theRender.outputModules[1].file.name);
}

function createAnimateProject() {
  var scriptNormalizedPath = '';
  if (system.osName.toLowerCase().indexOf('mac') > -1) {
    scriptNormalizedPath = animateProjectScriptFilePath.replace(/( )/gi, '\\ ');
    system.callSystem('open ' + scriptNormalizedPath);
  } else {
    system.callSystem('cmd.exe /c ' + animateProjectScriptFilePath);
  }
}

function createFileSystemFolders() {
  animateFolderName = app.project.file.path + "/animate/";
  var f = new Folder(animateFolderName);
  if (!f.exists)
    f.create();
  currentCompFolderName = animateFolderName + activeItem.id + '--' + activeItem.name + "/";
  f = new Folder(currentCompFolderName);
  if (!f.exists)
    f.create();
  imagesFolderName = currentCompFolderName + "images/";
  f = new Folder(imagesFolderName);
  if (!f.exists)
    f.create();
}

function createLibraryFolders() {
  var animateFolder = findItemByName('_Animate');
  if(!animateFolder)
    app.project.items.addFolder('_Animate');
  var currentCompFolder = app.project.items.addFolder(activeItem.id + '--' + activeItem.name);
  currentCompFolder.parentFolder = animateFolder;
}

function createAnimateScriptFile(config) {
  var animateScriptFile = File(animateTemplateScriptFilePath);
  if (animateScriptFile.exists) {
    animateScriptFile.open('r');
    var scriptData = animateScriptFile.read();
    scriptData = 'var config = ' + JSON(config, 1) + ';\r\n' + scriptData;
    animateProjectScriptFilePath = currentCompFolderName + 'create Adobe Animate project.jsfl';
    saveFile(animateProjectScriptFilePath, scriptData);
  }
}

function saveFile(filePath, data) {
  var thisFile = File(filePath);
  if(!thisFile.exists) {
    thisFile = new File(filePath);
    thisFile.open("w");
    thisFile.write(data);
    thisFile.close();
  } else {
    thisFile.open("w");
    thisFile.write(data);
    thisFile.close();
  }
}

function findItemByName(name, parent) {
  if(!parent)
    parent = app.project;
  var myItem;
  for (var i = 1; i <= parent.numItems; i ++) {
      if (parent.item(i).name === name) {
        myItem = parent.item(i);
      }
  }
  return myItem;
}
