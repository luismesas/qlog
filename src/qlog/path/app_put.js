var qlog = require('../qlog.js')
;

module.exports = function (req, res, next){

	qlog.app.create(
		req.pastry.data.uid
	, 	req.body.n
	, 	req.body.cb
	, 
		function (err, data){
			if ( err ) {
				console.log( err );
				res.writeHead(500);
				res.end();
			}
			else {
				res.writeHead(200);
				res.end( JSON.stringify({appId: data[0]._id}) );
			}
		}
	);

};
