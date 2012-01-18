function getMapMouseX(e){
  var mouseX = 0;
  if(e == null){
    return mouseX;
  }else{
    mouseX = parseInt( (e.clientX-parseInt($('#map_window').css("left"))+$("#map_window_inner").attr("scrollLeft")-10)*(100/zoom) + window.pageXOffset);
  }
  if(shiftPressed){
    mouseX -= mouseX%10;
  }
  return mouseX;
}

function getMapMouseY(e){
  var mouseY = 0;
  if(e == null){
    return mouseY;
  }else{
    mouseY = parseInt( (e.clientY-parseInt($('#map_window').css("top"))+$("#map_window_inner").attr("scrollTop")-40)*(100/zoom) + window.pageYOffset);  
  }
  if(shiftPressed){
    mouseY -= mouseY%10;
  }
  return mouseY;
}

function setCanvasSize(){
  document.getElementById('map').style.width = document.getElementById('canvasWidth').value + "px";
  document.getElementById('map').style.height = document.getElementById('canvasHeight').value + "px";
  mapDataArray["canvasWidth"] = parseFloat( document.getElementById('canvasWidth').value );
  mapDataArray["canvasHeight"] = parseFloat( document.getElementById('canvasHeight').value );
}

function setZoom(zoom){
	$("#map").css("zoom",zoom + "%");
	document.getElementById('mapZoom').innerHTML = zoom + "%";
	$(".spriteNode").draggable("option", "scrollSensitivity", defaultScrollSensitivity/(zoom/100));
}

function zoomIn(){
  var mapWindowInner = document.getElementById('map_window_inner');
	var map = document.getElementById('map');
	
	var scrollableWidth = ( parseFloat(map.style.width) - parseFloat(mapWindowInner.style.width) ) * (zoom/100);
	var scrollableHeight = ( parseFloat(map.style.height) - parseFloat(mapWindowInner.style.height) ) * (zoom/100);
	var percentScrolledX = parseFloat(mapWindowInner.scrollLeft) / scrollableWidth;
	var percentScrolledY = parseFloat(mapWindowInner.scrollTop) / scrollableHeight;
   
	zoom *= 1.25;
	setZoom(zoom);
	
	scrollableWidth = ( parseFloat(map.style.width) - parseFloat(mapWindowInner.style.width) ) * (zoom/100);
	scrollableHeight = ( parseFloat(map.style.height) - parseFloat(mapWindowInner.style.height) ) * (zoom/100);
	
	var newScrollLeft = percentScrolledX * scrollableWidth + (parseFloat(mapWindowInner.style.width))/2;
	var newScrollTop = percentScrolledY * scrollableHeight + (parseFloat(mapWindowInner.style.height))/2;

	mapWindowInner.scrollLeft = newScrollLeft;
	mapWindowInner.scrollTop = newScrollTop;
}

function zoomOut(){
  var mapWindowInner = document.getElementById('map_window_inner');
	var map = document.getElementById('map');
	
	var scrollableWidth = ( parseFloat(map.style.width) - parseFloat(mapWindowInner.style.width) ) * (zoom/100);
	var scrollableHeight = ( parseFloat(map.style.height) - parseFloat(mapWindowInner.style.height) ) * (zoom/100);
	var percentScrolledX = parseFloat(mapWindowInner.scrollLeft) / scrollableWidth;
	var percentScrolledY = parseFloat(mapWindowInner.scrollTop) / scrollableHeight;
  
	zoom /= 1.25;
	setZoom(zoom);
	
	scrollableWidth = ( parseFloat(map.style.width) - parseFloat(mapWindowInner.style.width) ) * (zoom/100);
	scrollableHeight = ( parseFloat(map.style.height) - parseFloat(mapWindowInner.style.height) ) * (zoom/100);
	
	var newScrollLeft = percentScrolledX * scrollableWidth - (parseFloat(mapWindowInner.style.width))/4;
	var newScrollTop = percentScrolledY * scrollableHeight - (parseFloat(mapWindowInner.style.height))/4;
	
	mapWindowInner.scrollLeft = newScrollLeft;
	mapWindowInner.scrollTop = newScrollTop;
}

function nudgeMapObject(x,y){
  if(selectedTool == Tools.drawMask){  
    var mod = 10;
    
    var scrollLeft = parseFloat( $("#map_window_inner").attr("scrollLeft") );
    var scrollTop = parseFloat( $("#map_window_inner").attr("scrollTop") );
    scrollLeft += x*mod;
    scrollTop += y*mod;

    $("#map_window_inner").attr("scrollLeft", scrollLeft);
    $("#map_window_inner").attr("scrollTop", scrollTop);
    
    return true;
  }else if(selectedMapObject != null){
    var mod = 1;
    
    $(selectedMapObject).css("left",  parseFloat($(selectedMapObject).css("left")) + x*mod );
    $(selectedMapObject).css("top",  parseFloat($(selectedMapObject).css("top")) + y*mod );
    setMapObjectPositionInfo();
    return false;
  }else{
    return true;
  }
}

function moveObject(obj, left, top){
  if(obj == null){ 
    if(selectedMapObject != null){
      obj = selectedMapObject;
    }else{
      return;
    }
  }
  
  $(obj).css("left",  (parseFloat($(obj).css("left")) + left)+"px" );
  $(obj).css("top",  (parseFloat($(obj).css("top")) + top)+"px" );
  
  if(obj == selectedMapObject){ setMapObjectPositionInfo(); }
}

function flipImage(dir, selected){
  console.log("flipImage("+dir+","+selected+")");
  
  if(selected == null){ selected = selectedMapObject; }
  
  if(selected == null || !$(selected).hasClass('spriteNode')){
    alert("Please select a map sprite before flipping."); return;
  }
  var obj = mapDataArray["mapNodes"][selected.id];
  
  //Wash and re-create the canvas of either the Sprite or TiledSprite
  var width = obj["width"];
  var height = obj["height"];
  var nodeWidth = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["width"]) || 0;
  var nodeHeight = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["height"]) || 0;
  var textureWidth = parseFloat(textureArray[obj["selectedSpriteX"]]["width"]) || 0;
  var textureHeight = parseFloat(textureArray[obj["selectedSpriteX"]]["height"]) || 0;
  var locX = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["x"]) || 0;
  var locY = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["y"]) || 0;
    
  var sheetLoc = obj["selectedSpriteX"].replace(resourcesDirectory,"").replace(".plist",".png");
  var imageLoc = "GameResources" + sheetLoc;
  var sheetName = sheetLoc.replace("/Images/","");
  
  var context = selected.getContext('2d');
  
  var image = new Image();
  image.src = imageLoc;
    
  if( obj["type"] == "sprite" ){
    image.onload = function(){
      if(dir == "x"){
  			context.translate(nodeWidth,0);
  			context.scale(-1,1);
  		}else{
  			context.translate(0,nodeHeight);
  			context.scale(1,-1);  		  
  		}
      //Wash me
      context.clearRect(0,0,selected.width,selected.height);  
      context.globalCompositeOperation = 'source-over';
      context.drawImage(image,locX,locY,nodeWidth,nodeHeight,0,0,nodeWidth,nodeHeight);
    }      
  }else if( obj["type"] == "tiledSprite" ){  
  	image.onload = function(){
      if(dir == "x"){
  			context.translate(nodeWidth,0);
  			context.scale(-1,1);
  		}else{
  			context.translate(0,nodeHeight);
  			context.scale(1,-1);  		  
  		}
      //Wash me
      context.clearRect(0,0,selected.width,selected.height);  
      context.globalCompositeOperation = 'source-over';
  		for (var x=0;x<width/nodeWidth;x++){  
       	for (var y=0;y<height/nodeHeight;y++){  
  				context.drawImage(image,locX,locY,nodeWidth,nodeHeight,x*nodeWidth,y*nodeHeight,nodeWidth,nodeHeight);
       	}  
     	}  
  	};
  }
  
  //Create any masks
  if(obj["masks"] != null){
    for(x in obj["masks"]){
//      createMaskFromFile( selected.id, obj["masks"][x]["originX"], obj["masks"][x]["originY"], obj["masks"][x]["width"], 
//        obj["masks"][x]["height"], obj["masks"][x]["imagePath"] ); 
      createMask( selected.id, obj["masks"][x]["originX"], obj["masks"][x]["originY"], obj["masks"][x]["width"], 
        obj["masks"][x]["height"], obj["masks"][x]["pointsX"], obj["masks"][x]["pointsY"] ); 
    }
  }
  
  //Add meta data
  if(dir == 'x'){
    if(obj["flipX"] == 'N'){ obj["flipX"] = 'Y'; }
    else{ obj["flipX"] = 'N'; } //This is the default state if obj["flipX"]
  }else{
    if(obj["flipY"] == 'N'){ obj["flipY"] = 'Y'; }
    else{ obj["flipY"] = 'N'; } //This is the default state if obj["flipY"]
  }
}

/* Keyboard handler */

document.onkeydown = function(e){
  var e=window.event || e;
  //alert(e.which); 
  if(e.which+"" == "16"){
    shiftPressed = true;
    $(selectedMapObject).draggable("option","grid",[gridSize,gridSize]);
  }else if(e.which+"" == "91"){
    controlPressed = true;
  } 
}

