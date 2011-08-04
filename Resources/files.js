function setTextureArrayPNGError(){
  //console.log("ERROR: "+this.id + "," + this.name);
}

function setTextureArrayPNG(){
  if(textureArray[this.id] != null){
    //console.log("SETTING" + this.id + "," + this.name);
    textureArray[this.id]["width"] = this.width; textureArray[this.id]["height"] = this.height; 
    textureArray[this.id][this.name]["width"] = this.width; textureArray[this.id][this.name]["height"] = this.height;
  }
}

function specifyResourceFolder(result, arr){
  if(result == null || result[0] == null || result[0].indexOf("Resources")+"" == "-1"){
    alert("Please specifiy a proper Resources folder.");
    return false;
  }
  
  //Make the resources folder writable
  var cmd = ["chmod", "777"];
/*
  if(Titanium.platform == "win32"){
    cmd = ["C:\\Windows\\System32\\cmd.exe", "/C", "mklink"];
  }
*/
  cmd.push( Titanium.Filesystem.getResourcesDirectory() );
  var process = Titanium.Process.createProcess({ args: cmd });
  process();
  
  //Set resourcesDirectory variable and create symlink
  resourcesDirectory = result[0];
  var resourcesFolder = Titanium.Filesystem.getFile(resourcesDirectory);
  var symlinkLocation = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), "GameResources");
  resourcesFolder.createShortcut(symlinkLocation);
  
  plistFiles = findPlistFiles(result);
  maskFiles = findMaskFiles(result);
  pngFiles = findPNGFiles(result);  //Finds all PNG files without PLists that are also not masks
  
  if(plistFiles.length == 0){
    alert("Could not find PLIST files at " + resourcesDirectory + ". Please check your JSON file. It uses an absolute path.");
    return false;
  }
  
  //Add lone PNG files to the textureArray
  for(i in pngFiles){  
    var filename = pngFiles[i].replace("/Images/",""); 
    
    //Locate all PNG files (not plist files)
    if(textureArray[pngFiles[i].replace(".png",".plist")] == null){
      textureArray[pngFiles[i]] = new Array();
      textureArray[pngFiles[i]][filename] = new Array();
      
      var image = new Image(); image.name = filename; image.id = pngFiles[i];
      image.onload = setTextureArrayPNG; image.onerror = setTextureArrayPNGError;
      image.src ="GameResources" + pngFiles[i];
      
      textureArray[pngFiles[i]][filename]["x"] = 0; textureArray[pngFiles[i]][filename]["y"] = 0;
    }
  }
  
  //Set mapDataArray stuff
  arr["resourcesDirectory"] = result[0];
  try{ maskFileCount = maskFiles.length; }catch(err){ /* If this var doesn't exist, we catch the error */ }
  
  //Finally, fill the sprite window. This needs to be delayed because of the delayed call to setTextureArrayPNG which needs to precede it.
  setTimeout(function(){ fillSpriteWindow(); }, 500);
  
  return true;
}

function isHiddenFile(file){
  if( file.match(".svn") || file.match(".DS") ){
    return true;
  }else{
    return false;
  }
}

function parseXML(doc){
  var str = Titanium.Filesystem.getFile(doc).read();
  return new DOMParser().parseFromString(str,"text/xml");
}

function printNodeInfo(node){
  //For some reason, we need to use node.firstChild to get its value if that node exists, I don't know why
  var value = node.nodeValue;
  if(node.firstChild){
    value = node.firstChild.nodeValue;
  }
  try{ console.log("NODE: " + node + " TAG: " + node.tagName + " VALUE: " + value + " TYPE: " + node.nodeType); }catch(err){ console.log("NODE: " + node); }
}

function findPNGFiles(result){
  var dir = Titanium.Filesystem.getFile(result[0]);
 
  var pngFiles = findPNGFilesRec(dir, []);
  
  return pngFiles;
}

