var client = require('http-api-client');
const fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

// Open a database handle
var db = new sqlite3.Database("data.sqlite");

var currentCount =  "2017-02-14T00:00:00.623987+03:00"
var p=0; var p2=0;var description,status,cpv,name,winner,region,mail,edr,tenderID;
 
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

if(data.getJSON().data.status=="complete")	{
	console.log(status)
	/*for (var i = 1; i <= data.getJSON().data.contracts.length; i++) {
		description = data.getJSON().data.contracts[0].items.description.toLowerCase();
		cpv = data.getJSON().data.contracts[0].items.classification.id;
		mail = data.getJSON().data.contracts[0].suppliers.contactPoint.email;
		edr = data.getJSON().data.contracts[0].suppliers.identifier.id;
		winner = data.getJSON().data.contracts[0].suppliers.name;
		region = data.getJSON().data.contracts[0].suppliers.address.region;
		
	};
	*/			
}
else {
		description = data.getJSON().data.items[0].classification.description;
		cpv = data.getJSON().data.items[0].classification.id;
		mail = "";
		edr = "";
		winner = "";
		region = "";
};

				
					
db.serialize(function() {
db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,tenderID TEXT,status TEXT,name TEXT,description TEXT,cpv TEXT,mail TEXT,edr TEXT,winner TEXT,region TEXT)");
var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?,?,?)");
statement.run(item.dateModified,tenderID,status,name,description,cpv,mail,edr,winner,region);
statement.finalize();
});
			
					})
					.catch(function  (error) {
						console.log("error_detale")
						
					});  
				});
		
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