document.onkeyup = function(e){
  var e=window.event || e;
  //alert(e.which); 
  if(e.which+"" == "16"){
    shiftPressed = false;
    $(selectedMapObject).draggable("option","grid",[1,1]);
  }else if(e.which+"" == "91"){
    controlPressed = false;
  }
}

document.onkeypress = function(e){
  var e=window.event || e;
  //alert(e.charCode + "=" + e.which);
  if(e.which+"" == "63272"){
    editDeleteSelected(null, false);
  }else if(e.which+"" == "27"){
    selectMapObject(null, false);
  }else if(e.which+"" == "63232"){
    return nudgeMapObject(0, -1); //This should return false if successful
  }else if(e.which+"" == "63233"){
    return nudgeMapObject(0, 1);
  }else if(e.which+"" == "63234"){
    return nudgeMapObject(-1, 0);
  }else if(e.which+"" == "63235"){
    return nudgeMapObject(1, 0);
  }else if(e.which+"" == "122"){
    if(controlPressed){ editUndo(); }
  }else if(e.which+"" == "121"){
    if(controlPressed){ editRedo(); }
  }
  /*
  if( parseFloat(e.charCode+"") >= 49 && parseFloat(e.charCode+"") <= 55 ){
    toolsSelectTool( parseFloat(e.charCode+"")-49 );
  }*/
}

function addMetaField(metaKey,metaValue){
  if(selectedMapObject == null){
    alert("Please select a map object before adding or removing meta fields.");
    return;
  }
  
  var div = document.createElement("div");  
  var divider = document.createElement("span");
  var fieldKey = document.createElement("input");
  var fieldValue = document.createElement("input");
  var removeButton = document.createElement("button");
  
  fieldKey.setAttribute("type","text");
  fieldKey.setAttribute("class","metaKey");
  fieldKey.value = metaKey;
  fieldValue.setAttribute("type","text");
  fieldValue.setAttribute("class","metaValue");  
  fieldValue.value = metaValue;
  
  divider.innerHTML = "=";
  
  removeButton.setAttribute("onclick","removeMetaField(this.parentNode);");
  removeButton.innerHTML = "-";
  
  div.appendChild(fieldKey);
  div.appendChild(divider);
  div.appendChild(fieldValue);
  div.appendChild(removeButton);
  
  document.getElementById('metaFields').appendChild(div);
  numberOfMetaFields += 1;
}

function removeMetaField(div){
  if(selectedMapObject == null){
    alert("Please select a map object before adding or removing meta fields.");
    return;
  }

  div.parentNode.removeChild(div);
     
  numberOfMetaFields -= 1;
}

function clearMetaFields(){
  document.getElementById("metaFields").innerHTML = "";
  numberOfMetaFields = 0;
}

function setObjectPosSizeZ(){
  try{
  
  var obj = null;
  var type = "map";
  obj = selectedMapObject;
  
  if(obj == null){
    alert("Please select a map object.");
    return;
  }
  
  var oldX = obj.style.left; var oldY = obj.style.top;
  var newX = oldX; var newY = oldY;
  var x = document.getElementById('mapObjectPosXInput').value; var y = document.getElementById('mapObjectPosYInput').value;
  var oldWidth = obj.style.width; var oldHeight = obj.style.height;
  var newWidth = document.getElementById('mapObjectWidthInput').value; var newHeight = document.getElementById('mapObjectHeightInput').value;
  var oldZ = obj.style.zIndex;
  var newZ = document.getElementById('mapObjectZInput').value;
  
  var changePos = false;
  if(x != "" && parseFloat(x)+"" != "NaN"){ 
    newX = x+"px";
    changePos = true;
  }
  if(y != "" && parseFloat(y)+"" != "NaN"){ 
    newY = y+"px";
    changePos = true;
  }
  
  var changeSize = false;
  if(newWidth != "" && parseFloat(newWidth)+"" != "NaN"){
    changeSize = true;
  }else{
    newWidth = oldWidth;
  }
  
  if(newHeight != "" && parseFloat(newHeight)+"" != "NaN"){
    changeSize = true;
  }else{
    newHeight = oldHeight;
  }
  
  var changeZ = false;
  if(newZ != "" && parseFloat(newZ)+"" != "NaN"){
    changeZ = true;
  }else{
    newZ = oldZ;
  }
  
  //Finally, apply everything. First push our undo onto the stack, then do our action.
  undoStack.push( function(){ 
    if(changePos){
      obj.style.left = oldX; obj.style.top = oldY;
    }
    if(changeZ){
      obj.style.zIndex = oldZ;
    }
    if(changeSize && type == "map" && mapDataArray["mapNodes"][selectedMapObject.id]["type"] == "tiledSprite"){
      mapDataArray["mapNodes"][selectedMapObject.id]["width"] = oldWidth;
      mapDataArray["mapNodes"][selectedMapObject.id]["height"] = oldHeight;
      createObjectWithMapNode(mapDataArray["mapNodes"][selectedMapObject.id], null);
      editDeleteSelected(null, false);
    }
  } );
  
  //Apply our changes
  if(changePos){
    obj.style.left = x+"px"; obj.style.top = y+"px";
    if(type == "map"){ setMapObjectPositionInfo(); }
    else if(type == "mask"){ setMaskObjectPositionInfo(); }
  }
  
  if(changeZ){
    mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = newZ; 
    obj.style.zIndex = newZ;
  }
  
  if(changeSize && type == "map" && mapDataArray["mapNodes"][selectedMapObject.id]["type"] == "tiledSprite"){
    mapDataArray["mapNodes"][selectedMapObject.id]["width"] = newWidth;
    mapDataArray["mapNodes"][selectedMapObject.id]["height"] = newHeight;
    //Hack (to fix the bug here where Move Camera doesn't show redrawn tiled sprites)
    //mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = parseInt(mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"]) + 20000;
    createObjectWithMapNode(mapDataArray["mapNodes"][selectedMapObject.id], null);
    editDeleteSelected(null, false);
  }
  
}catch(err){ console.log(err); }
}

function setMapObjectMetaInfo(){  
  mapDataArray["mapNodes"][selectedMapObject.id]["meta"] = {}; //Clear it out initially  
  
  var kids = document.getElementById('metaFields').childNodes;
  for(x in kids){
    var key = "";
    var value = "";
    for(y in kids[x].childNodes){
      try{
        var obj = kids[x].childNodes[y];
        if( $(obj).hasClass("metaKey") ){
          key = obj.value;
        }else if( $(obj).hasClass("metaValue") ){
          value = obj.value;
        }
      }catch(err){ console.log("obj: "+obj+", "+err); }
    }
    if(key != "" && value != ""){
      mapDataArray["mapNodes"][selectedMapObject.id]["meta"][key] = value;
    }
  }
}

function setMapObjectPositionInfo(obj){
  if(obj == null){
    obj = selectedMapObject;
  }
    
  document.getElementById('mapObjectPosition').innerHTML = parseFloat(obj.style.left) + "," + parseFloat(obj.style.top);
  
  console.log("Setting drawnLines");
  
  //We set these upon saving
  console.log("originX: "+mapDataArray["mapNodes"][obj.id]["originX"]+
    "originY: "+mapDataArray["mapNodes"][obj.id]["originY"]+
    "left: "+document.getElementById(obj.id).style.left+
    "top: "+document.getElementById(obj.id).style.top);
  
  if(mapDataArray["mapNodes"][obj.id]["drawnLines"] != null){
    for(j in mapDataArray["mapNodes"][obj.id]["drawnLines"]){
      var line = mapDataArray["mapNodes"][obj.id]["drawnLines"][j];
      console.log("fromX: "+line["fromX"]+"fromY: "+line["fromY"]+"toX: "+line["toX"]+"toY: "+line["toY"]);

      line["fromX"] +=  parseFloat( document.getElementById(obj.id).style.left ) - parseFloat( mapDataArray["mapNodes"][obj.id]["originX"] );
      line["fromY"] +=  parseFloat( document.getElementById(obj.id).style.top ) - parseFloat( mapDataArray["mapNodes"][obj.id]["originY"] );
      line["toX"] +=  parseFloat( document.getElementById(obj.id).style.left ) - parseFloat( mapDataArray["mapNodes"][obj.id]["originX"] );
      line["toY"] +=  parseFloat( document.getElementById(obj.id).style.top ) - parseFloat( mapDataArray["mapNodes"][obj.id]["originY"] );
    }   
  }

  var originX = parseFloat(obj.style.left); var originY = parseFloat(obj.style.top);
  if(mapDataArray["mapNodes"][obj.id]["type"] == "point"){
    originX += 16; originY += 16;
  }
  mapDataArray["mapNodes"][obj.id]["originX"] = originX;
  mapDataArray["mapNodes"][obj.id]["originY"] = originY;
  
  /*
  var masks = mapDataArray["mapNodes"][obj.id]["masks"];
  for(i in masks){
    masks[i][
  */
}

//Sets the positional information of the mask
function setMaskObjectPositionInfo(){
  document.getElementById('mapObjectPosition').innerHTML = parseFloat(selectedMaskObject.style.left) + "," + parseFloat(selectedMaskObject.style.top);
  document.getElementById('mapObjectZIndex').innerHTML = ""; document.getElementById('mapObjectSize').innerHTML = "";
}

