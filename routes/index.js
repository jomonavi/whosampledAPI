var express = require('express');
var cheerio = require('cheerio')
var rp = require('request-promise')
var async = require('async');
var router = express.Router();
var scraper = require('../scraper-functions');

/* GET home page. */
router.get('/:artist/:page', function(req, res, next) {
	console.log(req.params);
  	var artist = req.params.artist;
	var page = req.params.page;
	var url = "http://www.whosampled.com/" + artist + "/?sp=" + page;
	var songLinks = [];
	rp(url)
		.then(function(html){
			var $ = cheerio.load(html);
			scraper.getRootArtistLinks($, songLinks);
		}, function(error){
			res.status(500).send(error);
		})
		.then(function(){
			var url2 = "http://www.whosampled.com"
			async.map(songLinks, function(aSongLink, callback){
				var songNode = {
					producers: [],
					samplesCollection: [],
				};
				var finalPageLink = [];
				rp(url2 + aSongLink)
					.then(function(html){
						var $ = cheerio.load(html);
						scraper.makeRootArtistNode($, finalPageLink, songNode);
					}, function(error){
						res.status(500).send(error);
					})
					.then(function(){
						async.map(finalPageLink, function(aPageLink, callback){
							var sampleNode = {
								producers: [],
								sampleElement: {},
								sampleAppearance: {},
								otherSamplers: []
							};

							rp(url2 + aPageLink)
								.then(function(html){
									var $ = cheerio.load(html);
									scraper.makeSampleNode($, songNode, sampleNode);
								}, function(error){
									res.status(500).send(error)
								})
								.then(function(){
									var sampleBranchArr = [];
									rp(url2 + sampleNode.ownLink)
										.then(function(html){
											var $ = cheerio.load(html);
											scraper.getOuterLinkLeaf($, sampleBranchArr);
										}, function(error){
											res.status(500).send(error);
										})
										.then(function(){
											async.map(sampleBranchArr, function(aBranch, callback){
												var outerBranch = {
													producers: [],
													sampleElement: {},
													sampleAppearance: {},
												};

												rp(url2 + aBranch)
													.then(function(html){
														var $ = cheerio.load(html);
														scraper.makeOuterLeafNode($, outerBranch);
													}, function(error){
														res.status(500).send(error);
														return;
													})
													.then(function(){
														callback(null, outerBranch);
													}, function(error){
														res.status(500).send(error);
													})
											}, function(err, results){
												if(err) console.log(err);
												sampleNode.otherSamplers = results;
												callback(null, sampleNode);
											})
										}, function(error){
											res.status(500).send(error);
										})
								}, function(error){
									res.status(500).send(error);
								})
						}, function(err, results){
							songNode.samplesCollection = results;
							callback(null, songNode);
						})
					}, function(error){
						res.status(500).send(error);
						return;
					})
			}, function(err, results){
				if(err) console.log(error);
				res.status(200).send(results);
			})
		}, function(error){
			res.status(500).send(error);
			return;
		});
});

module.exports = router;
