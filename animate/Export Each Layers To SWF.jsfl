fl.runScript(fl.configURI + "javascript/JSON.jsfl");
fl.outputPanel.clear();






/**
*    This script will export each layer as swf using the layer name.  
*    Any layers in a folder will be exported together using the folder name
*/

var doc = fl.getDocumentDOM();
var lyrs = doc.getTimeline().layers;
var documentFolder = 'file://' + doc.path.replace(doc.name, '');
var exportFolder = documentFolder + 'swf/';

var len = lyrs.length;
var lyr;
var originalType;
var i;

if (documentFolder)
{
    fl.outputPanel.clear();
	
	if (!FLfile.exists(exportFolder))
		FLfile.createFolder(exportFolder);

    var originalTypes = new Array();

    for (i=0; i < len; i++) 
    {
        lyr = lyrs[i];
        originalTypes[i] = lyr.layerType;
    }

    for (i=0; i < len; i++)
    {
        lyr = lyrs[i];
        if(lyr.layerType == "normal")
            lyr.layerType = "guide";
    }

    for (i=0; i < len; i++)
    {
        lyr = lyrs[i];
        originalType = originalTypes[i]
        if (originalType == "normal" && lyr.parentLayer == null && lyr.name != 'from_after_effects') 
       {
            lyr.layerType = "normal";
			fl.trace("Exporting layer: " + exportFolder + i + '--' + lyr.name+".swf");
            doc.exportSWF(exportFolder + i + '--' + lyr.name+".swf", true);
            
            lyr.layerType = "guide";
        }
        else if(originalType == "folder")
        {
            var j = i+1;
            var isChild = true;
            var childLyr;
            while(isChild == true)
            {
                childLyr = lyrs[j];

                if(childLyr != null && childLyr.parentLayer != null)
                {
                    childLyr.layerType = "normal";
                    fl.trace("    "+childLyr.name);
                }
                else
                {
                    isChild = false;
                }
                j++;
            }

			fl.trace("Exporting folder : " + exportFolder + i + '--' + lyr.name + ".swf");
            doc.exportSWF(exportFolder + i + '--' + lyr.name + ".swf", true);

            j = i + 1;
            isChild = true;
            while(isChild == true)
            {
                childLyr = lyrs[j];
                if(childLyr != null && childLyr.parentLayer != null)
                {
                    childLyr.layerType = "guide";
                }
                else
                {
                    isChild = false;
                }

                j++;
            }
        }
    }

    for (i=0; i < len; i++)
    {
        lyr = lyrs[i];
        lyr.layerType = originalTypes[i];
    }
}

doc.save();



















