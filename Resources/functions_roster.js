function fileOpenRosterFile(){
  closeRosterFile();
  
  var options = {
	  title: "Open Roster file...",
		multiple:false,
		types:['json'],
		typesDescription: 'Roster Files',
		path: resourcesDirectory
	};
  
	Titanium.UI.openFileChooserDialog(openRosterFile, options);
}
function fileSaveRosterFile(){
  if(resourcesDirectory == null){ 
    alert("Please specify a resources directory before saving a roster file.");
    resourcesSpecifyResourceFolder();
  }
  
  var options = {
    filename: "roster.json",
    title: "Save file as...",
    types: ['json'],
    typesDescription: "Roster files",
    path: resourcesDirectory
  };
  
  Titanium.UI.openSaveAsDialog(saveRosterFile, options);
}
function fileCloseRosterFile(){
  closeRosterFile();
}
function fileQuit(){
  if (confirm("Are you sure you want to quit?")) {
    Titanium.App.exit();
  }
}
function resourcesSpecifyResourceFolder(){
  Titanium.UI.openFolderChooserDialog(function(result){ specifyResourceFolder(result, rosterDataArray); });
}
function resourcesReloadResources(){
  
}

/* Callbacks */
function saveRosterFile(result){
  //Write to save file
  var file = Titanium.Filesystem.getFile(result[0]);
  file.write( Titanium.JSON.stringify(rosterDataArray) );
}

function closeRosterFile(){
  selectPlayer(null);
  selectTeam(null);
  selectSprite(null);
  resetGlobals();
  clearAllFields();
}

function openRosterFile(result){
  closeRosterFile(); //Close any current open roster file
  
  openingRosterFile = true;
  
  var file = Titanium.Filesystem.getFile(result[0]);
  var openRosterDataArray = Titanium.JSON.parse( file.read() );
  
  //Set Globals
  if(resourcesDirectory == null){ //Load in resources if neccessary
    if( specifyResourceFolder([openRosterDataArray["resourcesDirectory"]], rosterDataArray) ){
      setTimeout(function(){ continueOpenRosterFile(result, file, openRosterDataArray); },1000); //This is retarded, but, specifyResourceFolder needs half a second to run.
    }
  }
}

function continueOpenRosterFile(result, file, openRosterDataArray){
  var rdaDup = openRosterDataArray;
  
  for(x in openRosterDataArray["teams"]){    
    addTeam( openRosterDataArray["teams"][x] );
    //Copying of the players is implicit because the hash is mutable

    selectTeam(document.getElementById(x));
    
    populateSelectedTeamInfo();
  }

  openingRosterFile = false;
}

function clickHomeButton(){
  document.getElementById('homeUniform').style.display = 'block';
  document.getElementById('awayUniform').style.display = 'none';
  
  document.getElementById('homeButton').disabled = true;
  document.getElementById('awayButton').disabled = false;
}

function clickAwayButton(){
  document.getElementById('homeUniform').style.display = 'none';
  document.getElementById('awayUniform').style.display = 'block';
  
  document.getElementById('homeButton').disabled = false;
  document.getElementById('awayButton').disabled = true;
}

