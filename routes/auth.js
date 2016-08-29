var bcrypt = require('bcrypt');
var Users = require('users');
exports.check = function(email,pass, callback){
	console.log("Class auth and function check");
//	console.log("values");
//	console.log(email);
//	console.log(pass);
	Users.findOne({email: email}, 'id pass']).then(function(gethash){
		if(gethash){
			bcrypt.compare(pass, gethash.pass, function(err, res) {
				if(res){
					
					db.Users.count({email: email}).then(function(co){
						console.log(co);
						if(co == 1){
							retdata = {
									'uid': gethash.dataValues.id,
									'ret': 'true'
							}
							callback(err,retdata);
						}else{
							callback(err,"fail");
						}
					})
				}else{
					callback(err,"fail");
				}
			});
		}else{
			callback(null,"fail");
		}
	});
}