function findPNGFilesRec(dirOrFile, pngFiles){
  if(isHiddenFile(dirOrFile + "")){ return; }
  var list = null;
  try{ var list = dirOrFile.getDirectoryListing(); }catch(err){ return; }
  if(list){ //This is a directory
    for(f in list){
      findPNGFilesRec(list[f], pngFiles);
    }
  }else{  //This is a file
    if((dirOrFile + "").match(".png") && !(dirOrFile + "").match("mask")){
      var filename = (dirOrFile+"").replace(resourcesDirectory,"");
      pngFiles.push(filename);
    }
  }
  return pngFiles;
}

function findMaskFiles(result){
  var dir = Titanium.Filesystem.getFile(result[0]);
 
  var mFiles = findMaskFilesRec(dir, []);
  
  return mFiles;
}

function findMaskFilesRec(dirOrFile, mFiles){
  if(isHiddenFile(dirOrFile + "")){ return; }
  var list = null;
  try{ var list = dirOrFile.getDirectoryListing(); }catch(err){ return; }
  if(list){ //This is a directory
    for(f in list){
      findMaskFilesRec(list[f], mFiles);
    }
  }else{  //This is a file
    if((dirOrFile + "").match(".png") && (dirOrFile + "").match("mask")){ 
      var loc = (dirOrFile+"").replace(resourcesDirectory,"");
      mFiles.push(loc);
    }
  }
  return mFiles;
}

function findPlistFiles(result){  
  //NOTE: For this to work properly, the XML file must be formatted using Apple's PLIST Editor. If this is not the case,
  //open the plist file in this editor and then save it. It will format it properly.
  
  var dir = Titanium.Filesystem.getFile(resourcesDirectory);

	var plistFiles = findPlistFilesRec(dir, []);
	
	textureArray = new Array();
	for(i in plistFiles){
	  var loc = (plistFiles[i]+"").replace(resourcesDirectory,"");
	  
	  textureArray[loc] = new Array();
	  parsePlistFile(loc);
	}

/*	
  //Print out our texture array
  for(x in textureArray){
    for(y in textureArray[x]){
      if(y.match(".png")){
        for(z in textureArray[x][y]){
          alert("textureArray[" + x + "][" + y + "][" + z + "] = " + textureArray[x][y][z]);
        }
      }else{
        alert("textureArray[" + x + "][" + y + "] = " + textureArray[x][y]);
      }
    }
  }
  */
  
  return plistFiles;
}

function findPlistFilesRec(dirOrFile, plistFiles){
  if(isHiddenFile(dirOrFile + "")){ return; }
  var list = null;
  try{ var list = dirOrFile.getDirectoryListing(); }catch(err){ return; }
  if(list){ //This is a directory
    for(f in list){
      findPlistFilesRec(list[f], plistFiles);
    }
  }else{  //This is a file
    if((dirOrFile + "").match(".plist") && !(dirOrFile + "").match("Info.plist")){ 
      plistFiles.push(dirOrFile);
    }
  }
  return plistFiles;
}
	  