function addBlankTeam(){    
  addTeam( { "city":"", "teamName":"", "teamShortName":"", "league":"american", "stadiumName":"", "stadiumFile":"", 
    "stadiumLocation":"", "teamLogoX":"", "teamLogoY":"", "stadiumLogoX":"", "stadiumLogoY":"", 
    "managerFirstName":"Mr", "managerLastName":"Manager", "managerNickname":"The Manager", "players":{},
    "lineup": { "1":{ "player":"team_0_player_12", "position":"CF" }, "2":{ "player":"team_0_player_6", "position":"SS" }, 
      "3":{ "player":"team_0_player_10", "position":"LF" }, "4":{ "player":"team_0_player_2", "position":"1B" }, 
      "5":{ "player":"team_0_player_14", "position":"RF" }, "6":{ "player":"team_0_player_8", "position":"3B" }, 
      "7":{ "player":"team_0_player_4", "position":"2B" }, "8":{ "player":"team_0_player_0", "position":"C" }, 
      "9":{ "player":"team_0_player_16", "position":"P" } },
    "homeUniformColors": { "base":"FFFFFF", "logo":"FFFFFF", "cap":"FFFFFF", "capLogo":"FFFFFF", "shirtTrim":"FFFFFF", "socks":"FFFFFF", 
      "undershirt":"FFFFFF", "pantsTrim":"FFFFFF", "belt":"FFFFFF", "number":"FFFFFF" },
    "awayUniformColors": { "base":"E3E3E3", "logo":"FFFFFF", "cap":"FFFFFF", "capLogo":"FFFFFF", "shirtTrim":"FFFFFF", "socks":"FFFFFF", 
      "undershirt":"FFFFFF", "pantsTrim":"FFFFFF", "belt":"FFFFFF", "number":"FFFFFF" },
    "homeUniformStyles": { "shirtType":"normal", "pantsType":"normal", "logoType":"chest", "numberType":"back" },
    "awayUniformStyles": { "shirtType":"normal", "pantsType":"normal", "logoType":"chest", "numberType":"back" } } );

                
  populateBlankRoster(selectedTeam.id);
}

function addTeam(hash){
  try{
  
  var div = document.createElement("div");  
  
  var teamNumber = numberOfTeams;
  if(deletedTeamNumbers.length > 0){
    teamNumber = deletedTeamNumbers.pop();
  }
  
  div.id = "team_"+teamNumber;
  div.setAttribute("onclick","javascript:selectTeam(this);");
  div.style.cursor = "hand";
  
  var info = document.createElement("span");
  info.id = "team_"+teamNumber+"_span";
  var removeButton = document.createElement("button");

  removeButton.setAttribute("onclick","if(!askConfirm()){return false;} removeTeam(this.parentNode);");
  removeButton.innerHTML = "Delete";
  
  if(hash["city"] == "" && hash["teamName"] == ""){
    info.innerHTML = "Team "+teamNumber;
  }else{
    info.innerHTML = hash["city"]+" "+hash["teamName"];
  }

  div.appendChild(info);
  div.appendChild(removeButton);
  
  document.getElementById('teams').appendChild(div);
  numberOfTeams += 1;
  
  //This adds players implicitly if they are in the hash
  //NOTE: This is crucial: If we add another team or player variable, we should put some code in here that 
  //      adds blank values for that key in each team or player so an old roster can be updated with a new variable.
  
  //EXAMPLE:
  /*
  hash["lineup"] = { 
    "1":{ "player":"team_0_player_12", "position":"CF" }, 
    "2":{ "player":"team_0_player_6", "position":"SS" }, 
    "3":{ "player":"team_0_player_10", "position":"LF" }, 
    "4":{ "player":"team_0_player_2", "position":"1B" }, 
    "5":{ "player":"team_0_player_14", "position":"RF" }, 
    "6":{ "player":"team_0_player_8", "position":"3B" }, 
    "7":{ "player":"team_0_player_4", "position":"2B" }, 
    "8":{ "player":"team_0_player_0", "position":"C" }, 
    "9":{ "player":"team_0_player_16", "position":"P" }
  };
  hash["battingOrder"] = null;
  hash["starters"] = null;
  
  for(i in hash["players"]){
    if( hash["players"][i]["position"] == "SP" || hash["players"][i]["position"] == "RP" ){
      hash["players"][i]["position"] = "P";
    }
  }

  hash["managerFirstName"] = "";
  hash["managerLastName"] = "";
  hash["managerNickname"] = "";
  for(i in hash["players"]){
    hash["players"][i]["nickname"] = "";
  }
  */
  
  rosterDataArray["teams"][div.id] = hash;
  selectTeam(document.getElementById(div.id));
  
  }catch(err){ alert(err); }
}

function removeTeam(div){
  deletedTeamNumbers.push( parseInt(div.id.replace("team_","")) );
  
  selectPlayer(null);
  selectTeam(null);
  
  rosterDataArray["teams"][div.id] = null;
  
  div.parentNode.removeChild(div);
     
  numberOfTeams -= 1;
}

