# whosampledAPI
endpoint for json data about song samples 

This project is a webscraper that collects music data from whosampled.com and then exposes an endpoint at https://samples-api.herokuapp.com/:page/:page
for you to make consume through GET requests, with 2 additional route params for the name of the artist and a page number. It is useful 
for anyone that wants to build an app or do some data visualization with song samples data. To consume, you can use an HTTP client like request.js to make http calls. 

### Example
```javascript
var request = require('request'); // if using node, require the request.js module at the top of your file

var options = {
  url: 'https://samples-api.herokuapp.com/Wu-Tang-Clan/1',
  json: true
}

request.get(options, function(error, response, body){
  if (!error && response.statusCode == 200) {
    console.log(body) // do awesome stuff with the JSON response data
  }
})
```

The response is an array of JSON objects similar to the below:

```json

{
  "producers": [
    "RZA"
  ],
  "samplesCollection": [
    {
      "producers": [
        
      ],
      "sampleElement": {
        "sampler": "Direct Sample of Multiple Elements"
      },
      "sampleAppearance": {
        "sampler": "Sample appears at 0:06, 0:16, 0:26 (and throughout)",
        "original": "Sample appears at 0:20, 0:18, 0:00"
      },
      "otherSamplers": [
        {
          "producers": [
            
          ],
          "sampleElement": {
            "sampler": "Cover Version"
          },
          "sampleAppearance": {
            
          },
          "genre": "Soul \/ Funk \/ Disco",
          "artistName": "The Emotions",
          "songName": "As Long as I've Got You",
          "album": "Songs of Innocence and Experience",
          "year": "2004",
          "recLabel": "Stax",
          "imgLink": "http:\/\/www.whosampled.com\/static\/track_images\/r20774_2014713_95913964366.jpg",
          "songLink": "http:\/\/www.youtube.com\/embed\/HbZxZuD1M_Y?rel=0&modestbranding=0&showinfo=0&iv_load_policy=3"
        }
      ],
      "genre": "Soul \/ Funk \/ Disco",
      "artistName": "The Charmels",
      "songName": "As Long as I've Got You",
      "year": "1967",
      "recLabel": "Volt",
      "imgLink": "http:\/\/www.whosampled.com\/static\/track_images\/r2929_20091124_12124773453.jpg",
      "songLink": "http:\/\/www.youtube.com\/embed\/gp9uZjPaB4w?rel=0&modestbranding=0&showinfo=0&iv_load_policy=3",
      "ownLink": "\/The-Charmels\/As-Long-as-I%27ve-Got-You\/"
    },
    {
      "producers": [
        
      ],
      "sampleElement": {
        "sampler": "Interpolation (Replayed Sample) of Vocals \/ Lyrics"
      },
      "sampleAppearance": {
        "sampler": "Sample appears at 0:24",
        "original": "Sample appears at 0:19"
      },
      "otherSamplers": [
        {
          "producers": [
            
          ],
          "sampleElement": {
            "sampler": "Cover Version"
          },
          "sampleAppearance": {
            
          },
          "genre": "Hip-Hop \/ R&B",
          "artistName": "Coolio",
          "songName": "Money (Dollar Bill Y'all)",
          "album": "In Tha Beginning... There Was Rap",
          "year": "1997",
          "recLabel": "Priority",
          "imgLink": "http:\/\/www.whosampled.com\/static\/track_images\/r20721_2011122_184442781927.jpg",
          "songLink": "http:\/\/www.youtube.com\/embed\/N-GnqqTvWzs?rel=0&modestbranding=0&showinfo=0&iv_load_policy=3"
        }
      ],
      "genre": "Hip-Hop \/ R&B",
      "artistName": "Jimmy Spicer",
      "songName": "Money (Dollar Bill Y'all)",
      "year": "1983",
      "recLabel": "Spring",
      "imgLink": "http:\/\/www.whosampled.com\/static\/track_images\/r2929_2011125_114710337160.jpg",
      "songLink": "http:\/\/www.youtube.com\/embed\/ObtEUFKiIzE?rel=0&modestbranding=0&showinfo=0&iv_load_policy=3",
      "ownLink": "\/Jimmy-Spicer\/Money-(Dollar-Bill-Y%27all)\/"
    }
  ],
  "songName": "C.R.E.A.M.",
  "artistName": "Wu-Tang Clan",
  "album": "Enter the Wu-Tang (36 Chambers)",
  "recLabel": "Loud",
  "imgLink": "http:\/\/www.whosampled.com\/static\/track_images_100\/mr60124_201349_142727402900.jpg",
  "songLink": "http:\/\/www.youtube.com\/embed\/WrsfJHLx5YA?rel=0&modestbranding=0&showinfo=0&iv_load_policy=3",
  "year": "1993",
  "genre": "Hip-Hop \/ R&B"
}

```
