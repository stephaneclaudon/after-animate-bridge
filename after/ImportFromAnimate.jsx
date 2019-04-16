var project = app.project;
var mainAnimateFolder = findItemByName('_Animate');

for(var i = 1; i <= mainAnimateFolder.numItems; i++) {
  var currentFolderName = mainAnimateFolder.item(i).name;
  var currentFolder = mainAnimateFolder.item(i);
  var fileSystemPath = app.project.file.path + "/animate/" + currentFolderName + '/swf/';
  var currentFSFolder = new Folder(fileSystemPath);
  var files = currentFSFolder.getFiles();
  for (var j = 0; j < files.length; j ++) {
    var swfFile = File(files[j]);
    var alreadyImportedItem = findItemByName(swfFile.name, currentFolder);
    if (alreadyImportedItem) {
      alreadyImportedItem.replace(swfFile);
    } else {
      var item = app.project.importFile(new ImportOptions(swfFile));
      item.parentFolder = currentFolder;
  
      var relatedComp = findItemByID(item.parentFolder.name.split('--')[0]);
      relatedComp.layers.add(item);
    }
  }
}

function findItemByID(id) {
  id = parseInt(id);
  var myItem;
  for (var i = 1; i <= app.project.numItems; i ++) {
      if (app.project.item(i).id === id) {
        myItem = app.project.item(i);
      }
  }
  return myItem;
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