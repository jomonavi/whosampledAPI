var scraper = (function(){

	function getRootArtistLinks(cheerio, arr){
		var linkArr = Array.prototype.slice.call(cheerio('.trackName'));
		linkArr.forEach(function(aSong){
			arr.push(aSong.children[0].attribs.href);
		});
	}

	function makeRootArtistNode(cheerio, arr, rootNode){
		cheerio(".bordered-list").each(function(i, elem){
			if(i === 0){
				cheerio(this).find(cheerio("a.playIcon")).each(function(i, elem){
					arr.push(elem.attribs.href);
				});
			}
		});

		rootNode.songName = cheerio('.trackInfo').find("h1").text();
		var artistName = cheerio(".trackInfo .trackArtists").text().split(" ");
		artistName.splice(0, 1);
		rootNode.artistName = artistName.join(" ");

		rootNode.album = cheerio(".trackInfo .trackReleaseDetails").find("h3").text();
		rootNode.recLabel = cheerio(".trackInfo .trackReleaseDetails").find("h4").text();
		rootNode.imgLink = "http://www.whosampled.com" + cheerio(".trackImage").find("img").attr("src")
		cheerio(".trackReleaseDetails").find("a").each(function(i, elem){
			rootNode.producers.push(cheerio(this).text());
		});

	}

	function makeSampleNode(cheerio, rootNode, sampleLeaf){
		if(!rootNode.songLink){
			rootNode.songLink = cheerio(".sampleVideoRight").first().find("iframe").attr("src");
			cheerio("#sampleWrap_dest .sampleReleaseDetails").children().each(function(i, elem){
				if(cheerio("#sampleWrap_dest .sampleReleaseDetails").children().length === 2){
					if(i === 1) {
						var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
						yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
						rootNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
						rootNode.recLabel = yrAlbumArr.join(" ");
					} 
				} else {
						var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
						yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
						rootNode.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
						rootNode.recLabel = yrAlbumArr.join(" ");
					}
			});
			rootNode.genre = cheerio(".buyTrackContainer").first().next().children().last().find("a").text()
		}

		sampleLeaf.sampleElement.sampler = cheerio(".sampleTitle").find("h2").text();
		sampleLeaf.genre = cheerio(".buyTrackContainer").last().next().children().last().find("a").text();
		// if(cheerio(".buyTrackContainer").last().next.children().first() === "Producer:"){
		// 	console.log('TRUE');
		// 	// sampleLeaf.producers = 
		// 	// cheerio(".buyTrackContainer").last().next.children().first().find("a").each(function(i, elem){
		// 	// 	sampleLeaf.producers.push(cheerio(this).text());
		// 	// });
		// } else {console.log("FALSE")}
		var artistName2 = cheerio("#sampleWrap_source .sampleTrackArtists").text().split(" ");
		// artistName2.splice(0, 1);
		sampleLeaf.artistName = artistName2.join(" ");
		sampleLeaf.songName = cheerio("#sampleWrap_source .trackName").text();
		cheerio("#sampleWrap_source .sampleReleaseDetails").children().each(function(i, elem){
			if(cheerio("#sampleWrap_source .sampleReleaseDetails").children().length === 2){
				if(i === 0) {
					sampleLeaf.album = cheerio(this).text();
				} 
				if(i === 1) {
					var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
					yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
					sampleLeaf.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
					sampleLeaf.recLabel = yrAlbumArr.join(" ");
				}	
			} else{
					var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
					yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
					sampleLeaf.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
					sampleLeaf.recLabel = yrAlbumArr.join(" ");
				}
		});

		cheerio(".sampleTimingRight").each(function(i, elem){
			if(i === 0) sampleLeaf.sampleAppearance.sampler = cheerio(this).text();
			else sampleLeaf.sampleAppearance.original = cheerio(this).text();
		});

		sampleLeaf.imgLink = "http://www.whosampled.com" + cheerio(".sampleTrackImage").last().find("img").attr("src");
		sampleLeaf.songLink = cheerio(".sampleVideoRight").last().find("iframe").attr("src");
		sampleLeaf.ownLink = cheerio("#sampleWrap_source .trackName").attr("href");
	}

	function makeOuterLeafNode(cheerio, outerLeaf){
		outerLeaf.sampleElement.sampler = cheerio(".sampleTitle").find("h2").text();
		outerLeaf.genre = cheerio(".buyTrackContainer").first().next().children().last().find("a").text();

		var artistName2 = cheerio("#sampleWrap_dest .sampleTrackArtists").text().split(" ");
		outerLeaf.artistName = artistName2.join(" ");
		outerLeaf.songName = cheerio("#sampleWrap_dest .trackName").text();
		cheerio("#sampleWrap_dest .sampleReleaseDetails").children().each(function(i, elem){
			if(cheerio("#sampleWrap_dest .sampleReleaseDetails").children().length === 2){
				if(i === 0) {
					outerLeaf.album = cheerio(this).text();
				} 
				if(i === 1) {
					var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
					yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
					outerLeaf.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
					outerLeaf.recLabel = yrAlbumArr.join(" ");
				}	
			} else{
					var yrAlbumArr =  cheerio(this).text().replace(/\s+/g, " ").split(" ");
					yrAlbumArr.splice(0, 1); yrAlbumArr.splice(yrAlbumArr.length - 1, 1); 
					outerLeaf.year = yrAlbumArr.splice(yrAlbumArr.length - 1, 1).join("");
					outerLeaf.recLabel = yrAlbumArr.join(" ");
				}
		});

		cheerio(".sampleTimingRight").each(function(i, elem){
			if(i === 0) outerLeaf.sampleAppearance.sampler = cheerio(this).text();
			else outerLeaf.sampleAppearance.original = cheerio(this).text();
		});

		outerLeaf.imgLink = "http://www.whosampled.com" + cheerio(".sampleTrackImage").first().find("img").attr("src");
		outerLeaf.songLink = cheerio(".sampleVideoRight").first().find("iframe").attr("src");		
	}

	function getOuterLinkLeaf(cheerio, arr){
		if(cheerio(".bordered-list").length > 1){
			cheerio(".bordered-list").each(function(i, elem){
				if(i === 1){
					cheerio(this).find("a.playIcon").each(function(i, elem){
						arr.push(elem.attribs.href);
					});
				}
			});
		} else {
			cheerio(".bordered-list").find("a.playIcon").each(function(i, elem){
				arr.push(elem.attribs.href);
			});
		}	
	}

	var mod = {
		getRootArtistLinks: getRootArtistLinks,
		makeRootArtistNode: makeRootArtistNode,
		makeSampleNode: makeSampleNode,
		getOuterLinkLeaf: getOuterLinkLeaf,
		makeOuterLeafNode: makeOuterLeafNode
	}

	return mod;


})()

module.exports = scraper;