function parsePlistFile(plistFile){
  //  NOTE: Important!!
  //  This currently does NOT support Zwoptex PLIST files. I either need to make this support Zwoptex
  //  or I just can't use Zwoptex with the baseball game.
  var xmlDoc = parseXML(resourcesDirectory + plistFile);
  var rootPlist = xmlDoc.documentElement;// printNodeInfo(rootPlist);
  var rootDict = null;

  var isZwoptex = false;

  for(i in rootPlist.childNodes){
    if(rootPlist.childNodes[i].tagName == "dict" && rootPlist.childNodes[i].firstChild.nodeValue != null){
      rootDict = rootPlist.childNodes[i];
    }
  }
  if(!rootDict){
    alert("Could not find root dict. Please convert the PLIST using Mac PLIST editor before use.");
    return;
  }
  
  var framesDict = null;
  var textureDict = null;
  var metadataDict = null;
  var pngKeys = [];
  var pngDicts = [];

  for(i in rootDict.childNodes){
    if(rootDict.childNodes[i].tagName == "key" && rootDict.childNodes[i].firstChild.nodeValue == "frames"){
      //For some reason this is always two siblings over
      framesDict = rootDict.childNodes[i].nextSibling.nextSibling;
    }else if(rootDict.childNodes[i].tagName == "key" && rootDict.childNodes[i].firstChild.nodeValue == "texture"){
      textureDict = rootDict.childNodes[i].nextSibling.nextSibling;
    }else if(rootDict.childNodes[i].tagName == "key" && rootDict.childNodes[i].firstChild.nodeValue == "metadata"){
	    metadataDict = rootDict.childNodes[i].nextSibling.nextSibling;
	  }
  }
  
  if(metadataDict != null){ isZwoptex = true; }

  for(i in framesDict.childNodes){
    //This loops through all the frames, but, we still need to pull the dictionary out of here for size info
    if(framesDict.childNodes[i].tagName == "key"){
      //Push the name into pngKeys (ie "fielder_up_throw_04.png")
      pngKeys.push(framesDict.childNodes[i].firstChild.nodeValue + "");  
    }else if(framesDict.childNodes[i].tagName == "dict"){
      //Push the whole dict into pngDicts
      if(isZwoptex){
        var pngDict = framesDict.childNodes[i];
        var dict = new Array();
        
        for(x in pngDict.childNodes){
          if(pngDict.childNodes[x].tagName == "key"){
            //Normally we take every key and place it in pngDicts
            //This time, we need to convert one to another
            var value = pngDict.childNodes[x].firstChild.nodeValue;
            if(value == "textureRect"){
              var textureRect = pngDict.childNodes[x].nextSibling.nextSibling.firstChild.nodeValue;
              //alert("textureRect: " + textureRect);
              textureRect = textureRect.replace(/{/g,"").replace(/}/g,"").replace(/ /g,"").split(",");
              dict["x"] = parseFloat(textureRect[0]);
              dict["y"] = parseFloat(textureRect[1]);
              dict["width"] = parseFloat(textureRect[2]);
              dict["height"] = parseFloat(textureRect[3]);
              dict["originalWidth"] = parseFloat(textureRect[2]);
              dict["originalHeight"] = parseFloat(textureRect[3]);
            }else if(value == "spriteOffset"){
              var spriteOffset = pngDict.childNodes[x].nextSibling.nextSibling.firstChild.nodeValue;
              //alert("spriteOffset: " + spriteOffset);
              spriteOffset = spriteOffset.replace(/{/g,"").replace(/}/g,"").replace(/ /g,"").split(",");
              dict["offsetX"] = parseFloat(spriteOffset[0]);
              dict["offsetY"] = parseFloat(spriteOffset[1]);
            }
          }
        }
        pngDicts.push(dict);
      }else{
        pngDicts.push(framesDict.childNodes[i]);
      }
    }
  }

  if(isZwoptex){
		for(i in metadataDict.childNodes){
		  if(metadataDict.childNodes[i].tagName == "size"){
		    if(metadataDict.childNodes[i].firstChild.nodeValue == "height"){
		      var size = metadataDict.childNodes[i].nextSibling.nextSibling.firstChild.nodeValue;
		      size = size.replace("{","").replace("}","").replace(" ","").split(",");
		      textureArray[plistFile]["width"] = parseFloat(size[0]);
		      textureArray[plistFile]["height"] = parseFloat(size[1]);
		      
		      alert("Width: " + textureArray[plistFile]["width"] + " Height: " + textureArray[plistFile]["height"]);
        }
		  }
		}
  }else{
    for(i in textureDict.childNodes){
      if(textureDict.childNodes[i].tagName == "key"){
        if(textureDict.childNodes[i].firstChild.nodeValue == "height"){
          textureArray[plistFile]["height"] = textureDict.childNodes[i].nextSibling.nextSibling.firstChild.nodeValue;
        }else if(textureDict.childNodes[i].firstChild.nodeValue == "width"){
          textureArray[plistFile]["width"] = textureDict.childNodes[i].nextSibling.nextSibling.firstChild.nodeValue;
        }
      }
    }
  }
  
  //NOTE: There are as many pngKeys as there are pngDicts
  if(isZwoptex){
    for(i in pngDicts){
      textureArray[plistFile][pngKeys[i]] = pngDicts[i];
    }    
  }else{
    for(i in pngDicts){
      textureArray[plistFile][pngKeys[i]] = new Array(); //Make room for this specific texture
      for(x in pngDicts[i].childNodes){
        //Load in each attribute into the textureArray
        if(pngDicts[i].childNodes[x].tagName == "key"){
          textureArray[ plistFile ][ pngKeys[i] ][ pngDicts[i].childNodes[x].firstChild.nodeValue ] = 
            pngDicts[i].childNodes[x].nextSibling.nextSibling.firstChild.nodeValue;
        }
      }
    }        
  }
        
  return;
}

