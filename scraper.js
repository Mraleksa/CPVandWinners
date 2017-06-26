var client = require('http-api-client');
const fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

// Open a database handle
var db = new sqlite3.Database("data.sqlite");

var currentCount =  "2017-05-05T09:59:03.623987+03:00"
var p=0; var p2=0;var description,status,cpv;
 
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

description = data.getJSON().data.title.toLowerCase();
status = data.getJSON().data.status;
cpv = data.getJSON().data.items[0].classification.id;				
					
db.serialize(function() {
db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,description TEXT,status TEXT,cpv TEXT)");
var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?)");
statement.run(item.dateModified,description,status,cpv);
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
