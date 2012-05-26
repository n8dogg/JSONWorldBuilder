//Constants
var Windows = { "buttons" : 0, "map" : 1, "nav" : 2, "meta" : 3, "sprites" : 4 };
var Tools = { "none" : 0, "spriteSelector" : 1, "shapeSelector" : 2, "moveCamera" : 3, "spriteStamp" : 4, "drawTiledSprite" : 5, 
  "createPoint" : 6, "createLine" : 7, "createPolygon" : 8, "drawMask" : 9 };

//Global objects (they need to be referenced via MAIN WINDOW)
var showGrid = false;
var showShapes = true;
var showSprites = true;

var drawing = false; //Are we currently drawing something?
var clickedX = null;  //Where we intiially clicked
var clickedY = null;
var polygonStartX = null; //Where the polygon starts and ends
var polygonStartY = null;
var drawnLines = [];  //Lines we are storing during drawing.

var textureArray = null;  //Where we store our loaded in textures
var resourcesDirectory = null;
var plistTextureKeys = [];
var plistFiles = [];

var mapDataArray = {};

var selectedMapObject = null;
var prevSelectedMapObject = null;
var selectedSprite = null;
var prevSelectedSprite = null;
var selectedSpriteX = null; //These are actually the identifiers to find this sprite within textureArray (textureArray[x][y])
var selectedSpriteY = null;

var selectedTool = 0;

var mapObjectCount = 0;

var defaultScrollSensitivity; //This is set initially
var zoom = 100;
var nodeDragCounter = 0;
var lastLeft = 0;
var lastTop = 0;

var spriteHighestZ = 25000;
var spriteLowestZ = 25000;
var shapeHighestZ = 35000;
var shapeLowestZ = 35000;

var numberOfMetaFields = 1; //Number of meta fields

var maskFileCount = 0;  //The number of mask files in existence, this can change.
var maskFiles = []; //Here we hold our mask files, this is similar to textureArray

var gridSize = 5;  //The size of the grid to snap to. This needs to be 5 because 5 is the border size. If this isn't the case, bad things happen.

var undoStack = new Array(); //These hold function calls
var redoStack = new Array();

var mapDiskLocation = null;  //For saving maps

/* These are temporary variables used for loading nodes from a map file */
var openingMap = false; //Whether or not we are in the process of opening a map
var openMapOriginX = null;
var openMapOriginY = null;
var openMapZIndex = null;
var openMapWidth = null;
var openMapHeight = null;
var openMapDrawnLines = null;
var openMapFlipX = null;
var openMapFlipY = null;

/* Keyboard modifiers */
var shiftPressed = false;
var controlPressed = false;

function resetGlobals(){
  maskFileCount = 0;
  maskFiles = []; 
  
  mapObjectCount = 0;
  zoom = 100;
  nodeDragCounter = 0;
  lastLeft = 0;
  lastTop = 0;
  
  undoStack = new Array();
  redoStack = new Array();
  
  spriteHighestZ = 25000;
  spriteLowestZ = 25000;
  shapeHighestZ = 35000;
  shapeLowestZ = 35000;
  textureArray = null;
  resourcesDirectory = null;
  plistTextureKeys = [];
  plistFiles = [];
  
  mapDataArray = {};
  mapDataArray["mapNodes"] = {};
  mapDataArray["mapObjectCount"] = 0;
  
  selectedMapObject = null;
  prevSelectedMapObject = null;
  selectedSprite = null;
  prevSelectedSprite = null;
  selectedSpriteX = null;
  selectedSpriteY = null;
  
  openingMap = false;
  openMapOriginX = null;
  openMapOriginY = null;
  openMapZIndex = null;
  openMapWidth = null;
  openMapHeight = null;
  openMapDrawnLines = null;
  openMapFlipX = null;
  openMapFlipY = null;
}

function init() {
	//Set initial zoom	
	initMenu();
	initHandlers();
	
  initWindow(".window");
	defaultScrollSensitivity = $( ".spriteNode" ).draggable("option", "scrollSensitivity");
  
  setZoom(100);

  mapDataArray = {};
  mapDataArray["mapNodes"] = {};
  mapDataArray["mapObjectCount"] = 0;
  setCanvasSize();
  
  toolsSelectTool(Tools.none);
};

