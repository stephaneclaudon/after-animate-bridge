#include 'json.jsx';

(function ALL(thisObj) {
  var scriptName = "After / Animate Bridge";
  var description = "Export current comp to Animate, import Animate layers to exported comp";
  var btn1text = "Export Current Comp";
  var btnhelptip1 = "Export the selected Comp to an Animate timeline";
  var btn2text = "Import Animate layers";
  var btnhelptip2 = "Import all layers created in Animate";
  var scriptNotRun = "Fail to run the script, please try again!";
  var noCompSelected = "Select the comp you want to export first.";
  var animateFolderName = '_Animate';


  // Creating project
  var project = app.project;
  var OutputTemplate = "PNG with Alpha";
  var activeItem = project.activeItem;
  var animateTemplateScriptFilePath = File($.fileName).parent.parent.fsName + '/animate/Create project.jsfl';
  var animateProjectScriptFilePath = '';
  var animateFolderPath = '';
  var currentCompFolderName = '';
  var imagesFolderName = '';
  var theRender = null;

  var compConfig = {
    frameRate: 0,
    framesCount: 0,
    width: 0,
    height: 0,
    fileName: '',
    compName: ''
  }


  var drawUI = UI(thisObj);
  if (drawUI instanceof Window) {
    drawUI.center();
    drawUI.show();
  } else {
    drawUI.layout.layout(true);
  }

  function UI(thisObj) {
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined);
    if (win != null) {
      var dcp = win.add("statictext", undefined, description, { readonly: 0, noecho: 0, borderless: 0, multiline: 1, enterKeySignalsOnChange: 0 });
      var grp = win.add("group");
      var btn1 = grp.add("button", undefined, btn1text);
      btn1.helpTip = btnhelptip1;
      var btn2 = grp.add("button", undefined, btn2text);
      btn2.helpTip = btnhelptip2;
      var os = $.os.toLowerCase().indexOf('mac') >= 0 ? "mac" : "win";

      btn1.onClick = exportCompToAnimate;
      btn2.onClick = importFromAnimate;

    } else {
      alert(scriptNotRun);
    }
    return win;
  }

  function importFromAnimate() {
    var mainAnimateFolder = findItemByName(animateFolderName);
    
    if (mainAnimateFolder) {
      for (var i = 1; i <= mainAnimateFolder.numItems; i++) {
        var currentFolderName = mainAnimateFolder.item(i).name;
        var currentFolder = mainAnimateFolder.item(i);
        var fileSystemPath = project.file.path + "/animate/" + currentFolderName + '/swf/';
        var currentFSFolder = new Folder(fileSystemPath);
        var currentComp = findItemByID(currentFolderName.split('--')[0]);
        var files = currentFSFolder.getFiles();

        for (var j = 0; j < files.length; j++) {
          var swfFile = File(files[j]);
          if(swfFile.name.charAt(0) !== '.') {
            var alreadyImportedItem = findItemByName(swfFile.name, currentFolder);
            if (alreadyImportedItem) {
              alreadyImportedItem.replace(swfFile);
            } else {
              var item = project.importFile(new ImportOptions(swfFile));
              item.parentFolder = currentFolder;
              currentComp.layers.add(item);
            }
          }
        }

      reorderLayersInComp(currentComp);
      }
    } else {
      rebuildLibraryFromFileSystem();
    }
  }

  function reorderLayersInComp(relatedComp) {
    for (var i = 1; i <= relatedComp.numItems; i++) {
      
    }
  }


  function exportCompToAnimate() {
    if (activeItem != null && activeItem instanceof CompItem) {
      app.beginUndoGroup("Export Comp to PNG Sequence");

      theRender = project.renderQueue.items.add(activeItem);
      theRender.outputModules[1].applyTemplate(OutputTemplate);

      createFileSystemFolders();
      createLibraryFolders();

      var newFile = new File(imagesFolderName + activeItem.name + '_[#####].png');
      theRender.outputModules[1].file = newFile;
      project.renderQueue.render();

      buildConfig();
      createAnimateScriptFile(compConfig);
      createAnimateProject();

      app.endUndoGroup();
    } else {
      alert(noCompSelected);
    }
  }

  function rebuildLibraryFromFileSystem() {
    var animateFolder = project.items.addFolder(animateFolderName);
    var fileSystemPath = project.file.path + "/animate/";
    var animateFSFolder = new Folder(fileSystemPath);
    var folders = animateFSFolder.getFiles();
    for (var j = 0; j < folders.length; j++) {
      var compFolder =  new Folder(folders[j]);
      var relatedComp = findItemByID(compFolder.name.split('--')[0]);
      if (relatedComp instanceof CompItem) {
        var currentCompFolder = project.items.addFolder(compFolder.displayName);
        currentCompFolder.parentFolder = animateFolder;
      }
    }
    importFromAnimate();
  }

  function buildConfig() {
    compConfig.compName = activeItem.name;
    compConfig.frameRate = activeItem.frameRate;
    compConfig.framesCount = activeItem.duration * activeItem.frameRate;
    compConfig.width = activeItem.width;
    compConfig.height = activeItem.height;
    compConfig.fileName = decodeURI(theRender.outputModules[1].file.name);
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
    animateFolderPath = project.file.path + "/animate/";
    var f = new Folder(animateFolderPath);
    if (!f.exists)
      f.create();
    currentCompFolderName = animateFolderPath + activeItem.id + '--' + activeItem.name + "/";
    f = new Folder(currentCompFolderName);
    if (!f.exists)
      f.create();
    imagesFolderName = currentCompFolderName + "images/";
    f = new Folder(imagesFolderName);
    if (!f.exists)
      f.create();
  }

  function createLibraryFolders() {
    var animateFolder = findItemByName(animateFolderName);
    if (!animateFolder)
      animateFolder = project.items.addFolder(animateFolderName);
    var currentCompFolder = project.items.addFolder(activeItem.id + '--' + activeItem.name);
    currentCompFolder.parentFolder = animateFolder;
  }

  function createAnimateScriptFile(compConfig) {
    var animateScriptFile = File(animateTemplateScriptFilePath);
    if (animateScriptFile.exists) {
      animateScriptFile.open('r');
      var scriptData = animateScriptFile.read();
      scriptData = 'var compConfig = ' + JSON(compConfig, 1) + ';\r\n' + scriptData;
      animateProjectScriptFilePath = currentCompFolderName + 'create Adobe Animate project.jsfl';
      saveFile(animateProjectScriptFilePath, scriptData);
    }
  }

  function saveFile(filePath, data) {
    var thisFile = File(filePath);
    if (!thisFile.exists) {
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


  function findItemByID(id) {
    id = parseInt(id);
    var myItem;
    for (var i = 1; i <= project.numItems; i++) {
      if (project.item(i).id === id) {
        myItem = project.item(i);
      }
    }
    return myItem;
  }

  function findItemByName(name, parent) {
    if (!parent)
      parent = project;
    var myItem = null;
    for (var i = 1; i <= parent.numItems; i++) {
      if (parent.item(i).name === name) {
        myItem = parent.item(i);
      }
    }
    return myItem;
  }
})(this)