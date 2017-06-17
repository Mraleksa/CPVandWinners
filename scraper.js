var client = require('http-api-client');
var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");

var start =  "2017-01-01T00:00:0.000000+03:00"
var p=0; var p2=0;
 
function piv(){  
p++;
client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts?offset='+start})
      .then(function (data) {
		var dataset = data.getJSON().data;		
		start = data.getJSON().next_page.offset;								
		console.log(start);			
		return dataset;
	})	
	.then(function (dataset) {			
		dataset.forEach(function(item) {
		client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts/'+item.id})
		.then(function (data) {	
//////////SQLite//////////////
var change = data.getJSON().data.changes[data.getJSON().data.changes.length-1].rationaleTypes[0];
if(change=="itemPriceVariation"){	
	var lotIdContracts = data.getJSON().data.items[0].relatedLot;
	var dateSigned = data.getJSON().data.dateSigned;
	var description = data.getJSON().data.items[0].description;
	var cpv = data.getJSON().data.items[0].classification.id;
	var winner = data.getJSON().data.suppliers[0].name;
	var winnerAdress = data.getJSON().data.suppliers[0].contactPoint.email;
	var amount = data.getJSON().data.value.amount;	
	client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+data.getJSON().data.tender_id})
		.then(function (data) {
		var startAmount;
		if(data.getJSON().data.lots==undefined){
		startAmount = data.getJSON().data.value.amount;
		//console.log(startAmount)
		}
		else {
		for (var i = 1; i <= data.getJSON().data.lots.length; i++) {
		if(lotIdContracts==data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].id){
		startAmount =  data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].value.amount
		};			
	   }
	   
	//console.log(startAmount)
	}
	db.serialize(function() {	
	db.run("CREATE TABLE IF NOT EXISTS data (key TEXT,cpv TEXT,name TEXT,contactPoint TEXT,contractID TEXT,startAmount INT,amount INT)");
		
	//db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,dateSigned TEXT,tenderID TEXT,procuringEntity TEXT,numberOfBids INT,startAmount INT,amount INT,cpv TEXT)");
	var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?)");
	//var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?)"); 	
	statement.run(description,cpv,data.getJSON().data.tenderID,winner,winnerAdress,startAmount,amount);
	
	//statement.run(item.dateModified,dateSigned,
	//data.getJSON().data.tenderID,data.getJSON().data.procuringEntity.name,data.getJSON().data.numberOfBids,
	//startAmount,amount,data.getJSON().data.items[0].classification.description);
	//console.log(change);
	statement.finalize();
	});
	})
	.catch(function  (error) {								
	});  
	}
//////////SQLite//////////////	
	})
	.catch(function  (error) {
		//console.log("error_detale2")				
	});  
	});	
	})
	.catch(function  (error) {
		//console.log("error_detale3")				
	})
	.then(function () {	
		if (p<1){piv ();}		
		else {
			console.log("stop")
				p=0;
				p2++;
				console.log(p2)
			setTimeout(function() {
			
				if (p2 < 1) {
					piv ();
				}
				else {console.log("STOP")}
				}, 5000);
		}								
		})
	.catch( function (error) {
		console.log("error")
		piv ();
	});   					
}

piv ();	
