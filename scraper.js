var client = require('http-api-client');
const fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

// Open a database handle
var db = new sqlite3.Database("data.sqlite");

var currentCount =  "2017-07-18T16:02:44.083417+03:00"
var p=0; var p2=0;var description,status,cpv,name,winner,region,mail,edr,tenderID,amount;
 
function piv(){  
p++;
client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders?offset='+currentCount})
		.then(function (data) {
			var dataset = data.getJSON().data;			
			currentCount = data.getJSON().next_page.offset;			
			console.log(currentCount)			
			return dataset;
		})	
		.then(function (dataset) {			
			dataset.forEach(function(item) {
				client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+item.id})
					.then(function (data) {

status = data.getJSON().data.status;
tenderID = data.getJSON().data.tenderID;
name = data.getJSON().data.procuringEntity.name;
dateModified = item.dateModified;
					
	
if(data.getJSON().data.status=="complete")	{
	
	var q;
	for (q = 0; q < data.getJSON().data.contracts.length; q++) {
		
		description = data.getJSON().data.contracts[q].items[0].description.toLowerCase();
		cpv = data.getJSON().data.contracts[q].items[0].classification.id;
		mail = data.getJSON().data.contracts[q].suppliers[0].contactPoint.email;
		edr = data.getJSON().data.contracts[q].suppliers[0].identifier.id;
		winner = data.getJSON().data.contracts[q].suppliers[0].name;
		region = data.getJSON().data.contracts[q].suppliers[0].address.region;
		amount = data.getJSON().data.contracts[q].value.amount;
		
		//console.log(cpv)
		
		
	};
				
}
else {
		description = data.getJSON().data.items[0].description.toLowerCase();
		cpv = data.getJSON().data.items[0].classification.id;
		mail = "";
		edr = "";
		winner = "";
		region = "";
		amount = 0;
};

					
db.serialize(function() {
db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,tenderID TEXT,status TEXT,name TEXT,description TEXT,cpv TEXT,mail TEXT,edr TEXT,winner TEXT,region TEXT,amount INT)");
var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?,?,?,?)");
statement.run(dateModified.replace(/T.*/, ""),tenderID,status,name,description,cpv,mail,edr,winner,region,amount);
statement.finalize();
});
					//.replace(/\s.*/, "")
					
			
					})
					.catch(function  (error) {
						console.log("error_detale")
						
					});  
				});
		
		})
		.then(function () {	
		if (p<10){piv ();}		
		else {
			console.log("stop")
				p=0;
				p2++;
				console.log(p2)
			setTimeout(function() {
			
				if (p2 <500) {
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