function fileNewMap(){
  
}
function fileOpenMap(){
  var options = {
	  title: "Open map file...",
		multiple:false,
		types:['json'],
		typesDescription: 'Map Files',
		path: resourcesDirectory
	};
  
	Titanium.UI.openFileChooserDialog(openMap, options);
}
function fileSaveMap(){
  var options = {
    filename: "myMap.json",
    title: "Save file as...",
    types: ['json'],
    typesDescription: "Map files",
    path: resourcesDirectory
  };
  
  Titanium.UI.openSaveAsDialog(saveMap, options);
}
function fileCloseMap(){
  closeMap();
}
function fileQuit(){
  if (confirm("Are you sure you want to quit?")) {
    Titanium.App.exit();
  }
}
function editUndo(){
  if(undoStack.length < 1){
    return;
  }
  
  var s = selectedTool;
  toolsSelectTool(null);
  
  var func = undoStack.pop();
  func();
  redoStack.push(func);
  
  toolsSelectTool(s);
}
function editRedo(){
  if(redoStack.length < 1){
    return;
  }  
  
  var s = selectedTool;
  toolsSelectTool(null);
  
  var func = redoStack.pop();
  func();
  undoStack.push(func);
  
  toolsSelectTool(s);
}
function editDeleteSelected(objectToDelete, override){
  if(objectToDelete == null){
    if(selectedTool == Tools.spriteSelector || selectedTool == Tools.shapeSelector){
      objectToDelete = selectedMapObject;
    }else if(!override){
      return; //You did not use a "selectable" tool.
    }
  }
    
  var mapObjects = document.getElementById('map').childNodes;
  var childToRemoveNum = null;
  for (i=0; i < mapObjects.length; i++) {
    if(mapObjects[i].id ==  objectToDelete.id){
      childToRemoveNum = i;
    }
  }

  if(childToRemoveNum != null){
    var node = mapDataArray["mapNodes"][objectToDelete.id];
    undoStack.push( function(){ createObjectWithMapNode(node, null); } );
    
    mapDataArray["mapNodes"][objectToDelete.id] = {}; //Remove from data  
    selectMapObject(null, false);
    document.getElementById('map').removeChild(mapObjects[childToRemoveNum]); //Remove from canvas
  }
}
function editCopySelected(){

}
function editPasteSelected(){
  
}
function editBringToFront(){
  var zIndex = parseFloat( $(selectedMapObject).css("zIndex") );
  var isSprite = true;
  if( $(selectedMapObject).hasClass("shapeNode") ){ isSprite = false; }
  
  if(isSprite){
    $(selectedMapObject).css("zIndex", spriteHighestZ+1);
    mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = spriteHighestZ+1;
  }else if(!isSprite){
    $(selectedMapObject).css("zIndex", shapeHighestZ+1);
    mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = shapeHighestZ+1;
  }
  document.getElementById('mapObjectZIndex').innerHTML = selectedMapObject.style.zIndex;  
}
function editBringForward(){
  var zIndex = parseFloat( $(selectedMapObject).css("zIndex") );
  var isSprite = true;
  if( $(selectedMapObject).hasClass("shapeNode") ){ isSprite = false; }
  
  if(isSprite && (zIndex+1) < 30000){
    $(selectedMapObject).css("zIndex", zIndex+1);
    if(zIndex+1 > spriteHighestZ){ spriteHighestZ = zIndex+1; }
  }else if(!isSprite && (zIndex+1) < 40000){
    $(selectedMapObject).css("zIndex", zIndex+1);
    if(zIndex+1 > shapeHighestZ){ shapeHighestZ = zIndex+1; }
  }
  mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = zIndex+1;
  document.getElementById('mapObjectZIndex').innerHTML = selectedMapObject.style.zIndex;  
}
function editSendBackward(){
  var zIndex = parseFloat( $(selectedMapObject).css("zIndex") );
  var isSprite = true;
  if( $(selectedMapObject).hasClass("shapeNode") ){ isSprite = false; }
  
  if(isSprite && (zIndex-1) >= 20000){
    $(selectedMapObject).css("zIndex", zIndex-1);
    if(zIndex-1 < spriteLowestZ){ spriteLowestZ = zIndex-1; }
  }else if(!isSprite && (zIndex-1) >= 30000){
    $(selectedMapObject).css("zIndex", zIndex-1);
    if(zIndex-1 < shapeLowestZ){ shapeLowestZ = zIndex-1; }
  }
  mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = zIndex-1;
  document.getElementById('mapObjectZIndex').innerHTML = selectedMapObject.style.zIndex;  
}
function editSendToBack(){
  var zIndex = parseFloat( $(selectedMapObject).css("zIndex") );
  var isSprite = true;
  if( $(selectedMapObject).hasClass("shapeNode") ){ isSprite = false; }
  
  if(isSprite){
    $(selectedMapObject).css("zIndex", spriteLowestZ-1);
    mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = spriteLowestZ-1;
  }else if(!isSprite){
    $(selectedMapObject).css("zIndex", shapeLowestZ-1);
    mapDataArray["mapNodes"][selectedMapObject.id]["zIndex"] = shapeLowestZ-1;
  }
  document.getElementById('mapObjectZIndex').innerHTML = selectedMapObject.style.zIndex;  
}
function viewShowHideGrid(){
  showGrid = !showGrid;

  if(showGrid){
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(0).setLabel("Hide Grid");
  }else{
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(0).setLabel("Show Grid");
  }
}
function viewShowHideShapes(){
  showShapes = !showShapes;
  
  if(showShapes){
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(1).setLabel("Hide Shapes");
  }else{
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(1).setLabel("Show Shapes");
  }
}
function viewShowHideSprites(){
  showSprites = !showSprites;
  
  if(showSprites){
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(2).setLabel("Hide Sprites");
  }else{
    Titanium.UI.currentWindow.menu.getItemAt(2).getSubmenu().getItemAt(2).setLabel("Show Sprites");
  }
}
function mapEditMapProperties(){
  
}
function toolsSelectTool(num){
  if(selectedTool == num){
    return;
  }
  var lastSelectedTool = selectedTool;
  var nodes = document.getElementById('tools').childNodes;
  var count = 1;
  for(i in nodes){
    if(nodes[i]+"" == "[object HTMLDivElement]"){
      if(parseFloat(num) == count){
        nodes[i].style.background = '#f66';
      }else{
        nodes[i].style.background = '#fff';
      }
      count += 1;
    }
  }
  selectedTool = num;
  
  //Process confirmation logic
  if(selectedTool == Tools.spriteSelector){
    $('#map_window_inner').css("cursor","auto");
    $(".spriteNode").draggable( "option", "disabled", false );
    $(".spriteNode").css("background-color","rgba(255,200,200,0.1)");    
  	$(".spriteNode").each(function(index) {
  		$(this).css("z-index", parseFloat($(this).css("z-index"))+20000 + ""); 
  	});
  }else if(selectedTool == Tools.shapeSelector){
    $('#map_window_inner').css("cursor","auto");
    $(".shapeNode").draggable( "option", "disabled", false );  
    $(".shapeNode").css("background-color","rgba(255,200,200,0.1)");   
  	$(".shapeNode").each(function(index) {
  		$(this).css("z-index", parseFloat($(this).css("z-index"))+20000 + ""); 
  	}); 
  }else if(selectedTool == Tools.moveCamera){
    $('#map_window_inner').css("cursor","move");
  }else if(selectedTool == Tools.createLine){
    $('#map_window_inner').css("cursor","crosshair");
  }else if(selectedTool == Tools.createPolygon){
    $('#map_window_inner').css("cursor","crosshair");
  }
  
  //Process negation logic
  if(selectedTool != Tools.spriteSelector){
    $(".spriteNode").draggable( "option", "disabled", true );
    $(".spriteNode").css("background-color","rgba(0,0,0,0)");    
  }
  if(selectedTool != Tools.shapeSelector){
    $(".shapeNode").draggable( "option", "disabled", true ); 
    $(".shapeNode").css("background-color","rgba(0,0,0,0)");  
  }
  
  //Process specific logic
  if(lastSelectedTool == Tools.spriteSelector){
  	$(".spriteNode").each(function(index) {
  		$(this).css("z-index", parseFloat($(this).css("z-index"))-20000 + ""); 
  	});
  }
  if(lastSelectedTool == Tools.shapeSelector){
  	$(".shapeNode").each(function(index) {
  		$(this).css("z-index", parseFloat($(this).css("z-index"))-20000 + ""); 
  	});
  }
  
  //This causes too much slowdown
/*
  if(selectedTool == Tools.spriteSelector || selectedTool == Tools.shapeSelector){
    $(".shapeNode").css("opacity","0.9");
    $(".shapeNode").css("filter","Alpha(Opacity=90)"); 
    $(".spriteNode").css("opacity","0.9");
    $(".spriteNode").css("filter","Alpha(Opacity=90)"); 
  }else{
    $(".shapeNode").css("opacity","1");
    $(".shapeNode").css("filter","Alpha(Opacity=100)"); 
    $(".spriteNode").css("opacity","1");
    $(".spriteNode").css("filter","Alpha(Opacity=100)"); 
  }
*/  
  if(selectedTool != Tools.drawMask){
    selectMapObject(null, false);
  }
}
function editorsRoster(){
  var rosterWindow = Titanium.UI.createWindow({title:"Roster Editor", x:75, y:50, width:1300, height:850, fullscreen:false, resizable:true, url:"app://roster.html"});
  rosterWindow.open();
}
function editorsAnimation(){
  var animWindow = Titanium.UI.createWindow({title:"Animation Editor", x:100, y:75, width:1300, height:850, fullscreen:false, resizable:true, url:"app://anim.html"});
  animWindow.open();
}
function resourcesSpecifyResourceFolder(){
  Titanium.UI.openFolderChooserDialog(function(result){ specifyResourceFolder(result, mapDataArray); });
  setCanvasSize();
}
function resourcesReloadResources(){
  
}

