var Store = require('../app/app');
var db = require('mongodb').MongoClient;

var url = 'mongodb://playdev:27017/blockbase';
db.connect(url, function(err, db) {
	if(err) {
		console.log(err);
		return false;
	}
	console.log("Connected correctly to server.");
	new Store({

		// bulk add many event blocks
		// POST /chains/123/blocks []
		addBlocks: function(blocks, chainId, cb){
			var docs = [];
			for(var i = 0; i < blocks.length; i++){
				docs[i] = {
					blockId: blocks[i].blockId,
					block: blocks[i].block,
					chainId: chainId
				};

				if(blocks[i].prevBlockId){
					docs[i].prevBlockId = blocks[i].prevBlockId;
				}
			}
			db.collection('blocks').insertMany(docs, function(err, result){
				console.log('insert docs...');
				console.log(arguments);
				console.log(docs);

				cb(err,result);
			});
		},

		// cb for bulk getting blocks by Ids
		// GET /chains/234234/blocks/?ids=234,234,234,234
		// GET /blocks/?ids=21,123,123,123,123
		getBlocks: function(blockIds, chainId, usePrevBlockId, cb){

			var query = {};

			if(usePrevBlockId) {
				query.prevBlockId = { $in: blockIds };
			} else {
				query.blockId = { $in: blockIds };
			}

			if(chainId) {
				query.chainId = chainId;
			}
			db.collection('blocks').find(query).toArray(function(err, result){
				console.log('fetched docs...');
				console.log(arguments);
				console.log(query);

				cb(err,result);
			});

		},

		// cb for getting all root blocks
		// GET /chains
		getRootBlocks: function(cb){

			var query = {
				prevBlockId: {
					$exists: false
				}
			};

			db.collection('blocks').find(query).toArray(function(err, result){
				console.log('fetched docs...');
				console.log(arguments);
				console.log(query);
				cb(err,result);
			});

		},

		// cb for bulk deleting blocks
		deleteBlocks: function(blockIds, chainId, cb){

			var idQuery = {
				blockId: { $in: blockIds }
			};

			if(chainId) {
				var query = {
					$and: [idQuery, { chainId: chainId }]
				};
			} else {
				var query = idQuery;
			}

			db.collection('blocks').remove(query, function(err, result){
				console.log('delete docs...');
				console.log(arguments);
				console.log(query);
				cb(err,result);
			});
		},

		// cb for bulk deleting all blocks in select chains
		deleteChains: function(chainIds, cb){

			var query = {
				chainId: { $in: chainIds }
			};

			db.collection('blocks').remove(query, function(err, result){
				console.log('delete docs...');
				console.log(arguments);
				console.log(query);
				cb(err,result);
			});
		}

	})
	.app
	.listen(3004, function () {
		var host = this.address().address;
		var port = this.address().port;
		console.log('Example app listening at http://%s:%s', host, port);
	});


});