function fillSpriteWindow(){
  console.log("Grabbing sprites");
  
  var htmlString = "";
  
  var imageIds = [];

  var zoom = 50;
  zoom = zoom + "%";

  var keys = [];
  for(k in textureArray){
    keys.push(k);
  }
  keys.sort();

  for(i in keys){
    var x = keys[i];
    console.log("x in textureArray: "+x);
    
    var imageLoc = "GameResources" + x.replace(".plist",".png");
    var sheetName = x.split("/")[x.split("/").length-1] ;

    htmlString += "<span style='cursor:pointer;' onclick=\"showHide('" + sheetName + "');\">";
    htmlString += sheetName + "</span>";

    htmlString += "<div id='" + sheetName + "' style='display:none;'>";

    for(y in textureArray[x]){
      if(y != "width" && y != "height"){   
        var width = (textureArray[x][y]["width"] || "0") + "px";
        var height = (textureArray[x][y]["height"] || "0") + "px";
        var locX = "-" + (textureArray[x][y]["x"] || "0") + "px";
        var locY = "-" + (textureArray[x][y]["y"] || "0") + "px";
        //var zoom = 100.0;
        //if(parseFloat(width) > 175){ zoom = 175/parseFloat(width) * 100; }
        //var zoom = 25;
        //zoom = zoom + "%";
        
        htmlString += "<div id='" + y + "sprites' onclick=\"selectSprite(this, '" + x + "', '" + y + "');\" style=\"" + 
          "display:inline-block; " + 
          "zoom:" + zoom + "; " + 
          "background-color:rgba(200, 54, 54, 0.5);" + 
          "background-image:url('" + imageLoc + "'); " + 
          "background-repeat:no-repeat; " + 
          "background-position:" + locX + " " + locY + "; " + 
          "width:" + width + "; height:" + height + ";\"></div>";
      }
    }    
    
    htmlString += "</div><br />";
  }
  
  htmlString += "<span style='cursor:pointer;' onclick=\"showHide('maskSprites');\">Masks:</span>";
  htmlString += "<div id='maskSprites' style='display:none;'>";
  
  for(y in maskFiles){
    var imageLoc = "GameResources" + maskFiles[y];
    
    htmlString += "<img src='"+imageLoc+"' id='maskSprite_" + y + "' onclick=\"selectMask(this);\" style=\"" + 
      "display:inline-block; " + 
      "zoom:" + zoom + "; " + 
      "background-color:rgba(200, 54, 54, 0.5);" + 
      "\"/>";
  }
  htmlString += "</div>";
  
  document.getElementById('sprites').innerHTML += htmlString;  
  setInnerSize(document.getElementById('sprites'));
}