function initHandlers(){
  $('#map_window_inner').bind('click', function(e){    
    if(selectedTool == Tools.spriteSelector){

    }else if(selectedTool == Tools.shapeSelector){

    }else if(selectedTool == Tools.moveCamera){
  
    }else if(selectedTool == Tools.spriteStamp){
      createSprite(selectedSpriteX, selectedSpriteY, e);
    }else if(selectedTool == Tools.drawTiledSprite){
    
    }else if(selectedTool == Tools.createPoint){
      createPoint(e);
    }else if(selectedTool == Tools.createLine){
  
    }else if(selectedTool == Tools.createPolygon){
      if(!drawing){
        startPolygon(e);
      }else if(polygonFinishClicked(e)){
        finishPolygon(e);
      }else{
        drawPolygonLine(e,true);
      }
    }else if(selectedTool == Tools.drawMask){
      if(!drawing){
        startMask(e);
      }else if(polygonFinishClicked(e)){
        finishMask(e);
      }else{
        drawMaskLine(e,true);
      }
    }
  });
  
  $('#map_window_inner').bind('mousedown', function(e){
    if(selectedTool == Tools.drawTiledSprite){
      startTiledSprite(e);
    }else if(selectedTool == Tools.createLine){
      startLine(e);
    }else if(selectedTool == Tools.moveCamera){
      startMoveCamera(e);
    }
  });
  
  $('#map_window_inner').bind('mouseup', function(e){
    if(selectedTool == Tools.drawTiledSprite){
      finishTiledSprite(e);
    }else if(selectedTool == Tools.createLine){
      finishLine(e);
    }else if(selectedTool == Tools.moveCamera){
      finishMoveCamera(e);
    }
  });
  
  $('#map_window_inner').bind('mousemove', function(e){
    if(selectedTool == Tools.spriteSelector){
      if(selectedMapObject != null && nodeDragCounter > 0){
        setMapObjectPositionInfo();
      }
    }else if(selectedTool == Tools.shapeSelector){
      if(selectedMapObject != null && nodeDragCounter > 0){
        setMapObjectPositionInfo();
      }
    }else if(selectedTool == Tools.drawTiledSprite){
      if(drawing){
        drawTiledSprite(e);
      }
    }else if(selectedTool == Tools.createLine){
      if(drawing){
        drawLine(e);
      }
    }else if(selectedTool == Tools.createPolygon){
      if(drawing){
        drawPolygonLine(e,false);
      }
    }else if(selectedTool == Tools.moveCamera){
      if(movingCamera){
        moveCamera(e);
      }
    }else if(selectedTool == Tools.drawMask){
      if(drawing){
        drawMaskLine(e,false);
      }
    }
  });
  
  $('#tools').bind('click', function(e){
  
  });

  $('#buttons').bind('click', function(e){
  
  });

  $('#meta').bind('click', function(e){
  
  });

  $('#nav').bind('click', function(e){
  
  });

  $('#sprites').bind('click', function(e){
  
  });
}

function initNodeDrag(node){
	$(node).draggable({
	  scroll: true,
		disabled: true,
		distance: 10,
		start: function(event, ui) {
		  var nodeLeft = node.style.left; var nodeTop = node.style.top;
	  	undoStack.push( function(){ node.style.left = nodeLeft; node.style.top = nodeTop; } );
		},
		
		stop: function(event, ui) {
			nodeDragCounter = 0;
			lastLeft = 0;
			lastTop = 0;
		},
		
 		drag: function(event, ui) { 
			if(nodeDragCounter < 1){
				lastLeft = ui.position.left;
				lastTop = ui.position.top;
			}else{
			  if(zoom < 100){
					var zoomMod = (zoom/100+1); //I honestly don't know why this helps, but, it does.
					ui.position.left += (ui.position.left - lastLeft) / (zoom*zoomMod/100);
					ui.position.top += (ui.position.top - lastTop) / (zoom*zoomMod/100);
				}
			}

			nodeDragCounter += 1;
		}
	});
}

