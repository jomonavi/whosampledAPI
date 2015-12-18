var express = require('express');
var cheerio = require('cheerio')
var rp = require('request-promise')
var async = require('async');
var router = express.Router();

/* GET home page. */
router.get('/:artist/:page', function(req, res, next) {
	console.log(req.params);
  	var artist = req.params.artist;
	var arr = [];
	var page = req.params.page;
	console.log(req.body);
	var url = "http://www.whosampled.com/" + artist + "/?sp=" + page;
	var songLinks = [];
	rp(url)
		.then(function(html){
			var $ = cheerio.load(html);
			coercedLinkArr = Array.prototype.slice.call($('.trackName'));
			coercedLinkArr.forEach(function(aSong){
				songLinks.push(aSong.children[0].attribs.href);
			});
		}, function(error){
			res.status(500).send(error)
			return;
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
						$(".bordered-list").each(function(i, elem){
							if(i === 0) {
								$(this).find(".sampleEntry .trackName").each(function(i, elem){
									finalPageLink.push($(this)["0"].attribs.href);
								})
							}
						});

						songNode.songName = $(".trackInfo").find("h1").text();
						var artistName = $(".trackInfo .trackArtists").text().split(" ");
						artistName.splice(0, 1);
						songNode.artistName = artistName.join(" ");

						songNode.album = $(".trackInfo .trackReleaseDetails").find("h3").text();
						songNode.recLabel = $(".trackInfo .trackReleaseDetails").find("h4").text();
						songNode.imgLink = "http://www.whosampled.com" + $(".trackImage").find("img").attr("src")
						$(".trackReleaseDetails").find("a").each(function(i, elem){
							songNode.producers.push($(this).text());
						});
					}, function(error){
						res.status(500).send(error);
						return;
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
									if(!songNode.songLink){
										songNode.songLink = $(".sampleVideoRight").first().find("iframe").attr("src");
										$("#sampleWrap_dest .sampleReleaseDetails").children().each(function(i, elem){
											if($("#sampleWrap_dest .sampleReleaseDetails").children().length === 2){
												if(i === 1) {
													var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
													yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
													songNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
													songNode.recLabel = yrAlbumArr.join(" ");
												} 
											} else {
													var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
													yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
													songNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
													songNode.recLabel = yrAlbumArr.join(" ");
												}
										});
										songNode.genre = $(".buyTrackContainer").first().next().children().last().find("a").text()
									}

									sampleNode.sampleElement.sampler = $(".sampleTitle").find("h2").text();
									sampleNode.genre = $(".buyTrackContainer").last().next().children().last().find("a").text();
									// if($(".buyTrackContainer").last().next.children().first() === "Producer:"){
									// 	console.log('TRUE');
									// 	// sampleNode.producers = 
									// 	// $(".buyTrackContainer").last().next.children().first().find("a").each(function(i, elem){
									// 	// 	sampleNode.producers.push($(this).text());
									// 	// });
									// } else {console.log("FALSE")}
									var artistName2 = $("#sampleWrap_source .sampleTrackArtists").text().split(" ");
									// artistName2.splice(0, 1);
									sampleNode.artistName = artistName2.join(" ");
									sampleNode.songName = $("#sampleWrap_source .trackName").text();
									$("#sampleWrap_source .sampleReleaseDetails").children().each(function(i, elem){
										if($("#sampleWrap_source .sampleReleaseDetails").children().length === 2){
											if(i === 0) {
												sampleNode.album = $(this).text();
											} 
											if(i === 1) {
												var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
												yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
												sampleNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
												sampleNode.recLabel = yrAlbumArr.join(" ");
											}	
										} else{
												var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
												yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
												sampleNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
												sampleNode.recLabel = yrAlbumArr.join(" ");
											}
									});

									$(".sampleTimingRight").each(function(i, elem){
										if(i === 0) sampleNode.sampleAppearance.sampler = $(this).text();
										else sampleNode.sampleAppearance.original = $(this).text();
									});

									sampleNode.imgLink = "http://www.whosampled.com" + $(".sampleTrackImage").last().find("img").attr("src");
									sampleNode.songLink = $(".sampleVideoRight").last().find("iframe").attr("src");
									sampleNode.ownLink = $("#sampleWrap_source .trackName").attr("href");

								}, function(error){
									res.status(500).send(error);
									return;
								})
								.then(function(){
									var sampleBranchArr = [];
									rp(url2 + sampleNode.ownLink)
										.then(function(html){
											var $ = cheerio.load(html);
											if($(".bordered-list").length > 1){
												$(".bordered-list").each(function(i, elem){
													if(i === 1){
														$(this).find(".sampleEntry .trackName").each(function(i, elem){
															sampleBranchArr.push($(this)["0"].attribs.href);
														})
													}
												})
											} else {
												$(".bordered-list").find(".sampleEntry .trackName").each(function(i, elem){
													sampleBranchArr.push($(this)["0"].attribs.href)
												})
											}
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

														outerBranch.sampleElement.sampler = $(".sampleTitle").find("h2").text();
														outerBranch.genre = $(".buyTrackContainer").first().next().children().last().find("a").text();

														var artistName2 = $("#sampleWrap_dest .sampleTrackArtists").text().split(" ");
														outerBranch.artistName = artistName2.join(" ");
														outerBranch.songName = $("#sampleWrap_dest .trackName").text();
														$("#sampleWrap_dest .sampleReleaseDetails").children().each(function(i, elem){
															if($("#sampleWrap_dest .sampleReleaseDetails").children().length === 2){
																if(i === 0) {
																	outerBranch.album = $(this).text();
																} 
																if(i === 1) {
																	var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
																	yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
																	outerBranch.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
																	outerBranch.recLabel = yrAlbumArr.join(" ");
																}	
															} else{
																	var yrAlbumArr =  $(this).text().replace(/\s+/g, " ").split(" ");
																	yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
																	outerBranch.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
																	outerBranch.recLabel = yrAlbumArr.join(" ");
																}
														});

														$(".sampleTimingRight").each(function(i, elem){
															if(i === 0) outerBranch.sampleAppearance.sampler = $(this).text();
															else outerBranch.sampleAppearance.original = $(this).text();
														});

														outerBranch.imgLink = "http://www.whosampled.com" + $(".sampleTrackImage").first().find("img").attr("src");
														outerBranch.songLink = $(".sampleVideoRight").first().find("iframe").attr("src");
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