/* Callbacks */
function saveMap(result){
  var nodes = mapDataArray["mapNodes"];

  //Process PLIST and PNG files
  var plistFilesUsed = {};
  var pngFilesUsed = {};
  
  mapDataArray["plistFiles"] = [];
  mapDataArray["pngFiles"] = [];
  
  for(i in nodes){
    if( nodes[i]["type"] == "sprite" || nodes[i]["type"] == "tiledSprite" ){
      var x = nodes[i]["selectedSpriteX"].split("/").pop();
      var y = nodes[i]["selectedSpriteY"];
      
      if( x.match(".plist") ){ plistFilesUsed[x] = true; }
      if( y.match(".plist") ){ plistFilesUsed[y] = true; }
      if( x.match(".png") ){ pngFilesUsed[x] = true; }
      if( y.match(".png") ){ pngFilesUsed[y] = true; }
    }
  }

  for(i in plistFilesUsed){
    mapDataArray["plistFiles"].push(i);
  }
  
  for(i in pngFilesUsed){
    mapDataArray["pngFiles"].push(i);
  }  
  
  //Process originX and originY (and drawnLines positions)
  for(i in nodes){
    if(document.getElementById(i) != null){
      setMapObjectPositionInfo(document.getElementById(i));
      
      /*
      console.log(i);
      console.log("Switching "+nodes[i]["originX"]+" with "+document.getElementById(i).style.left+" and "+nodes[i]["originY"]+" with "+document.getElementById(i).style.top);

      if(nodes[i]["drawnLines"] != null){
        for(j in nodes[i]["drawnLines"]){
          var line = nodes[i]["drawnLines"][j];
          
          line["fromX"] +=  parseFloat( document.getElementById(i).style.left ) - parseFloat( nodes[i]["originX"] );
          line["fromY"] +=  parseFloat( document.getElementById(i).style.top ) - parseFloat( nodes[i]["originY"] );
          line["toX"] +=  parseFloat( document.getElementById(i).style.left ) - parseFloat( nodes[i]["originX"] );
          line["toY"] +=  parseFloat( document.getElementById(i).style.top ) - parseFloat( nodes[i]["originY"] );
        }   
      }
      
      nodes[i]["originX"] = parseFloat( document.getElementById(i).style.left );
      nodes[i]["originY"] = parseFloat( document.getElementById(i).style.top );   
      */
    }
  }
  
  //Write to save file
  var file = Titanium.Filesystem.getFile(result[0]);
  file.write( Titanium.JSON.stringify(mapDataArray) );

  //Cleanup
  mapDataArray["plistFiles"] = [];
  mapDataArray["pngFiles"] = [];
}

function closeMap(){
  toolsSelectTool(Tools.none);
  
  selectMapObject(null, false);
  selectSprite(null);
  $("#map").html("");
  $("#sprites").html("");
  //$("#metaFields").html("");
  
  document.getElementById('canvasWidth').value = 1000;
  document.getElementById('canvasHeight').value = 1000;
  setCanvasSize();
  setZoom(100);

  resetGlobals();
}

function openMap(result){
  closeMap(); //Close any current open map
  
  openingMap = true;
  
  toolsSelectTool(Tools.none);
  
  var file = Titanium.Filesystem.getFile(result[0]);
  var openMapDataArray = Titanium.JSON.parse( file.read() );
  
  //Set Globals
  if(resourcesDirectory == null){ //Load in resources if neccessary
    if( specifyResourceFolder([openMapDataArray["resourcesDirectory"]], mapDataArray) ){
      setTimeout(function(){ continueOpenMap(result, file, openMapDataArray); },2000); //This is retarded, but, specifyResourceFolder needs 2 seconds to run.
    }
  }
}

function continueOpenMap(result, file, openMapDataArray){
  document.getElementById('canvasWidth').value = openMapDataArray['canvasWidth'];
  document.getElementById('canvasHeight').value = openMapDataArray['canvasHeight'];
  setCanvasSize();
  
  //Set Nodes
  var nodes = openMapDataArray["mapNodes"];
  var count = 0;
  
  for(i in nodes){
    var iKey = i; //i ends up getting mutated (for whatever reason) so this allows us to use the original i value later on
    var blankNode = false;
    var key = "map_"+count; //Our keys are re-done every time we load a map from a saved file. This just makes things easier. It cleans out empty nodes.
    
    if( createObjectWithMapNode(nodes[i], key) ){
      //Success
    }else{
      //We have a blank node
      blankNode = true;
      count -= 1;
    }
    count += 1;
        
    //Add Meta
    if(!blankNode){
      if(nodes[iKey]["meta"]){
        mapDataArray["mapNodes"][key]["meta"] = {};
        for(x in nodes[iKey]["meta"]){
          mapDataArray["mapNodes"][key]["meta"][x] = nodes[iKey]["meta"][x];
        }
      }
    }
  }
  openingMap = false;
}

function createObjectWithMapNode(node, key){
  //Create Node
 
  try{
  
  console.log( "createObjectWithMapNode("+node+", "+key+")" );
  console.log( "zIndex: "+ node["zIndex"]);
  
  if(key == null){
    key = "map_" + mapObjectCount;
  }
  
  if(node["type"] == "tiledSprite"){
    openMapOriginX = node["originX"];
    openMapOriginY = node["originY"];      
    openMapWidth = node["width"];
    openMapHeight = node["height"];
    selectedSpriteX = node["selectedSpriteX"];
    selectedSpriteY = node["selectedSpriteY"];
    openMapFlipX = node["flipX"];
    openMapFlipY = node["flipY"];
    openMapZIndex = node["zIndex"];
  
    var masks = node["masks"];
  
    finishTiledSprite(null);
  
    //Create masks
    if(masks != null){
      for(x in masks){
//        createMaskFromFile( key, masks[x]["originX"], masks[x]["originY"], masks[x]["width"], 
//          masks[x]["height"], masks[x]["imagePath"] ); 
        createMask( key, masks[x]["originX"], masks[x]["originY"], masks[x]["width"], 
          masks[x]["height"], masks[x]["pointsX"], masks[x]["pointsY"] );

      }
    }
  
    //Process flipping. This needs to be delayed a second because of other delays involving drawing masks.
    setTimeout(function(){
      if(node["flipX"] == "Y"){ flipImage('x',document.getElementById(key)); }
      if(node["flipY"] == "Y"){ flipImage('y',document.getElementById(key)); }
    }, 1000);
  }else if(node["type"] == "polygon"){
    openMapDrawnLines = node["drawnLines"];
    openMapZIndex = node["zIndex"];
  
    finishPolygon(null);
  }else if(node["type"] == "point"){
    openMapOriginX = node["originX"];
    openMapOriginY = node["originY"];
    openMapZIndex = node["zIndex"];
  
    createPoint(null);
  }else if(node["type"] == "line"){
    openMapDrawnLines = node["drawnLines"];
    openMapOriginX = node["originX"];
    openMapOriginY = node["originY"];
    openMapZIndex = node["zIndex"];
  
    finishLine(null);
  }else if(node["type"] == "sprite"){
    openMapOriginX = node["originX"];
    openMapOriginY = node["originY"];
    openMapFlipX = node["flipX"];
    openMapFlipY = node["flipY"];
    openMapZIndex = node["zIndex"];
  
    var masks = node["masks"];
  
    createSprite(node["selectedSpriteX"], node["selectedSpriteY"], null);;
  
    //Create masks
    if(masks != null){
      for(x in masks){
        createMask( key, masks[x]["originX"], masks[x]["originY"], masks[x]["width"], 
          masks[x]["height"], masks[x]["pointsX"], masks[x]["pointsY"] );
        
//        createMaskFromFile( key, masks[x]["originX"], masks[x]["originY"], masks[x]["width"], 
//          masks[x]["height"], masks[x]["imagePath"] ); 
      }
    }
  
    //Process flipping. This needs to be delayed a second because of other delays involving drawing masks.
    setTimeout(function(){
      if(node["flipX"] == "Y"){ flipImage('x',document.getElementById(key)); }
      if(node["flipY"] == "Y"){ flipImage('y',document.getElementById(key)); }
    }, 1000);
  }else{
    //We have a blank node
    return false;
  }
  openMapOriginX = null; openMapOriginY = null; openMapWidth = null; openMapHeight = null;
  openMapFlipX = null; openMapFlipY = null;  openMapDrawnLines = null; openMapZIndex = null; 
  return true;
  
  }catch(err){ console.log(err); }
}

function startMoveCamera(e){
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    return;
  }
  
  movingCamera = true;  
  
  var mouseX = e.clientX;
  var mouseY = e.clientY;

  clickedX = mouseX;
  clickedY = mouseY;
}

