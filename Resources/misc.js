function larger(num1, num2){
  if(num1 > num2){ return num1; }else{ return num2; }
}

function smaller(num1, num2){
  if(num1 > num2){ return num2; }else{ return num1; }
}

function absoluteValue(num){
  if(num < 0){
    num *= -1;
  }
  return num;
}
	
function pointInRect(pX, pY, rectX, rectY, rectWidth, rectHeight){  //rectX and rectY are the top left origin
  if(pX >= rectX && pY >= rectY &&
     pX <= rectX + rectWidth && pY <= rectY + rectHeight){
    return true;
  }else{
     //Titanium.API.info("("+pX+","+pY+") != ("+rectX+","+rectY+"),("+rectWidth+","+rectHeight+")");
    return false;
  }
}

function showHide(id){
  var div = document.getElementById(id);
  if(div.style.display != 'none'){
    div.style.display = 'none';
  }else{
    div.style.display = 'block';
  }
}

function initMenu(){  
  var mainWindow = Titanium.UI.currentWindow;
  var mainMenu = createMainMenu();
  mainWindow.menu = mainMenu;
}

function setInnerSize(obj){
	var window_width = $(obj).css("width");
	var window_height = $(obj).css("height");

	$(obj).children(".window_inner").css("width",parseFloat(window_width));
	$(obj).children(".window_inner").css("height",parseFloat(window_height)-50);
}

function initWindow(win){
  $(win).draggable( { 
    drag: function(event, ui){
      ui.position.left += -8;
      ui.position.top += -8;
    },
    handle: 'div.title_bar', stack: ".window", snap:true } ); 
	$(win).resizable({ 
	  start: function(event, ui){ 
	    ui.position.left += -8;
      ui.position.top += -8;
	  },
	  minHeight: 50, minWidth: 50 });
  $(win).bind( "resize", function(event, ui) { 
		setInnerSize(this);
	});
	//Set initial window sizes:
	
	$(win).each(
		function(index) {
			setInnerSize(this);
		}
	);
}

function askConfirm(){
  var agree=confirm("Are you sure you want to delete?");
  if (agree){
    return true;
  }else{
    return false;
  }
}

function processSliderChange(obj){  
  if(obj.value > parseInt( $(".slider").slider("option","max") ) ){
    obj.value = parseInt( $(".slider").slider("option","max") );
  }else if(obj.value < parseInt( $(".slider").slider("option","min") ) ){
    obj.value = parseInt( $(".slider").slider("option","min") );
  }
  
  $("#"+obj.id+"Slider").slider( "value", obj.value );
}

function getHashSize(hash){
  var count = 0;
  for(i in hash){
    count += 1;
  }
  return count;
}