function populateBlankRoster(teamId){  
  addBlankPlayer(0, "C", teamId); addBlankPlayer(1, "C", teamId);
  addBlankPlayer(2, "1B", teamId); addBlankPlayer(3, "1B", teamId);
  addBlankPlayer(4, "2B", teamId); addBlankPlayer(5, "2B", teamId);
  addBlankPlayer(6, "SS", teamId); addBlankPlayer(7, "SS", teamId);
  addBlankPlayer(8, "3B", teamId); addBlankPlayer(9, "3B", teamId);
  addBlankPlayer(10, "LF", teamId); addBlankPlayer(11, "LF", teamId);
  addBlankPlayer(12, "CF", teamId); addBlankPlayer(13, "CF", teamId);
  addBlankPlayer(14, "RF", teamId); addBlankPlayer(15, "RF", teamId);
  addBlankPlayer(16, "P", teamId); addBlankPlayer(17, "P", teamId);
  addBlankPlayer(18, "P", teamId); addBlankPlayer(19, "P", teamId);
  addBlankPlayer(20, "P", teamId); addBlankPlayer(21, "P", teamId);
  addBlankPlayer(22, "P", teamId); addBlankPlayer(23, "P", teamId);
  addBlankPlayer(24, "P", teamId);
  
  setDefaultTeamStartersAndOrder();
  
  //populateTeamPlayers();
  
  var st = selectedTeam;
  
  selectTeam(null);
  selectTeam(st);
}

function setDefaultTeamStartersAndOrder(){
  var prefix = selectedTeam.id+"_player_";
  var team = rosterDataArray["teams"][selectedTeam.id];
  
  team["lineup"] = { 
    "1":{ "player":"team_0_player_12", "position":"CF" }, 
    "2":{ "player":"team_0_player_6", "position":"SS" }, 
    "3":{ "player":"team_0_player_10", "position":"LF" }, 
    "4":{ "player":"team_0_player_2", "position":"1B" }, 
    "5":{ "player":"team_0_player_14", "position":"RF" }, 
    "6":{ "player":"team_0_player_8", "position":"3B" }, 
    "7":{ "player":"team_0_player_4", "position":"2B" }, 
    "8":{ "player":"team_0_player_0", "position":"C" }, 
    "9":{ "player":"team_0_player_16", "position":"P" }
  };
}

function addBlankPlayer(count, position, teamId){  
  addPlayerToTeam( count, { "position":position, "battingHand":"Right", "throwingHand":"Right", "height":"6'0\"", "weight":"200",
    "firstName":"Mr", "lastName":"Player", "nickname":"The Play", "number":count+1+"", "skinColor":"E8CBB5", "facialHairType":"None", "hairType":"Normal", "hairColor":"4A3231",
    "endurance":"7", "throwingArm":"7", "durability":"7", "runningSpeed":"7", "clutch":"7", "fielding":"7", 
    "battingPower":"7", "battingContact":"7", "pitchPower":"7", "pitchControl":"7", "pitchMovement":"7" }, teamId );
}

//Either adds a blank player or a player from a JSON file to the selected team.
function addPlayerToTeam(count, hash, teamId){
  var playerId = teamId+"_player_"+count;
  
  rosterDataArray["teams"][teamId]["players"][playerId] = hash;
}

function populateTeamPlayers(){
  document.getElementById('players').innerHTML = "";
  
  if(selectedTeam == null){ alert("Please select a team before populating players"); }

  var playersDiv = document.getElementById('players');
    
  var players = rosterDataArray["teams"][selectedTeam.id]["players"];
  
  var count = 0;
  for(i in players){
    var div = document.createElement("div");
    div.id = i;
    div.setAttribute("onclick","javascript:selectPlayer(this);");
    div.style.cursor = "hand";

    div.innerHTML = "#"+players[i]["number"]+" "+players[i]["position"]+" "+players[i]["firstName"]+" "+players[i]["lastName"];
  
    playersDiv.appendChild(div);  
    
    count += 1;
  }
  
  populateLineupPlayerSelector();
  populateLineupPositionSelector();
}