function moveCamera(e){
  var mouseX = e.clientX;
  var mouseY = e.clientY;
  
  var scrollLeft = parseFloat( $("#map_window_inner").attr("scrollLeft") );
  var scrollTop = parseFloat( $("#map_window_inner").attr("scrollTop") );
  scrollLeft -= mouseX - clickedX;
  scrollTop -= mouseY - clickedY;

  $("#map_window_inner").attr("scrollLeft", scrollLeft);
  $("#map_window_inner").attr("scrollTop", scrollTop);
  
  clickedX = mouseX;
  clickedY = mouseY;
}

function finishMoveCamera(e){
  movingCamera = false;
  
  clickedX = null;
  clickedY = null;
}

function startTiledSprite(e){
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    return;
  }
  
  if(selectedSprite == null){
    alert("Please select a sprite before drawing a tiled sprite."); return;
  }
  
  drawing = true;

  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);

  clickedX = mouseX;
  clickedY = mouseY;

  var count = mapObjectCount;
  var canvas = getFullShapeCanvas();
  document.getElementById('map').appendChild( canvas );  
}

function drawTiledSprite(e){
  var style = "red";
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  //We limited the tiled sprite size
/*  
  if(mouseX > clickedX + 1024){ mouseX = clickedX + 1024; }
  if(mouseX < clickedX - 1024){ mouseX = clickedX - 1024; }
  if(mouseY > clickedY + 1024){ mouseY = clickedY + 1024; }
  if(mouseY < clickedY - 1024){ mouseY = clickedY - 1024; }
*/  
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);

  var context = document.getElementById("map_" + count).getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);  

	context.strokeStyle = style;
  context.lineWidth = 2;
  
  context.beginPath(); //Top
  context.moveTo(clickedX, clickedY);
  context.lineTo(mouseX, clickedY);
  context.stroke(); 

  context.beginPath(); //Right
  context.moveTo(mouseX, clickedY);
  context.lineTo(mouseX, mouseY);
  context.stroke(); 

  context.beginPath(); //Bottom
  context.moveTo(mouseX, mouseY);
  context.lineTo(clickedX, mouseY);
  context.stroke(); 

  context.beginPath(); //Left
  context.moveTo(clickedX, mouseY);
  context.lineTo(clickedX, clickedY);
  context.stroke(); 
  
  document.getElementById('mapObjectSize').innerHTML = parseFloat(mouseX-clickedX) + "," + parseFloat(mouseY-clickedY);
}

function finishTiledSprite(e){
  drawing = false;
  
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
    
  //Remove the canvas
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);
  
  var kids = document.getElementById("map").childNodes;
  for (i=0; i < kids.length; i++) {
    if(kids[i] == canvas){
      document.getElementById("map").removeChild(kids[i]);
    }
  }

  var width = openMapWidth || absoluteValue(mouseX-clickedX);
  var height = openMapHeight || absoluteValue(mouseY-clickedY);
/*  
  if(width > 1024){ width = 1024; }
  if(height > 1024){ height = 1024; }
*/  
  var originX = clickedX;
  if(mouseX < clickedX){ originX = mouseX; }
  if(openMapOriginX != null){ originX = openMapOriginX; }  //For map loading
  var originY = clickedY;
  if(mouseY < clickedY){ originY = mouseY; }
  if(openMapOriginY != null){ originY = openMapOriginY; }  //For map loading
    
  canvas = getSpriteCanvas(width,height,originX,originY);
  document.getElementById('map').appendChild( canvas );
  canvas = document.getElementById("map_" + count);
  
  var context = document.getElementById("map_" + count).getContext('2d');
  
  var nodeWidth = parseFloat(textureArray[selectedSpriteX][selectedSpriteY]["width"]) || 0;
  var nodeHeight = parseFloat(textureArray[selectedSpriteX][selectedSpriteY]["height"]) || 0;
  var textureWidth = parseFloat(textureArray[selectedSpriteX]["width"]) || 0;
  var textureHeight = parseFloat(textureArray[selectedSpriteX]["height"]) || 0;
  var locX = parseFloat(textureArray[selectedSpriteX][selectedSpriteY]["x"]) || 0;
  var locY = parseFloat(textureArray[selectedSpriteX][selectedSpriteY]["y"]) || 0;
      
  var sheetLoc = selectedSpriteX.replace(resourcesDirectory,"").replace(".plist",".png");
  var imageLoc = "GameResources" + sheetLoc;
  var sheetName = sheetLoc.replace("/Images/","");
  
	var image = new Image();
	image.src = imageLoc;
	image.onload = function(){
		for (var x=0;x<width/nodeWidth;x++){  
     	for (var y=0;y<height/nodeHeight;y++){  
				context.drawImage(image,locX,locY,nodeWidth,nodeHeight,x*nodeWidth,y*nodeHeight,nodeWidth,nodeHeight);
     	}  
   	}  
	};

  canvas = document.getElementById("map_" + count);
  
  initNodeDrag(canvas);
  mapObjectCount += 1; mapDataArray["mapObjectCount"] = mapObjectCount;
    
  //Add this object to the mapDataArray
  if(mapDataArray["mapNodes"][canvas.id] == null){  
    mapDataArray["mapNodes"][canvas.id] = {};
    mapDataArray["mapNodes"][canvas.id]["meta"] = {};
  }
  mapDataArray["mapNodes"][canvas.id]["type"] = "tiledSprite"; mapDataArray["mapNodes"][canvas.id]["zIndex"] = openMapZIndex || 25000;
  mapDataArray["mapNodes"][canvas.id]["originX"] = originX; mapDataArray["mapNodes"][canvas.id]["originY"] = originY;
  mapDataArray["mapNodes"][canvas.id]["width"] = width; mapDataArray["mapNodes"][canvas.id]["height"] = height;
  mapDataArray["mapNodes"][canvas.id]["selectedSpriteX"] = selectedSpriteX; mapDataArray["mapNodes"][canvas.id]["selectedSpriteY"] = selectedSpriteY;
  mapDataArray["mapNodes"][canvas.id]["flipX"] = 'N'; mapDataArray["mapNodes"][canvas.id]["flipY"] = 'N';
  
  clickedX = null;
  clickedY = null;
  
  if(redoStack.length > 0){ redoStack = new Array(); }  //Clear out the redo stack
  
  lastLeft = 0; lastTop = 0;
  
  return canvas;
}

function startMask(e){
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    return;
  }
  
  if(selectedMapObject == null || !$(selectedMapObject).hasClass('spriteNode')){
    alert("Please select a map sprite before creating a mask."); return;
  }
  
  reloadTiledSprite(selectedMapObject.id, true);  
  
  drawing = true;
  drawnLines = [];

  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);

  clickedX = mouseX;
  clickedY = mouseY;
  polygonStartX = mouseX; //This is where the polygon starts and ends
  polygonStartY = mouseY;

  var count = mapObjectCount;
  var spriteToMask = document.getElementById("map_"+(mapObjectCount-1));
  
  var canvas = getShapeCanvas((parseFloat(spriteToMask.style.width)+500)*(100/zoom),
    (parseFloat(spriteToMask.style.height)+500)*(100/zoom),(parseFloat(spriteToMask.style.left)-250)*(100/zoom),
    (parseFloat(spriteToMask.style.top)-250)*(100/zoom));
  document.getElementById('map').appendChild( canvas );  
  
  //We use this to adjust the drawn line when moving the camera around.
  lastLeft = (parseFloat(spriteToMask.style.left)-250)*(100/zoom);
  lastTop = (parseFloat(spriteToMask.style.top)-250)*(100/zoom);
}

function drawMaskLine(e,start){  //Start is whether or not this is a new line
  //console.log("scrollLeft: "+scrollLeft+" scrollTop: "+scrollTop);
  
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);

  if(!start){ 
    drawnLines.pop(); 
  }else{
    clickedX = mouseX;
    clickedY = mouseY;
  }
  drawnLines.push( { fromX: clickedX, fromY: clickedY, toX: mouseX, toY: mouseY } );

  var context = document.getElementById("map_" + count).getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);  

  context.lineWidth = 2;
  for(i in drawnLines){
	  context.strokeStyle = "red";
	  if(i == 0){ context.strokeStyle = "blue"; }
    context.beginPath();
    context.moveTo(drawnLines[i]["fromX"]-lastLeft, drawnLines[i]["fromY"]-lastTop);
    context.lineTo(drawnLines[i]["toX"]-lastLeft, drawnLines[i]["toY"]-lastTop);
    context.stroke();     
  }
}

function finishMask(e){  
  console.log("Finish mask!");
  
  drawing = false;
  
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  //Remove the canvas (its not needed now)
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);
  
  var kids = document.getElementById("map").childNodes;
  for (i=0; i < kids.length; i++) {
    if(kids[i] == canvas){
      document.getElementById("map").removeChild(kids[i]);
    }
  }
  
  var lowestX = null; var highestX = null;
  var lowestY = null; var highestY = null;
  
  for(i in drawnLines){ //Find the highest and lowest X/Y
    if(lowestX > drawnLines[i]["fromX"] || lowestX == null){ lowestX = drawnLines[i]["fromX"]; }
    if(lowestX > drawnLines[i]["toX"] || lowestX == null){ lowestX = drawnLines[i]["toX"]; }
    if(highestX < drawnLines[i]["fromX"] || highestX == null){ highestX = drawnLines[i]["fromX"]; }
    if(highestX < drawnLines[i]["toX"] || highestX == null){ highestX = drawnLines[i]["toX"]; }
    
    if(lowestY > drawnLines[i]["fromY"] || lowestY == null){ lowestY = drawnLines[i]["fromY"]; }
    if(lowestY > drawnLines[i]["toY"] || lowestY == null){ lowestY = drawnLines[i]["toY"]; }
    if(highestY < drawnLines[i]["fromY"] || highestY == null){ highestY = drawnLines[i]["fromY"]; }
    if(highestY < drawnLines[i]["toY"] || highestY == null){ highestY = drawnLines[i]["toY"]; }
  }

  var width = absoluteValue(highestX-lowestX)+10;
  var height = absoluteValue(highestY-lowestY+10);
  var originX = lowestX-10;
  var originY = lowestY-10;
