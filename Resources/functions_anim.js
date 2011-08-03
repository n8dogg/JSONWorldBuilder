function fileOpenAnimationFile(){
  closeAnimationFile();
  
  var options = {
	  title: "Open Animation file...",
		multiple:false,
		types:['json'],
		typesDescription: 'Animation Files',
		path: resourcesDirectory
	};
  
	Titanium.UI.openFileChooserDialog(openAnimationFile, options);
}
function fileSaveAnimationFile(){
  if(resourcesDirectory == null){ alert("Please specify a resources directory before saving an animation file."); }
  
  var options = {
    filename: "animations.json",
    title: "Save file as...",
    types: ['json'],
    typesDescription: "Animation files",
    path: resourcesDirectory
  };
  
  Titanium.UI.openSaveAsDialog(saveAnimationFile, options);
}
function fileCloseAnimationFile(){
  closeAnimationFile();
}
function fileQuit(){
  if (confirm("Are you sure you want to quit?")) {
    Titanium.App.exit();
  }
}
function resourcesSpecifyResourceFolder(){
  Titanium.UI.openFolderChooserDialog(function(result){ specifyResourceFolder(result, animationDataArray); });
}
function resourcesReloadResources(){
  
}

function selectSprite(obj,x,y){   
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

/* Callbacks */
function saveAnimationFile(result){
  var animations = animationDataArray["animations"];

  //Process PLIST and PNG files
  var plistFilesUsed = {};
  var pngFilesUsed = {};
  
  animationDataArray["plistFiles"] = [];
  animationDataArray["pngFiles"] = [];
  
  for(i in animations){
    for(j in animations[i]["frames"]){
      var x = animations[i]["frames"][j]["selectedSpriteX"].split("/").pop();
      var y = animations[i]["frames"][j]["selectedSpriteY"];
    
      if( x.match(".plist") ){ plistFilesUsed[x] = true; }
      if( y.match(".plist") ){ plistFilesUsed[y] = true; }
      if( x.match(".png") ){ pngFilesUsed[x] = true; }
      if( y.match(".png") ){ pngFilesUsed[y] = true; }
    }
  }

  for(i in plistFilesUsed){
    animationDataArray["plistFiles"].push(i);
  }
  
  for(i in pngFilesUsed){
    animationDataArray["pngFiles"].push(i);
  }  
  
  
  //Write to save file
  var file = Titanium.Filesystem.getFile(result[0]);
  file.write( Titanium.JSON.stringify(animationDataArray) );
}

function closeAnimationFile(){
  selectAnimation(null);
  selectSprite(null);
  resetGlobals();
  clearAllFields();
}

function openAnimationFile(result){
  closeAnimationFile(); //Close any current open animation file
  
  openingAnimationFile = true;
  
  var file = Titanium.Filesystem.getFile(result[0]);
  var openAnimationDataArray = Titanium.JSON.parse( file.read() );
  
  //Set Globals
  if(resourcesDirectory == null){ //Load in resources if neccessary
    if( specifyResourceFolder([openAnimationDataArray["resourcesDirectory"]], animationDataArray) ){
      setTimeout(function(){ continueOpenAnimationFile(result, file, openAnimationDataArray); },1000); //This is retarded, but, specifyResourceFolder needs half a second to run.
    }
  }
}

function continueOpenAnimationFile(result, file, openAnimationDataArray){
  var rdaDup = openAnimationDataArray;
  
  for(x in openAnimationDataArray["animations"]){        
    addAnimation( openAnimationDataArray["animations"][x] );
    //Copying of the players is implicit because the hash is mutable

    selectAnimation(document.getElementById(x));
    
    populateSelectedAnimationInfo();
  }

  openingAnimationFile = false;
}

function addBlankAnimation(){
  addAnimation( { "animationName":"", "frameDelay":"", "frames":{} } );
}

function addAnimation(hash){  
  var div = document.createElement("div");  
  
  var animationNumber = numberOfAnimations;
  if(deletedAnimationNumbers.length > 0){
    animationNumber = deletedAnimationNumbers.pop();
  }
  
  div.id = "animation_"+animationNumber;
  div.setAttribute("onclick","javascript:selectAnimation(this);");
  div.style.cursor = "hand";
  
  var info = document.createElement("span");
  info.id = "animation_"+animationNumber+"_span";
  var removeButton = document.createElement("button");

  removeButton.setAttribute("onclick","if(!askConfirm()){return false;} removeAnimation(this.parentNode);");
  removeButton.innerHTML = "Delete";
  
  if(hash["animationName"] == ""){
    info.innerHTML = "Animation "+animationNumber;
  }else{
    info.innerHTML = hash["animationName"];
  }

  div.appendChild(info);
  div.appendChild(removeButton);
  
  document.getElementById('animations').appendChild(div);
  numberOfAnimations += 1;
  
  //This adds players implicitly if they are in the hash
  animationDataArray["animations"][div.id] = hash;
  selectAnimation(document.getElementById(div.id));
}

function removeAnimation(div){
  try{
  
  deletedAnimationNumbers.push( parseInt(div.id.replace("animation_","")) );
  
  selectAnimation(null);
  
  animationDataArray["animations"][div.id] = null;
  
  div.parentNode.removeChild(div);
     
  numberOfAnimations -= 1;
  
  }catch(err){ alert(err); }
  
}

function addBlankFrame(){
  addFrame("", "");
}

function addFrame(inputX, inputY){
  try{
  
  var frames = document.getElementById('frames');
  
  var div = document.createElement('div');
  var frameNumber = numberOfFrames;
  div.id = "frame_"+frameNumber;
  div.innerHTML = "#"+numberOfFrames+": <span id=\"frame_"+frameNumber+"Image\"></span><input class=\"frameImageX\" type=\"text\" id=\"frame_"+frameNumber+"ImageX\"/>" + 
    "<input class=\"frameImageY\" type=\"text\" id=\"frame_"+frameNumber+"ImageY\"/>" + 
		"<button onclick=\"javascript:populateWithSprite('frame_"+frameNumber+"ImageX', 'frame_"+frameNumber+"ImageY', 'frame_"+frameNumber+"Image', false);\">Populate</button>" + 
		"<button onclick=\"javascript:populateWithSprite('frame_"+frameNumber+"ImageX', 'frame_"+frameNumber+"ImageY', 'frame_"+frameNumber+"Image', true);\">Reverse Populate</button>";

  frames.appendChild(div);
  
  document.getElementById("frame_"+frameNumber+"ImageX").value = inputX;
  document.getElementById("frame_"+frameNumber+"ImageY").value = inputY;
  populateWithSprite("frame_"+frameNumber+"ImageX", "frame_"+frameNumber+"ImageY", "frame_"+frameNumber+"Image", true);
  
  numberOfFrames += 1;
  
  }catch(err){ alert(err); }
}

function popFrame(){
  var lastFrame = document.getElementById('frame_'+(numberOfFrames-1));
  
  if(lastFrame == null){ return; }
  
  document.getElementById('frames').removeChild(lastFrame);
  
  numberOfFrames -= 1;
}

function populateWithSprite(inputXId, inputYId, divId, filled){  
 try{
 
  var inputX = document.getElementById(inputXId);
  var inputY = document.getElementById(inputYId);
  var div = document.getElementById(divId);
  
  if(filled && inputX.value != "" && inputY.value != ""){   //Filled with proper values
    selectedSpriteX = inputX.value;
    selectedSpriteY = inputY.value;
  }else if(filled){ //Filled but with blanks
    $(div).css("backgroundImage","");
    $(div).css("width","0px");
    $(div).css("height","0px");
    inputX.value = "";
    inputY.value = "";
    return;
  }else if(selectedSpriteX == null || selectedSpriteY == null || selectedSpriteX == "" || selectedSpriteY == ""){   //Not filled and nothing selected
    $(div).css("backgroundImage","");
    $(div).css("width","0px");
    $(div).css("height","0px");
    inputX.value = "";
    inputY.value = "";
    return;
  }else{  //Not filled with something selected
    //Do Something
  }
  
  var maxWidth = 100;
  var maxHeight = 100;
  var zoom = 1.0;
  
  var x = selectedSpriteX;
  var y = selectedSpriteY;
  var imageLoc = "GameResources" + x.replace(".plist",".png");

  var width = (textureArray[x][y]["width"] || "0") + "px";
  var height = (textureArray[x][y]["height"] || "0") + "px";
  var locX = "-" + (textureArray[x][y]["x"] || "0") + "px";
  var locY = "-" + (textureArray[x][y]["y"] || "0") + "px";
  
  inputX.value = selectedSpriteX;
  inputY.value = selectedSpriteY;
  
  if(parseInt(width) > maxWidth){
    zoom = maxWidth/parseFloat(width);
  }
  if(parseInt(height) > maxHeight){
    if(zoom > maxHeight/parseFloat(height)){
      zoom = maxHeight/parseFloat(height);
    }
  }

  $(div).css("zoom",zoom*100+"%");
  $(div).css("display","inline-block");
  $(div).css("backgroundImage","url('"+imageLoc+"')");
  $(div).css("backgroundRepeat","no-repeat");
  $(div).css("backgroundPosition",locX+" "+locY);
  $(div).css("width",width);
  $(div).css("height",height);
  
  
}catch(err){ alert(err); }
}

function submitAnimChanges(){
  try{
  
  animationDataArray["animations"][selectedAnimation.id]["animationName"] = document.getElementById('animationName').value;
  animationDataArray["animations"][selectedAnimation.id]["frameDelay"] = document.getElementById('frameDelay').value;
  animationDataArray["animations"][selectedAnimation.id]["frames"] = {};
  for(i=0; i < numberOfFrames; i++){
    animationDataArray["animations"][selectedAnimation.id]["frames"]["frame_"+i] = {};
    animationDataArray["animations"][selectedAnimation.id]["frames"]["frame_"+i]["selectedSpriteX"] = document.getElementById("frame_"+i+"ImageX").value;
    animationDataArray["animations"][selectedAnimation.id]["frames"]["frame_"+i]["selectedSpriteY"] = document.getElementById("frame_"+i+"ImageY").value;
  }
  populateSelectedAnimationInfo();
  
  }catch(err){ alert(err); }
}

function clearAllFields(){
  clearAnimFields();
  document.getElementById('animations').innerHTML = "";
  $("#sprites").html("");
  
}

function clearAnimFields(){
  document.getElementById('animationName').value = "";
  document.getElementById('frameDelay').value = "";
  document.getElementById('frames').innerHTML = "";
  numberOfFrames = 0;
}

function populateSelectedAnimationInfo(){  
  if(selectedAnimation == null){ alert("Please select an animation before calling populateSelectedAnimationInfo"); }
  
  clearAnimFields();
  
  var animation = animationDataArray["animations"][selectedAnimation.id];
  
  document.getElementById('animationName').value = animation["animationName"];
  if(animation["animationName"] != ""){
    document.getElementById(selectedAnimation.id+"_span").innerHTML = animation["animationName"];
  }
  document.getElementById('frameDelay').value = animation["frameDelay"];
  var frames = getHashSize(animation["frames"]);

  for(i=0; i < frames; i++){
    //Sometimes this fails if you don't put the right image information in
    try{
      addFrame( animation["frames"]["frame_"+i]["selectedSpriteX"], animation["frames"]["frame_"+i]["selectedSpriteY"] );
    }catch(err){ console.log("ERROR: "+err); }
  }
}

function selectAnimation(obj){   
  if(obj == selectedAnimation){ return; }
  if(obj == null){ clearAnimFields(); }
  
  var prev = prevSelectedAnimation;
  var selected = selectedAnimation;
  
  prev = selected;
  selected = obj;
  if(selected != prev && selected != null){
    selected.style.background = "#FFAAAA";
  }
  if(prev != null && prev != selected){ 
    prev.style.background = "#FFFFFF";
  }
  
  prevSelectedAnimation = prev;
  selectedAnimation = selected;
  
  if(obj != null){ 
    populateSelectedAnimationInfo();
  }
}