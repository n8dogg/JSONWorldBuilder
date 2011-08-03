/*
 * Triangulate 
 *
 * Based on J. O'Rourke's "Triangulate" algorithm in "Computational Geometry in C"
 * Implemented by Nicholas Wellcome for  Joe Mitchell's Computational Geometry class at Stony Brook University
 * v1.1 - 2/18/2009 - "Not terribly optimized but at least correct now"
 * v2.1 - 5/20/2010 - "Interactive with examples!"
 * v2.2 - 5/21/2010 - "Works in IE 8 using excanvas and jquery!"
 */
 
 
var tri_limiter = 999;  	//The max number of itterations for each loop, just in case
var tri_timer;				//The Triagulation algorithm speed tri_timer
var tri_verts = [];			//An array of vertecies
var tri_edges = [];   //The tri_edges
var tri_triangles = [];
var tri_P;					//The polygon we will be triangulating
var tri_triedReverse; //Whether or not you tried reversing the verts

//fill our global variables about the canvas
function tri_init() {
	tri_P = new polygon();
	tri_verts = [];
	tri_edges = [];
	tri_triangles = [];
	tri_triedReverse = false;
}

// The Polygon Class
function polygon() {
	//Local properties
	var head;
	var vertices = [];	//An array of the vertices
	var diagonals = [];	//An array of the diagonals to be draw
	
	//Public properties
	this.head;
	this.vertices = vertices;
	this.diagonals = diagonals;
	
	//Public Functions
	this.Add = Add;				//Add a vertex - O(1)
	this.EarInit = EarInit;			//Initialize the ear status of each vertex - O(n)
	this.Diagonalie = Diagonalie;		//Checks if diagonal ab intersects the boundry of the polygon - O(n) 
	this.Diagonal = Diagonal;		//Checks if diagonal ab is internal and does not intersect the boundary of the polygon - O(n)
	this.Triangulate = Triangulate;	//J. O'Rourke's "Triangulate" Alogrithm - O(n^2)
	
	//Add a vertex
	function Add(vert) {
		if(vertices.length==0) {
			head = vert;
			vert.next = vert;
			vert.prev = vert;
			vertices.push(vert);
			vert.name = vertices.length-1;
		} else {
			vertices[vertices.length-1].next = vert;  	//point old end to new guy
			vert.prev = vertices[vertices.length-1];  	//point new guy to old end
			vert.next = vertices[0];  				//point new guy to the begining
			vertices[0].prev = vert; 				//point beginning to new guy
			vertices.push(vert);
			vert.name = vertices.length-1;
		}
	}
	
	//Can a clearly see b - becase Intersect doesn't make this go all the time
	function Diagonalie(a,b) {
		var c,c1;
		c = head;
		do {
			c1 = c.next;
			if( (c!=a) && (c1!=a) && (c!=b) && (c1!=b) && IntersectProp(a.v, b.v, c.v, c1.v) ) {
				return false;
			}
			c = c.next;
		} while( c != head );
		return true;
	}
	
	//Is ab a diagonal
	function Diagonal(a,b) {
		return InCone(a,b) && InCone(b,a) && Diagonalie(a,b);
	}
	
	//Check the ear status of every vertex
	function EarInit() {
		var v0, v1, v2;
		v1 = vertices[0];
		do {
			v2 = v1.next;
			v0 = v1.prev;
			v1.ear = Diagonal(v0,v2);
			v1 = v1.next;
		} while(v1 != vertices[0]);
	}
	
	//Calculate the triangulation
	function Triangulate() {
	  for (i=0; i < vertices.length-1; i++) {
	    tri_edges.push([vertices[i], vertices[i+1]]);
	  }
	  tri_edges.push([vertices[vertices.length-1], vertices[0]]);
	  
		var startTime = new Date().getTime();
		var v0, v1, v2, v3, v4;
		var n = vertices.length;
		this.EarInit();
		z = tri_limiter;
		while( z > 0 && n > 3) {
			z -= 1;
			v2 = head;
			y = tri_limiter;
			do {
				y -= 1;
				broke = false; 		//The javascript "break" does not mean the same thing as the C "break"
				if( v2.ear ) {
					v3 = v2.next;
					v4 = v3.next;
					v1 = v2.prev;
					v0 = v1.prev;
					
					//alert("Found diagonal: ("+v1.v.x+","+v1.v.y+") ("+v2.v.x+","+v2.v.y+") ("+v3.v.x+","+v3.v.y+")");
					
					diagonals.push([v1,v3]);
					tri_edges.push([v1,v3]);
					v1.ear = Diagonal(v0,v3);
					v3.ear = Diagonal(v1,v4);
					v1.next = v3;
					v3.prev = v1;
					head = v3; //In case we cut out the head!
					n--;
					broke = true;
				}
				v2 = v2.next;
			} while( y > 0 && !broke && v2 != head );
		}

		for(i in vertices){
		  //Find any connected nodes
		  var connectedNodes = [];
		  for(j in tri_edges){
		    if(tri_edges[j][0].name == vertices[i].name){
		      connectedNodes.push(tri_edges[j][1]);
		    }else if(tri_edges[j][1].name == vertices[i].name){
		      connectedNodes.push(tri_edges[j][0]);
		    }
		  }
		  
		  //If more than two connected nodes
		  if(connectedNodes.length >= 2){
		    //Are any of these nodes connected themselves?
		    //Check all possible combinations
		    for (g=0; g < connectedNodes.length-1; g++) {
		      for (h=1; h < connectedNodes.length; h++) {
		        for(k in tri_edges){
		          //Check both tri_edges against this node combination
    		      if(tri_edges[k][0].name == connectedNodes[g].name && tri_edges[k][1].name == connectedNodes[h].name){
    		        if(!hasTriangle( vertices[i], connectedNodes[g], connectedNodes[h])){
    		          tri_triangles.push([ vertices[i], connectedNodes[g], connectedNodes[h] ]);
    		        }
//    		      }else if(tri_edges[k][1].name == connectedNodes[g].name && tri_edges[k][0].name == connectedNodes[h].name){
//    		        tri_triangles.push([ vertices[i], connectedNodes[h], connectedNodes[g] ]);
//    		        $("#output").append("<br>Found Triangle!");
    		      }
    		    }
    		  }
		    }
		  }
		}
		  
		//If this completely failed to find 1 triangle then we reverse the node order and try again
		if(tri_triangles.length < 1 && tri_verts.length >= 3 && !tri_triedReverse){
		  tri_triedReverse = true;
		  tri_triangles = [];
		  
	    tri_P = new  polygon();
	    for(var p = (tri_verts.length-1); p>=0; p--) {
		    tri_P.Add(tri_verts[p]);
	    }
    	tri_P.Triangulate();
		  //tri_verts = tri_verts.reverse();

		  return;
		}
		    
		
		//NOW we have all vertices and tri_edges. Now we need to get all tri_triangles and display them.
		
		tri_timer = new Date().getTime() - startTime;
	}
}