/*  
  if(width > 1024 || height > 1024){
    alert("Masks can be maximum of 1024x1024 pixels. This was "+width+"x"+height+" pixels.");
    clickedX = null; clickedY = null; polygonStartX = null; polygonStartY = null;
    return;
  }
*/  
  //canvas = getShapeCanvas(mouseX,mouseY,width,height,originX,originY);
  //document.getElementById('map').appendChild( canvas );
  //canvas = document.getElementById("map_" + count);  
  
  canvas = document.getElementById(selectedMapObject.id);
  var context = canvas.getContext('2d');
  
  //Clear the canvas
  context.clearRect(0,0,canvas.width,canvas.height);  
  
  //Origins are relative
  originX -= parseFloat(canvas.style.left);
  originY -= parseFloat(canvas.style.top);
  
	context.globalCompositeOperation = 'destination-out';	//This is important that we make this call here. This allows masking.
	
  var fromX = drawnLines[0]["fromX"]-parseFloat(canvas.style.left);
  var fromY = drawnLines[0]["fromY"]-parseFloat(canvas.style.top);
  var toX = drawnLines[0]["toX"]-parseFloat(canvas.style.left);
  var toY = drawnLines[0]["toY"]-parseFloat(canvas.style.top);
  //if(fromX < 0){ fromX = fromX*(-1); }  //Correct for only positive coordinate drawing
  //if(fromY < 0){ fromY = fromY*(-1); }
  //if(toX < 0){ toX = toX*(-1); }
  //if(toY < 0){ toY = toY*(-1); }
	
	mapDataArray["mapNodes"][canvas.id]["masks"] = [];
	var thisMask = { "pointsX":[ ], "pointsY":[ ], "triPoints":[ ], "originX":originX, "originY":originY, "width":width, "height":height };
		
	tri_init();
		
	thisMask["pointsX"].push(fromX); thisMask["pointsY"].push(fromY);
	tri_verts.push(new tVertex(new tPointi(fromX, fromY)));
	
	thisMask["pointsX"].push(toX); thisMask["pointsY"].push(toY);
	tri_verts.push(new tVertex(new tPointi(toX, toY)));
		
	context.fillStyle = "white";  
	context.beginPath();
  context.moveTo(fromX,fromY);
  context.lineTo(toX,toY);
  for(i in drawnLines){
    if(i != 0 && i != drawnLines.length-1){
      toX = drawnLines[i]["toX"]-parseFloat(canvas.style.left);
      toY = drawnLines[i]["toY"]-parseFloat(canvas.style.top);
      //if(toX < 0){ toX = toX*(-1); }  //Correct for only positive coordinate drawing
      //if(toY < 0){ toY = toY*(-1); }

      context.lineTo(toX,toY);
      
      thisMask["pointsX"].push(toX); thisMask["pointsY"].push(toY);
      tri_verts.push(new tVertex(new tPointi(toX, toY)));
    }
  }
  
  
  triangulate();
	for(t in tri_triangles){
	  var tri = [tri_triangles[t][0].name, tri_triangles[t][1].name, tri_triangles[t][2].name];
	  thisMask["triPoints"].push(tri);
	}
  
	context.clip();
	
	mapDataArray["mapNodes"][canvas.id]["masks"].push( thisMask );
	
  reloadTiledSprite(canvas.id, false);
    
  clickedX = null;
  clickedY = null;
  
  polygonStartX = null;
  polygonStartY = null;
  
  lastLeft = 0;
  lastTop = 0;
}

function createMask(id, originX, originY, width, height, pointsX, pointsY){    
  reloadTiledSprite(id, false);
  
  setTimeout( function(){
    var canvas = document.getElementById(id);
    
    var context = canvas.getContext('2d');
    context.clearRect(0,0,canvas.width,canvas.height);  
    
    var fromX = pointsX[0];
    var fromY = pointsY[0];
    //if(fromX < 0){ fromX = fromX*(-1); }
    //if(fromY < 0){ fromY = fromY*(-1); }
  
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = 'white';
    context.beginPath();

    //Currently you can only have 1 mask
  	mapDataArray["mapNodes"][canvas.id]["masks"] = [];
  	var thisMask = { "pointsX":[ ], "pointsY":[ ], "triPoints":[ ], "originX":originX, "originY":originY, "width":width, "height":height };
		
		tri_init();
		
  	thisMask["pointsX"].push(fromX); thisMask["pointsY"].push(fromY);
    tri_verts.push(new tVertex(new tPointi(fromX, fromY)));

    context.moveTo(fromX, fromY);

    for (i=1; i < pointsX.length; i++) {
      var toX = pointsX[i];
      var toY = pointsY[i];
      //if(toX < 0){ toX = toX*(-1); }
      //if(toY < 0){ toY = toY*(-1); }    
      context.lineTo(toX, toY);
      
  	  thisMask["pointsX"].push(toX); thisMask["pointsY"].push(toY);
  	  tri_verts.push(new tVertex(new tPointi(toX, toY)));
    }
    
    triangulate();
  	for(t in tri_triangles){
  	  var tri = [tri_triangles[t][0].name, tri_triangles[t][1].name, tri_triangles[t][2].name];
  	  thisMask["triPoints"].push(tri);
  	}    

    context.clip();
    
    mapDataArray["mapNodes"][canvas.id]["masks"].push( thisMask );
    
    reloadTiledSprite(id, false);
  
  }, 500);
}

function reloadTiledSprite(id, wash){
  var obj = mapDataArray["mapNodes"][id];
  
  var mapObject;
  
  if(wash){
    var oldMapObject = document.getElementById(id);
    editDeleteSelected(oldMapObject, true);
          
    obj["masks"] = [];
    createObjectWithMapNode(obj, null);
    
    setTimeout( function(){ 
      var m = document.getElementById("map_"+(mapObjectCount-1));
      selectMapObject(m, true); 
    }, 250 );
  }else{
    mapObject = document.getElementById(id);
    
    //Wash and re-create the canvas of either the Sprite or TiledSprite
    var width = obj["width"];
    var height = obj["height"];
    var nodeWidth = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["width"]) || 0;
    var nodeHeight = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["height"]) || 0;
    var textureWidth = parseFloat(textureArray[obj["selectedSpriteX"]]["width"]) || 0;
    var textureHeight = parseFloat(textureArray[obj["selectedSpriteX"]]["height"]) || 0;
    var locX = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["x"]) || 0;
    var locY = parseFloat(textureArray[obj["selectedSpriteX"]][obj["selectedSpriteY"]]["y"]) || 0;
    
    var sheetLoc = obj["selectedSpriteX"].replace(resourcesDirectory,"").replace(".plist",".png");
    var imageLoc = "GameResources" + sheetLoc;
    var sheetName = sheetLoc.replace("/Images/","");
  
    var context = mapObject.getContext('2d');
  
    var image = new Image();
    image.src = imageLoc;
   
    context.globalCompositeOperation = 'source-over';
    
    if( obj["type"] == "sprite" ){
      image.onload = function(){   
        context.drawImage(image,locX,locY,nodeWidth,nodeHeight,0,0,nodeWidth,nodeHeight);
      }      
    }else if( obj["type"] == "tiledSprite" ){  
    	image.onload = function(){
    		for (var x=0;x<width/nodeWidth;x++){  
         	for (var y=0;y<height/nodeHeight;y++){  
    				context.drawImage(image,locX,locY,nodeWidth,nodeHeight,x*nodeWidth,y*nodeHeight,nodeWidth,nodeHeight);
         	}  
       	}  
    	};
    } 
  }
  

}


function startPolygon(e){
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    return;
  }
  
  drawing = true;
  drawnLines = [];

  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);

  clickedX = mouseX;
  clickedY = mouseY;
  polygonStartX = mouseX; //This is where the polygon starts and ends
  polygonStartY = mouseY;

  var count = mapObjectCount;
  var canvas = getFullShapeCanvas();
  document.getElementById('map').appendChild( canvas );  
}

function drawPolygonLine(e,start){  //Start is whether or not this is a new line
  var style = "red";
  var scrollLeft = parseFloat( $("#map_window_inner").attr("scrollLeft") )*(100/zoom);
  var scrollTop = parseFloat( $("#map_window_inner").attr("scrollTop") )*(100/zoom);
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);

  if(!start){ 
    drawnLines.pop(); 
  }else{
    clickedX = mouseX;
    clickedY = mouseY;
  }
  drawnLines.push( { fromX: clickedX, fromY: clickedY, toX: mouseX, toY: mouseY } );

  var context = document.getElementById("map_" + count).getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);  

	context.strokeStyle = style;
  context.lineWidth = 2;
  for(i in drawnLines){
    context.beginPath();
    context.moveTo(drawnLines[i]["fromX"]-scrollLeft, drawnLines[i]["fromY"]-scrollTop);
    context.lineTo(drawnLines[i]["toX"]-scrollLeft, drawnLines[i]["toY"]-scrollTop);
    context.stroke();     
  }
}

