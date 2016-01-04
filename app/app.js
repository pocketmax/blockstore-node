var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app
// convert ids into array of ids from multiple formats (JSON, CSV, x-form array)
// TODO: add middleware that throws error if method is GET/DELETE and no id specified
.use(function (req, res, next) {

	if(!req.query.id){
		next();
		return false;
	}
	var val = req.query.id;
	// id is a csv list
	if(val.indexOf(',')){
		req.query.id = val.split(',');  // csv list
	} else {
		req.query.id = [val];
	}

	next();
});
module.exports = function(cfg){

	app
	// upload a block on a chain (supports bulk)
	.post('/chains/:chainId/blocks', function (req, res) {
		if(!req.body.length){
			req.body = [req.body];
		}
		cfg.addBlocks(req.body, req.params.chainId, function(err, results){
			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});

	})

	// search one chain for block(s)
	// TODO: if no ids given, throw error. can't return all blocks
	.get('/chains/:chainId/blocks/', function (req, res) {

		cfg.getBlocks(req.query.id, req.params.chainId, req.params.usePrevBlockId, function(err, results){
			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});

	})
/*
	// get all chain stats i.e. count
	.get('/chains/status', function (req, res) {

		cfg.getRootBlocks(function(err, results){

			if(err) return false;

		});
	})
*/
	// search all root blocks
	// TODO: if id is given, throw error. no need to restrict chain results
	.get('/chains/', function (req, res) {

		cfg.getRootBlocks(function(err, results){

			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});
	})

	// search all chains for a block
	// TODO: if no ids given, throw error. can't return all blocks
	.get('/blocks/', function (req, res) {

		cfg.getBlocks(req.query.id, null, req.params.usePrevBlockId, function(err, results){

			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});
	})

	// delete certain blocks
	// TODO: if no ids given, throw error. can't blow away all chains in one call
	.delete('/blocks/', function (req, res) {
		cfg.deleteBlocks(req.query.id, null, function(err, results){

			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});

	})
	// delete certain blocks under a chainId
	// TODO: if no ids given, throw error and recommend /chains endpoint
	.delete('/chains/:chainId/blocks/', function (req, res) {
		cfg.deleteBlocks(req.query.id, req.params.chainId, function(err, results){

			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});

	})

	// delete certain chains by id(s)
	// TODO: if no ids given, throw error. can't blow away all chains in one call
	.delete('/chains', function (req, res) {

		cfg.deleteChains(req.query.id, function(err, results){

			if(err){
				console.log(err);
				return false;
			}

			res.json({
				data: results,
				success: true
			});

		});
	});

	this.app = app;

};