function hasTriangle( v1, v2, v3 ){
  //This is dumb, but, whatever.
  
  //NOTE: I originally had this var name as 'i'. That was no good. Had to change it to z. Weird...
  
  for(z in tri_triangles){
    var tri = tri_triangles[z];
    if(tri[0].name == v1.name){
      if(tri[1].name == v2.name){
        if(tri[2].name == v3.name){
          return true;  //1,2,3
        }
      }else if(tri[1].name == v3.name){
        if(tri[2].name == v2.name){
          return true;  //1,3,2
        }
      }
    }else if(tri[0].name == v2.name){
      if(tri[1].name == v1.name){
        if(tri[2].name == v3.name){
          return true;  //2,1,3
        }
      }else if(tri[1].name == v3.name){
        if(tri[2].name == v1.name){
          return true;  //2,3,1
        }
      }
    }else if(tri[0].name == v3.name){
      if(tri[1].name == v1.name){
        if(tri[2].name == v2.name){
          return true;  //3,1,2
        }
      }else if(tri[1].name == v2.name){
        if(tri[2].name == v1.name){
          return true;  //3,2,1
        }
      }
    }
  }
  return false;
}

//The Point Class
function tPointi(x,y) {
	var x,y;
	this.x=parseInt(x); //The x coordinate
	this.y=parseInt(y); //The y coordinate
}

//The Vertex Class
function tVertex(v,next,prev) {
	var v,next,prev,ear;
	this.ear = false;
	this.v=v;		 //the vertex, a tPointi
	if(next) this.next=next; //the next vertex, a tVetrex
	if(prev) this.prev=prev; //the prev vertex, a tVertex
}

//Calulates the signed area via cross product
function Area2(a,b,c) {
	return( (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) );
}
//Is vertex c left of line ab
function Left(a,b,c) {
	return( Area2(a,b,c) > 0 );
}

//Is vertex c left or on line ab
function LeftOn(a,b,c) {
	return( Area2(a,b,c) >= 0 );
}

//Are vertices a b and c collinear
function Collinear(a,b,c) {
	return( Area2(a,b,c) == 0 );
}

//Is line ab interal
function InCone(a,b) {
	var a0,a1;
	a1 = a.next;
	a0 = a.prev;
	
	if( LeftOn(a.v, a1.v, a0.v) ) return( Left(a.v, b.v, a0.v) && Left(b.v, a.v, a1.v) );
	return( !( LeftOn(a.v, b.v, a1.v) && LeftOn(b.v, a.v, a0.v)) );
}

//Check between - this doesn't appear to work correctly
function Between(a,b,c) {
	if( Collinear(a,b,c) ) 
		return false;
	if( a.x != b.x) {
		return (((a.x <= c.x) && (c.x <= b.x)) || ((a.x >= c.x) && (c.x >= b.x)));
	} else { 
		return (((a.y <= c.y) && (c.y <= b.y)) || ((a.y >= c.y) && (c.y >= b.y)));						     
	}
}

//Exclusive Or
function XOR(a,b) {
	return ( a || b ) && !( a && b );
}

//Check proper intersection
function IntersectProp(a,b,c,d) {
	if(Collinear(a,b,c) || Collinear(a,b,d) || Collinear(c,d,a) || Collinear(c,d,b)) 
		return false;
	return XOR( Left(a,b,c), Left(a,b,d) ) && XOR( Left(c,d,a), Left(c,d,b));
}

//Check intersection - this doesn't appear to work  either
function Intersect(a,b,c,d) {
	if(IntersectProp(a,b,c,d)) {
		return true;
	} else { 
		if (Between(a,b,c) || Between(a,b,d) || Between(c,d,a) || Between(c,d,b) ) { 
			return true;
		} else {
			return false;
		}
	}
}

//For sorting by angle
function compareAngular(a,b) {
	var ax = a.v.x - tri_verts[0].v.x;
	var ay = a.v.y - tri_verts[0].v.y;
	var bx = b.v.x - tri_verts[0].v.x;
	var by = b.v.y - tri_verts[0].v.y;
	var areaTrapezoid = ax*by - ay*by;
	console.log(areaTrapezoid);
	if(areaTrapezoid > 0) return 1;
	if(areaTrapezoid == 0) return 0;
	return -1;
}

function triangulate() {  
	tri_P = new  polygon();
	for(var i = 0; i<tri_verts.length; i++) {
		tri_P.Add(tri_verts[i]);
	}
	tri_P.Triangulate();
}