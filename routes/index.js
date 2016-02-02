var express = require('express');
var cheerio = require('cheerio')
var rp = require('request-promise')
var async = require('async');
var router = express.Router();
var scraper = require('../scraper-functions');
var proxy = process.env.QUOTAGUARD_URL;

/* GET home page. */
router.get('/:artist/:page', function(req, res, next) {
	console.log(req.params);
  	var artist = req.params.artist;
	var page = req.params.page;
	var url = "http://www.whosampled.com/" + artist + "/?sp=" + page;
	var option = {
		method: 'GET',
		proxy: proxy,
		uri: url,
		headers: {
	        'User-Agent': 'node.js'
	    }
	}
	var songLinks = [];
	rp(option)
		.then(function(html){
			var $ = cheerio.load(html);
			scraper.getRootArtistLinks($, songLinks);
		}, function(error){
			return res.status(500).send(error);
		})
		.then(function(){
			var url2 = "http://www.whosampled.com"
			async.map(songLinks, function(aSongLink, callback){
				var songNode = {
					producers: [],
					samplesCollection: [],
				};
				var finalPageLink = [];
				var option = {
					method: 'GET',
					proxy: proxy,
					uri: url2 + aSongLink,
					headers: {
				        'User-Agent': 'node.js'
				    }
				}
				rp(option)
					.then(function(html){
						var $ = cheerio.load(html);
						scraper.makeRootArtistNode($, finalPageLink, songNode);
					}, function(error){
						return res.status(500).send(error);
					})
					.then(function(){
						async.map(finalPageLink, function(aPageLink, callback){
							var sampleNode = {
								producers: [],
								sampleElement: {},
								sampleAppearance: {},
								otherSamplers: []
							};

							var option = {
								method: 'GET',
								proxy: proxy,
								uri: url2 + aPageLink,
								headers: {
									'User-Agent': 'node.js'
								}
							}

							rp(option)
								.then(function(html){
									var $ = cheerio.load(html);
									scraper.makeSampleNode($, songNode, sampleNode);
								}, function(error){
									return res.status(500).send(error)
								})
								.then(function(){
									var option = {
										method: 'GET',
										proxy: proxy,
										uri: url2 + sampleNode.ownLink,
										headers: {
											'User-Agent': 'node.js'
										}
									}
									var sampleBranchArr = [];
									rp(option)
										.then(function(html){
											var $ = cheerio.load(html);
											scraper.getOuterLinkLeaf($, sampleBranchArr);
										}, function(error){
											return res.status(500).send(error);
										})
										.then(function(){
											async.map(sampleBranchArr, function(aBranch, callback){
												var outerBranch = {
													producers: [],
													sampleElement: {},
													sampleAppearance: {},
												};
												var option = {
													method: 'GET',
													proxy: proxy,
													uri: url2 + aBranch,
													headers: {
														'User-Agent': 'node.js'
													}
												}

												rp(option)
													.then(function(html){
														var $ = cheerio.load(html);
														scraper.makeOuterLeafNode($, outerBranch);
													}, function(error){
														return res.status(500).send(error);
													})
													.then(function(){
														callback(null, outerBranch);
													}, function(error){
														return res.status(500).send(error);
													})
											}, function(err, results){
												if(err) {
													console.log(err);
													return err;
												}
												sampleNode.otherSamplers = results;
												callback(null, sampleNode);
											})
										}, function(error){
											return res.status(500).send(error);
										})
								}, function(error){
									return res.status(500).send(error);
								})
						}, function(err, results){
							songNode.samplesCollection = results;
							callback(null, songNode);
						})
					}, function(error){
						return res.status(500).send(error);
					})
			}, function(err, results){
				if(err) {
					console.log(err);
					return err
				}
				return res.status(200).send(results);
			})
		}, function(error){
			return res.status(500).send(error);
		});
});

module.exports = router;