function createMainMenu(){
  var mainMenu = Titanium.UI.createMenu();
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("File"));
  var fileMenu = Titanium.UI.createMenu();
  fileMenu.appendItem(Titanium.UI.createMenuItem("New", function() { fileNew(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Open", function() { fileOpen(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Save (CTRL+S)", function() { fileSave(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Save As", function() { fileSaveAs(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Close", function() { fileClose(); }));
  fileMenu.appendItem(Titanium.UI.createMenuItem("Quit", function() { fileQuit(); }));
  mainMenu.getItemAt(0).setSubmenu(fileMenu);
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Edit"));
  var editMenu = Titanium.UI.createMenu();
  editMenu.appendItem(Titanium.UI.createMenuItem("Undo (CTRL+Z)", function() { editUndo(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Redo", function() { editRedo(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Delete Selected", function() { editDeleteSelected(null, false); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Copy Selected", function() { editCopySelected(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Paste Selected", function() { editPasteSelected(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Bring To Front", function() { editBringToFront(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Bring Forward", function() { editBringForward(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Send Backward", function() { editSendBackward(); }));
  editMenu.appendItem(Titanium.UI.createMenuItem("Send To Back", function() { editSendToBack(); }));
  mainMenu.getItemAt(1).setSubmenu(editMenu);
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("View"));
  var viewMenu = Titanium.UI.createMenu();
  viewMenu.appendItem(Titanium.UI.createMenuItem("Show Grid", function() { viewShowHideGrid(); }));
  viewMenu.appendItem(Titanium.UI.createMenuItem("Hide Shapes", function() { viewShowHideShapes(); }));
  viewMenu.appendItem(Titanium.UI.createMenuItem("Hide Sprites", function() { viewShowHideSprites(); }));
  mainMenu.getItemAt(2).setSubmenu(viewMenu);
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Map"));
  var mapMenu = Titanium.UI.createMenu();
  mapMenu.appendItem(Titanium.UI.createMenuItem("Edit Map Properties", function() { mapEditMapProperties(); }));
  mainMenu.getItemAt(3).setSubmenu(mapMenu);
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Tools"));
  var toolsMenu = Titanium.UI.createMenu();
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Sprite Selector", function() { toolsSelectTool(Tools.spriteSelector); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Shape Selector", function() { toolsSelectTool(Tools.shapeSelector); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Move Camera", function() { toolsSelectTool(Tools.moveCamera); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Sprite Stamp", function() { toolsSelectTool(Tools.spriteStamp); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Draw Tiled Sprite", function() { toolsSelectTool(Tools.drawTiledSprite); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Create Point", function() { toolsSelectTool(Tools.createPoint); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Create Line", function() { toolsSelectTool(Tools.createLine); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Create Polygon", function() { toolsSelectTool(Tools.createPolygon); }));
  toolsMenu.appendItem(Titanium.UI.createMenuItem("Draw Mask", function() { toolsSelectTool(Tools.drawMask); }));
  mainMenu.getItemAt(4).setSubmenu(toolsMenu);  
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Editors"));
  var editorsMenu = Titanium.UI.createMenu();
  editorsMenu.appendItem(Titanium.UI.createMenuItem("Roster Editor", function() { editorsRoster(); }));
  editorsMenu.appendItem(Titanium.UI.createMenuItem("Animation Editor", function() { editorsAnimation(); }));
  mainMenu.getItemAt(5).setSubmenu(editorsMenu);
  
  mainMenu.appendItem(Titanium.UI.createMenuItem("Resources"));
  var resourcesMenu = Titanium.UI.createMenu();
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Specify Resource Folder", function() { try{ resourcesSpecifyResourceFolder(); }catch(err){alert(err);} }));
  resourcesMenu.appendItem(Titanium.UI.createMenuItem("Reload Resources", function() { resourcesReloadResources(); }));
  mainMenu.getItemAt(6).setSubmenu(resourcesMenu); 
  
  return mainMenu;
}