function clearAllFields(){
  document.getElementById('players').innerHTML = "";
  document.getElementById('teams').innerHTML = "";
  $("#sprites").html("");
  
  $("#teamLogoImage").css("backgroundImage","");
  $("#teamLogoImage").css("width","0px");
  $("#teamLogoImage").css("height","0px");
  $("#stadiumLogoImage").css("backgroundImage","");
  $("#stadiumLogoImage").css("width","0px");
  $("#stadiumLogoImage").css("height","0px");

  for(i in teamVariables){
    document.getElementById(teamVariables[i]).value = "";
  }

  for(i=1; i<=9; i++){
    document.getElementById("lineupPlayer_"+i).value = "";
  }
  
  for(i=1; i<=9; i++){
    document.getElementById('lineupPosition_'+i).value = "";
  }
  
  for(i in teamUniformColorTypes){
    document.getElementById('home_uniformColor_'+teamUniformColorTypes[i]).color.fromString("FFFFFF");
    document.getElementById('away_uniformColor_'+teamUniformColorTypes[i]).color.fromString("FFFFFF");
  }

  for(i in teamUniformVariables){
    document.getElementById('home_'+teamUniformVariables[i]).value = "";
    document.getElementById('away_'+teamUniformVariables[i]).value = "";
  }
  
  for(i in playerColors){
    document.getElementById(playerColors[i]).color.fromString("FFFFFF");
  }
  
  for(i in playerVariables){
    document.getElementById(playerVariables[i]).value = "";
  }
  
  for(i in playerAttributes){
    document.getElementById(playerAttributes[i]).value = "";
    processSliderChange( document.getElementById(playerAttributes[i]) );
  }
}
  
function populateSelectedTeamInfo(){
  populateTeamPlayers();

  //Populate text fields and what not
  var team = rosterDataArray["teams"][selectedTeam.id];
  
  for(i in teamVariables){
    document.getElementById(teamVariables[i]).value = team[teamVariables[i]];
  }
  populateWithSprite('teamLogoX', 'teamLogoY', 'teamLogoImage', true);
  populateWithSprite('stadiumLogoX', 'stadiumLogoY', 'stadiumLogoImage', true);
  
  for(i=1; i<=9; i++){
    document.getElementById('lineupPlayer_'+i).value = team["lineup"][i+""]["player"];
  }
  
  for(i=1; i<=9; i++){
    document.getElementById('lineupPosition_'+i).value = team["lineup"][i+""]["position"];
  }
  
  for(i in teamUniformColorTypes){
    document.getElementById('home_uniformColor_'+teamUniformColorTypes[i]).color.fromString( team["homeUniformColors"][teamUniformColorTypes[i]] );
    document.getElementById('away_uniformColor_'+teamUniformColorTypes[i]).color.fromString( team["awayUniformColors"][teamUniformColorTypes[i]] );
  }
  
  for(i in teamUniformVariables){
    document.getElementById('home_'+teamUniformVariables[i]).value = team["homeUniformStyles"][teamUniformVariables[i]];
    document.getElementById('away_'+teamUniformVariables[i]).value = team["awayUniformStyles"][teamUniformVariables[i]];
  }
}

function populateLineupPlayerSelector(){
  var i = 1;
  while(i<=9){
    createLineupPlayerSelectBox(i);
    i+=1;
  }
}

function populateLineupPositionSelector(){
  var i = 1;
  while(i<=9){
    createLineupPositionSelectBox(i);
    i+=1;
  }
}

