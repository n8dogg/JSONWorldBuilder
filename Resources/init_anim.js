var Windows = { "main" : 0, "sprites" : 1 };

var textureArray = null;  //Where we store our loaded in textures
var resourcesDirectory = null;
var plistTextureKeys = [];
var plistFiles = [];

var animationDataArray = {};

var selectedSprite = null;
var prevSelectedSprite = null;
var selectedSpriteX = null; //These are actually the identifiers to find this sprite within textureArray (textureArray[x][y])
var selectedSpriteY = null;

var numberOfAnimations = 0;
var deletedAnimationNumbers = [];  //We hold all deleted team numbers here so we can reuse them.
var selectedAnimation = null;
var prevSelectedAnimation = null;

var numberOfFrames = 0;

function resetGlobals(){
  textureArray = null;  //Where we store our loaded in textures
  resourcesDirectory = null;
  plistTextureKeys = [];
  plistFiles = [];
  
  animationDataArray = {};
  animationDataArray["animations"] = {};
  
  selectedSprite = null;
  prevSelectedSprite = null;
  selectedSpriteX = null;
  selectedSpriteY = null;
  
  numberOfAnimations = 0;
  deletedAnimationNumbers = [];
  selectedAnimation = null;
  prevSelectedAnimation = null;
  
  numberOfFrames = 0;
}

function init() {
	initMenu();
	initHandlers();
	
  resetGlobals();
	
  initWindow(".window");
}

function initHandlers(){

}

function createMainMenu(){
  var mainMenu = Titanium.UI.createMenu();

  mainMenu.appendItem(Titanium.UI.createMenuItem("File"));
  var fileMenu = Titanium.UI.createMenu();
  fileMenu.appendItem(Titanium.UI.createMenuItem("Open Animations File", function() { fileOpenAnimationFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Save Animations File", function() { fileSaveAnimationFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Close Animations File", function() { fileCloseAnimationFile(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Quit", function() { fileQuit(); }));
  mainMenu.getItemAt(0).setSubmenu(fileMenu); 
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Resources"));
  var resourcesMenu = Titanium.UI.createMenu();
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Specify Resource Folder", function() { try{ resourcesSpecifyResourceFolder(); }catch(err){alert(err);} }));
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Reload Resources", function() { resourcesReloadResources(); }));
  mainMenu.getItemAt(1).setSubmenu(resourcesMenu); 
  
  return mainMenu;
}