function polygonFinishClicked(e){ //Whether or not you clicked the polygon's origin
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  var clickBoxSize = 32;
  
  return pointInRect(mouseX, mouseY, polygonStartX-clickBoxSize/2, polygonStartY-clickBoxSize/2, clickBoxSize, clickBoxSize);
}

function finishPolygon(e){
  drawing = false;
  
  if(openMapDrawnLines != null){ drawnLines = openMapDrawnLines; }
  
  var style = "red";
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  //Remove the canvas
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);
  
  var kids = document.getElementById("map").childNodes;
  for (i=0; i < kids.length; i++) {
    if(kids[i] == canvas){
      document.getElementById("map").removeChild(kids[i]);
    }
  }

  var lowestX = null; var highestX = null;
  var lowestY = null; var highestY = null;
  
  for(i in drawnLines){ //Find the highest and lowest X/Y
    if(lowestX > drawnLines[i]["fromX"] || lowestX == null){ lowestX = drawnLines[i]["fromX"]; }
    if(lowestX > drawnLines[i]["toX"] || lowestX == null){ lowestX = drawnLines[i]["toX"]; }
    if(highestX < drawnLines[i]["fromX"] || highestX == null){ highestX = drawnLines[i]["fromX"]; }
    if(highestX < drawnLines[i]["toX"] || highestX == null){ highestX = drawnLines[i]["toX"]; }
    
    if(lowestY > drawnLines[i]["fromY"] || lowestY == null){ lowestY = drawnLines[i]["fromY"]; }
    if(lowestY > drawnLines[i]["toY"] || lowestY == null){ lowestY = drawnLines[i]["toY"]; }
    if(highestY < drawnLines[i]["fromY"] || highestY == null){ highestY = drawnLines[i]["fromY"]; }
    if(highestY < drawnLines[i]["toY"] || highestY == null){ highestY = drawnLines[i]["toY"]; }
  }

  var width = absoluteValue(highestX-lowestX);
  var height = absoluteValue(highestY-lowestY);
  var originX = lowestX;
  var originY = lowestY;
    
  canvas = getShapeCanvas(width,height,originX,originY);
  document.getElementById('map').appendChild( canvas );
  canvas = document.getElementById("map_" + count);

  var context = document.getElementById("map_" + count).getContext('2d');
  context.strokeStyle = style;
  context.lineWidth = 2;

  for(i in drawnLines){
    //Now we need to take our drawn lines are create an entirely new canvas of the correct size:
    var fromX = drawnLines[i]["fromX"]-parseFloat(canvas.style.left);
    var fromY = drawnLines[i]["fromY"]-parseFloat(canvas.style.top);
    var toX = drawnLines[i]["toX"]-parseFloat(canvas.style.left);
    var toY = drawnLines[i]["toY"]-parseFloat(canvas.style.top);
    //if(toX < 0){ toX = toX*(-1); }  //Correct for only positive coordinate drawing
    //if(toY < 0){ toY = toY*(-1); }
    context.beginPath();
    context.moveTo(fromX,fromY);
    context.lineTo(toX,toY);
    context.stroke();
  }
  
  canvas = document.getElementById("map_" + count);
  
  initNodeDrag(canvas);
  mapObjectCount += 1; mapDataArray["mapObjectCount"] = mapObjectCount;
  
  //Add this object to the mapDataArray
  if(mapDataArray["mapNodes"][canvas.id] == null){  
    mapDataArray["mapNodes"][canvas.id] = {};
    mapDataArray["mapNodes"][canvas.id]["meta"] = {};
  }
  mapDataArray["mapNodes"][canvas.id]["zIndex"] = openMapZIndex || 35000;
  mapDataArray["mapNodes"][canvas.id]["type"] = "polygon";
  mapDataArray["mapNodes"][canvas.id]["drawnLines"] = drawnLines;
   
  clickedX = null;
  clickedY = null;
  
  polygonStartX = null;
  polygonStartY = null;
  
  if(redoStack.length > 0){ redoStack = new Array(); }  //Clear out the redo stack
  
  return canvas;
}

function createPoint(e){  
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    alert("Only left click enabled for this.");
    return;
  }
  
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);  
  var scrollLeft = parseFloat( $("#map_window_inner").attr("scrollLeft") );
  var scrollTop = parseFloat( $("#map_window_inner").attr("scrollTop") );
  var originX = openMapOriginX || mouseX; 
  var originY = openMapOriginY || mouseY;
  originX -= 16; originY -= 16;
  
  var count = mapObjectCount;
  var canvas = document.createElement("canvas");
  var zIndex = 15000;
  if(openMapZIndex != null){ zIndex = parseFloat(openMapZIndex)-20000; }
  
  var width = 32; var height = 32;
  var style = "red";

  canvas.id = "map_" + count;
  canvas.setAttribute("onmousedown","selectMapObject(this, false);");
  canvas.setAttribute("class","shapeNode");
  canvas.setAttribute("width", width+"px");
  canvas.setAttribute("height", height+"px");
  canvas.setAttribute("style","width:" + width + "px; height:" + height + "px; top:" + originY + "px; left:" + originX + "px; z-index:"+zIndex+";");

  document.getElementById('map').appendChild( canvas );
  
  var context = document.getElementById("map_" + count).getContext('2d');

	context.strokeStyle = style;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(16, 0);
  context.lineTo(16, 32);
  context.stroke();  
  
  context.beginPath();
  context.moveTo(0, 16);
  context.lineTo(32, 16);
  context.stroke(); 
  
  initNodeDrag(canvas);
  mapObjectCount += 1; mapDataArray["mapObjectCount"] = mapObjectCount;
  
  //Add this object to the mapDataArray
  if(mapDataArray["mapNodes"][canvas.id] == null){  
    mapDataArray["mapNodes"][canvas.id] = {};
    mapDataArray["mapNodes"][canvas.id]["meta"] = {};
  }
  mapDataArray["mapNodes"][canvas.id]["zIndex"] = openMapZIndex || 35000;
  mapDataArray["mapNodes"][canvas.id]["type"] = "point";
  mapDataArray["mapNodes"][canvas.id]["originX"] = originX+16; mapDataArray["mapNodes"][canvas.id]["originY"] = originY+16;
  
  if(redoStack.length > 0){ redoStack = new Array(); }  //Clear out the redo stack
}

function startLine(e){
  if(e != null && (e.which == 3 || e.which == 2)){ //Right or middle mouse click
    return;
  }
  
  drawing = true;
  drawnLines = [];

  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);

  clickedX = mouseX;
  clickedY = mouseY;
  
  var count = mapObjectCount;
  var canvas = getFullShapeCanvas();
  document.getElementById('map').appendChild( canvas );
}

function drawLine(e){
  var style = "red";
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);

  drawnLines.pop();
  drawnLines.push( { fromX: clickedX, fromY: clickedY, toX: mouseX, toY: mouseY } );

  var context = document.getElementById("map_" + count).getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);  

	context.strokeStyle = style;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(clickedX, clickedY);
  context.lineTo(mouseX, mouseY);
  context.stroke();  
}

function finishLine(e){
  drawing = false;
  
  if(openMapDrawnLines != null){ drawnLines = openMapDrawnLines; }
  
  var style = "red";
  var mouseX = getMapMouseX(e);
  var mouseY = getMapMouseY(e);
  
  //Remove the canvas
  var count = mapObjectCount;
  var canvas = document.getElementById("map_" + count);
  
  var kids = document.getElementById("map").childNodes;
  for (i=0; i < kids.length; i++) {
    if(kids[i] == canvas){
      document.getElementById("map").removeChild(kids[i]);
    }
  }

  var width = absoluteValue(drawnLines[0]["toX"]-drawnLines[0]["fromX"]);
  var height = absoluteValue(drawnLines[0]["toY"]-drawnLines[0]["fromY"]);
    
  var originX = clickedX;
  if(mouseX < clickedX){ originX = mouseX; }
  if(openMapOriginX != null){ originX = openMapOriginX; }  //For map loading
  var originY = clickedY;
  if(mouseY < clickedY){ originY = mouseY; }
  if(openMapOriginY != null){ originY = openMapOriginY; }  //For map loading
    
  canvas = getShapeCanvas(width,height,originX,originY);
  document.getElementById('map').appendChild( canvas );
  canvas = document.getElementById("map_" + count);

  //Now we need to take our drawn lines and create an entirely new canvas of the correct size:
  var fromX = drawnLines[0]["fromX"]-parseFloat(canvas.style.left);
  var fromY = drawnLines[0]["fromY"]-parseFloat(canvas.style.top);
  var toX = drawnLines[0]["toX"]-parseFloat(canvas.style.left);
  var toY = drawnLines[0]["toY"]-parseFloat(canvas.style.top);
  //if(toX < 0){ toX = toX*(-1); }  //Correct for only positive coordinate drawing
  //if(toY < 0){ toY = toY*(-1); }
  
  var context = document.getElementById("map_" + count).getContext('2d');
	context.strokeStyle = style;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(fromX,fromY);
  context.lineTo(toX,toY);
  context.stroke();    
  
  canvas = document.getElementById("map_" + count);
  
  initNodeDrag(canvas);
  mapObjectCount += 1; mapDataArray["mapObjectCount"] = mapObjectCount;
    
  //Add this object to the mapDataArray
  if(mapDataArray["mapNodes"][canvas.id] == null){  
    mapDataArray["mapNodes"][canvas.id] = {};
    mapDataArray["mapNodes"][canvas.id]["meta"] = {};
  }
  mapDataArray["mapNodes"][canvas.id]["zIndex"] = openMapZIndex || 35000;
  mapDataArray["mapNodes"][canvas.id]["type"] = "line";
  mapDataArray["mapNodes"][canvas.id]["drawnLines"] = drawnLines;
  mapDataArray["mapNodes"][canvas.id]["originX"] = originX; mapDataArray["mapNodes"][canvas.id]["originY"] = originY;
  
  clickedX = null;
  clickedY = null;
  
  if(redoStack.length > 0){ redoStack = new Array(); }  //Clear out the redo stack
  return canvas;
}