function populateSelectedPlayerInfo(){
  var player = rosterDataArray["teams"][selectedTeam.id]["players"][selectedPlayer.id];
  
  for(i in playerVariables){
    document.getElementById(playerVariables[i]).value = player[playerVariables[i]];
  }
  
  for(i in playerColors){
    document.getElementById(playerColors[i]).color.fromString( player[playerColors[i]] );
  }

  for(i in playerAttributes){
    document.getElementById(playerAttributes[i]).value = player[playerAttributes[i]];
    processSliderChange( document.getElementById(playerAttributes[i]) );
  }
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

function createLineupPlayerSelectBox(number){
  if(selectedTeam == null){ alert("Please select a team before filling in starter selectors."); }
  
  var select = document.getElementById("lineupPlayer_"+number);
  
  select.options.length = 0;
  
  for(i in rosterDataArray["teams"][selectedTeam.id]["players"]){
    var player = rosterDataArray["teams"][selectedTeam.id]["players"][i];
    var option = document.createElement("option");
    option.text = "#"+player["number"]+" "+player["position"]+" "+player["firstName"]+" "+player["lastName"];
    option.value = i;
    select.options.add(option);
  }
}

function createLineupPositionSelectBox(number){
  if(selectedTeam == null){ alert("Please select a team before filling in batting order selectors."); }
  
  var select = document.getElementById("lineupPosition_"+number);
  
  select.options.length = 0;
  
  for(i in positions){
    var option = document.createElement("option");
    option.text = positions[i];
    option.value = positions[i];
    select.options.add(option);
  } 
}

function submitTeamChanges(){  
  if(selectedTeam == null){ alert("Please select a team before continuing."); }
  
  var team = rosterDataArray["teams"][selectedTeam.id];
  
  for(i in teamVariables){
    team[teamVariables[i]] = document.getElementById(teamVariables[i]).value;
  }
  
  for(i=1; i<=9; i++){
    team["lineup"][i]["player"] = document.getElementById('lineupPlayer_'+i).value; 
    team["lineup"][i]["position"] = document.getElementById('lineupPosition_'+i).value;  
  }
  
  for(i in teamUniformColorTypes){
    team["homeUniformColors"][teamUniformColorTypes[i]] = document.getElementById('home_uniformColor_'+teamUniformColorTypes[i]).value; 
    team["awayUniformColors"][teamUniformColorTypes[i]] = document.getElementById('away_uniformColor_'+teamUniformColorTypes[i]).value; 
  }

  for(i in teamUniformVariables){
    team["homeUniformStyles"][teamUniformVariables[i]] = document.getElementById('home_'+teamUniformVariables[i]).value;
    team["awayUniformStyles"][teamUniformVariables[i]] = document.getElementById('away_'+teamUniformVariables[i]).value;
  }

  document.getElementById(selectedTeam.id+"_span").innerHTML = team["city"] + " " + team["teamName"];
  
}

//Note: Submitting player changes also submits team changes
function submitPlayerChanges(){
  if(selectedPlayer == null){ alert("Please select a player before continuing."); }
  
  var player = rosterDataArray["teams"][selectedTeam.id]["players"][selectedPlayer.id];
  
  for(i in playerVariables){
    player[playerVariables[i]] = document.getElementById(playerVariables[i]).value;     
  }
  
  for(i in playerColors){
    player[playerColors[i]] = document.getElementById(playerColors[i]).value;     
  }
  
  for(i in playerAttributes){
    player[playerAttributes[i]] = document.getElementById(playerAttributes[i]).value;     
  }

  /* Let's keep this try catch in here for now */
  try{

  submitTeamChanges();
  var id = selectedPlayer.id;
  populateSelectedTeamInfo();
  selectPlayer(document.getElementById(id));
  
  }catch(err){ alert(err); }
}

function setSkinColor(color){
  document.getElementById('skinColor').color.fromString(color);
}

function setHairColor(color){
  document.getElementById('hairColor').color.fromString(color);
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

function selectTeam(obj){   
  if(obj == selectedTeam){ return; }
  if(obj == null){ document.getElementById('players').innerHTML = ""; }
  
  var prev = prevSelectedTeam;
  var selected = selectedTeam;
  
  prev = selected;
  selected = obj;
  if(selected != prev && selected != null){
    selected.style.background = "#FFAAAA";
  }
  if(prev != null && prev != selected){ 
    prev.style.background = "#FFFFFF";
  }
  
  prevSelectedTeam = prev;
  selectedTeam = selected;
  
  if(obj != null){ 
    populateSelectedTeamInfo();
  }
}

function selectPlayer(obj){   
  if(obj == selectedPlayer){ return; }
  
  var prev = prevSelectedPlayer;
  var selected = selectedPlayer;
  
  prev = selected;
  selected = obj;
  if(selected != prev && selected != null){
    selected.style.background = "#FFAAAA";
  }
  if(prev != null && prev != selected){ 
    prev.style.background = "#FFFFFF";
  }
  
  prevSelectedPlayer = prev;
  selectedPlayer = selected;
  
  if(obj != null){ 
    populateSelectedPlayerInfo();
  }
}