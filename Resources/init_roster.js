//Constants

var Windows = { "main" : 0, "sprites" : 1 };
var positions = ["C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "P"];
var teamVariables = ["city", "teamName", "teamShortName", "league", "stadiumName", "stadiumFile", "stadiumLocation", "teamLogoX",
  "teamLogoY", "stadiumLogoX", "stadiumLogoY", "managerFirstName", "managerLastName", "managerNickname"];
var teamUniformColorTypes = ["logoBase", "logoTrim", "cap", "capLogo", "shirtTrim", "socks", "undershirt", "pantsTrim",
  "belt", "number"];
var teamUniformVariables = ["shirtType", "pantsType", "logoType", "numberType"];
var playerColors = ["skinColor", "hairColor"];
var playerAttributes = ["endurance", "throwingArm", "fielding", "durability", "runningSpeed", "clutch", "battingPower",
  "battingContact", "pitchPower", "pitchControl", "pitchMovement"];
var playerVariables = ["position", "battingHand", "throwingHand", "height", "weight", "firstName", "lastName",
  "nickname", "number", "facialHairType", "hairType"];

var textureArray = null;  //Where we store our loaded in textures
var resourcesDirectory = null;
var plistTextureKeys = [];
var plistFiles = [];

var rosterDataArray = {};

var selectedSprite = null;
var prevSelectedSprite = null;
var selectedSpriteX = null; //These are actually the identifiers to find this sprite within textureArray (textureArray[x][y])
var selectedSpriteY = null;

var numberOfTeams = 0;
var deletedTeamNumbers = [];  //We hold all deleted team numbers here so we can reuse them.
var selectedTeam = null;
var prevSelectedTeam = null;
var selectedPlayer = null;
var prevSelectedPlayer = null;

function resetGlobals(){
  textureArray = null;  //Where we store our loaded in textures
  resourcesDirectory = null;
  plistTextureKeys = [];
  plistFiles = [];
  
  rosterDataArray = {};
  rosterDataArray["teams"] = {};
  
  selectedSprite = null;
  prevSelectedSprite = null;
  selectedSpriteX = null;
  selectedSpriteY = null;
  
  numberOfTeams = 0;
  deletedTeamNumbers = [];
  selectedTeam = null;
  prevSelectedTeam = null;
  selectedPlayer = null;
  prevSelectedPlayer = null;
}

function init() {
	initMenu();
	initHandlers();
	
  resetGlobals();
	
  initWindow(".window");
  
  initSliders();
}

function initHandlers(){

}

function initSliders(){
  $(".slider").slider({ min:1, max:10, step:1, value:1 });
  $(".slider").slider({
   slide: function(event, ui) { 
     document.getElementById(this.id.replace("Slider","")).value = ui.value;
   }
 });
}

function createMainMenu(){
  var mainMenu = Titanium.UI.createMenu();

  mainMenu.appendItem(Titanium.UI.createMenuItem("File"));
  var fileMenu = Titanium.UI.createMenu();
  fileMenu.appendItem(Titanium.UI.createMenuItem("Open Roster File", function() { fileOpenRosterFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Save Roster File", function() { fileSaveRosterFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Close Roster File", function() { fileCloseRosterFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Quit", function() { fileQuit(); }));
  mainMenu.getItemAt(0).setSubmenu(fileMenu); 
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Resources"));
  var resourcesMenu = Titanium.UI.createMenu();
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Specify Resource Folder", function() { try{ resourcesSpecifyResourceFolder(); }catch(err){alert(err);} }));
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Reload Resources", function() { resourcesReloadResources(); }));
  mainMenu.getItemAt(1).setSubmenu(resourcesMenu); 
  
  return mainMenu;
}