function createSprite(x,y,e){   
  console.log("createSprite("+x+","+y+","+e+");");
  
  var width = parseFloat(textureArray[x][y]["width"]);
  var height = parseFloat(textureArray[x][y]["height"]);
  var locX = parseFloat(textureArray[x][y]["x"]);
  var locY = parseFloat(textureArray[x][y]["y"]);
  
  var originX = openMapOriginX || getMapMouseX(e) - width/2;
  var originY = openMapOriginY || getMapMouseY(e) - height/2;
  
  var count = mapObjectCount;
  var canvas = getSprite(x,y,count,originX,originY);
  document.getElementById('map').appendChild( canvas );
    
  var sheetLoc = x.replace(resourcesDirectory,"").replace(".plist",".png");
  var imageLoc = "GameResources" + sheetLoc;
  var sheetName = sheetLoc.replace("/Images/","");
  
  canvas = document.getElementById("map_" + count);
  var context = canvas.getContext('2d');
  var image = new Image();
  image.src = imageLoc;
  image.onload = function(){ context.drawImage(image,locX,locY,width,height,0,0,width,height); }  
  
  initNodeDrag(canvas);
  mapObjectCount += 1; mapDataArray["mapObjectCount"] = mapObjectCount;
  
  //Add this object to the mapDataArray unless it was loaded in already
  if(mapDataArray["mapNodes"][canvas.id] == null){  
    mapDataArray["mapNodes"][canvas.id] = {};
    mapDataArray["mapNodes"][canvas.id]["meta"] = {};
  }
  mapDataArray["mapNodes"][canvas.id]["zIndex"] = openMapZIndex || 25000;
  mapDataArray["mapNodes"][canvas.id]["type"] = "sprite";
  mapDataArray["mapNodes"][canvas.id]["originX"] = originX; mapDataArray["mapNodes"][canvas.id]["originY"] = originY;
  mapDataArray["mapNodes"][canvas.id]["selectedSpriteX"] = x; mapDataArray["mapNodes"][canvas.id]["selectedSpriteY"] = y;
  mapDataArray["mapNodes"][canvas.id]["flipX"] = 'N'; mapDataArray["mapNodes"][canvas.id]["flipY"] = 'N';
  
  canvas = document.getElementById("map_" + count);
  
  if(redoStack.length > 0){ redoStack = new Array(); }  //Clear out the redo stack

  return canvas;
}

function getSpriteCanvas(width,height,x,y){
  if(width < 1){ width = 1; }
  if(height < 1){ height = 1; }
  
  var count = mapObjectCount;
  var canvas = document.createElement("canvas");
  var zIndex = 5000;
  if(openMapZIndex != null){ zIndex = parseFloat(openMapZIndex)-20000; }

  canvas.id = "map_" + count;
  canvas.setAttribute("onmousedown","selectMapObject(this, false);");
  canvas.setAttribute("class","spriteNode");
  canvas.setAttribute("width", width+"px");
  canvas.setAttribute("height", height+"px");
  canvas.setAttribute("style","width:" + width + "px; height:" + height + "px; top:" + y + "px; left:" + x + "px; z-index:"+zIndex+";");

  return canvas;
}

function getShapeCanvas(width,height,x,y){
  if(width < 1){ width = 1; }
  if(height < 1){ height = 1; } 
  
  var count = mapObjectCount;
  var canvas = document.createElement("canvas");
  var zIndex = 15000;
  if(openMapZIndex != null){ zIndex = parseFloat(openMapZIndex)-20000; }

  canvas.id = "map_" + count;
  canvas.setAttribute("onmousedown","selectMapObject(this, false);");
  canvas.setAttribute("class","shapeNode");
  canvas.setAttribute("width", width+"px");
  canvas.setAttribute("height", height+"px");
  canvas.setAttribute("style","width:" + width + "px; height:" + height + "px; top:" + y + "px; left:" + x + "px; z-index:"+zIndex+";");

  return canvas;
}

function getFullShapeCanvas(){
  var x = 0; var y = 0;
  var width = document.getElementById('canvasWidth').value;
  var height = document.getElementById('canvasHeight').value;
    
  var count = mapObjectCount;
  var canvas = document.createElement("canvas");
  var zIndex = 15000;
  if(openMapZIndex != null){ zIndex = parseFloat(openMapZIndex)-20000; }

  canvas.id = "map_" + count;
  canvas.setAttribute("onmousedown","selectMapObject(this, false);");
  canvas.setAttribute("class","shapeNode");
  canvas.setAttribute("width", width+"px");
  canvas.setAttribute("height", height+"px");
  canvas.setAttribute("style","width:" + width + "px; height:" + height + "px; top:" + y + "px; left:" + x + "px; z-index:"+zIndex+";");

  return canvas;
}

//FYI, getSprite and createSprite create SPRITE OBJECTS (in the map)
function getSprite(x,y,count,mouseX,mouseY){  
  var width = textureArray[x][y]["width"] || "0";
  var height = textureArray[x][y]["height"] || "0";
  var left = mouseX;// + window.pageXOffset - parseFloat(width)/2;
  var top = mouseY;// + window.pageYOffset - parseFloat(height)/2;
  width += "px"; height += "px";
  
  var zIndex = 5000;
  if(openMapZIndex != null){ zIndex = parseFloat(openMapZIndex)-20000; }

  var canvas = document.createElement("canvas");
  canvas.id = "map_" + count;
  canvas.setAttribute("onmousedown","selectMapObject(this, false);");
  canvas.setAttribute("class","spriteNode");
  canvas.setAttribute("width", width);
  canvas.setAttribute("height",height);
  canvas.setAttribute("style","position:absolute; "+"z-index:"+zIndex+"; "+"top:"+top+"; left:"+left+"; "+"width:"+width+"; height:"+height+";\"");
  return canvas;
}

function selectSprite(obj,x,y){   
  //This if statement doesn't work.
  //TODO - Don't allow creation of a tiled sprite with a plist texture.
  if(x!= null && x.match(".plist") && selectedTool == Tools.tiledSprite){
    alert("Warning! You cannot use a plist texture with a tiledSprite (can't do it in OpenGL). Please use a standalone texture.");
    return;
  }
  
  var prev = prevSelectedSprite;
  var selected = selectedSprite;
  
  prev = selected;
  selected = obj;
  if(selected != prev && selected != null){
    selected.style.border = "5px dashed red"; selected.style.margin = "-5px";
  }
  if(prev != null && prev != selected){ 
    prev.style.border = "0px"; prev.style.margin = "0px"; 
  }
  
  prevSelectedSprite = prev;
  selectedSprite = selected;
  selectedSpriteX = x;
  selectedSpriteY = y;
}

function selectMapObject(obj, override){ 
  var passed = false;
  if(obj == null){
    passed = true;
  }else if(selectedTool == Tools.spriteSelector && $(obj).hasClass('spriteNode')){
    passed = true;
  }else if(selectedTool == Tools.shapeSelector && $(obj).hasClass('shapeNode')){
    passed = true;
  }
  if(!passed && !override){
    return;
  }
  
  if(obj != null){
    console.log("********Selecting " + obj.id);
  }
  
  var prev = prevSelectedMapObject;
  var selected = selectedMapObject;
  
  prev = selected;
  selected = obj;
  if(selected != prev && selected != null){
    selected.style.border = "5px dashed red"; selected.style.margin = "-5px";
    document.getElementById('mapObjectZIndex').innerHTML = selected.style.zIndex;
    document.getElementById('mapObjectSize').innerHTML = parseFloat(selected.style.width) + "," + parseFloat(selected.style.height);
  }
  if(prev != null && prev != selected){ 
    prev.style.border = "0px"; prev.style.margin = "0px"; 
    $(prev).draggable("option","grid",[1,1]); //Reset the draggable grid back to nothing
  }
  
  if(prev != null){ //Our previous object should always be a real object
    prevSelectedMapObject = prev;
  }
  selectedMapObject = selected;
  
  //Set Meta information
  if(selectedMapObject == null){
    clearMetaFields();
  }else{  
    clearMetaFields();
    for(i in mapDataArray["mapNodes"][selectedMapObject.id]["meta"]){
      addMetaField(i,mapDataArray["mapNodes"][selectedMapObject.id]["meta"][i]);
    }
  }
  
  if(selectedMapObject != null){ setMapObjectPositionInfo(); }
}