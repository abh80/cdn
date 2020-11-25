const fs = require("fs");
const config = require("../siteConfig")
module.exports = (app) => {
  app.get("/file/:hash", (req, res) => {
    if (!fs.existsSync(process.cwd() + "/cdn/" + req.params.hash)) {
      res.status(404).sendFile(process.cwd() + "/404.html");
      return;
    }
    res.send(`
    <!DOCTYPE html>
    <html>
  <head>
  
  <link rel="preconnect" href="https://fonts.gstatic.com" />
	<link href="https://fonts.googleapis.com/css2?family=Alata&display=swap" rel="stylesheet" />
	<meta charset="utf-8" />
  <!-- Include this to make the og:image larger -->
  <meta name="twitter:card" content="summary_large_image">
  <style>		
  html {
    background-color : black
  }
  .centered-content {
    margin : auto;
    position : relative;
    text-align : center;
    align-items : center;
    top : 50px;
  }
  .img {
    border : 2px solid white
  }
  footer {
			position: fixed;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 200px;
			background-color: #303846;
			color: white;
			text-align: center;
			font-family: 'Alata', sans-serif;
		}

		footer p {
			margin-left: 20px;
			bottom: 0;
			position: fixed;
			text-align: center
		}

		.logo {
			margin-top: 10px;
			height: 100px;
			width: 100px;
			border-radius: 100%;
		}
  </style>
  <title>CDN</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta content="Stars Tracker CDN" property="og:site_name"/>
  <meta content="Stars Tracker CDN" property="og:title"/>
  <meta content="${config.url}/file/${
    req.params.hash
  }" property="og:url"/>
  <meta content="${config.url}/files/${
    req.params.hash
  }" property="og:image"/>
  <meta property="og:thumbnail" content="${config.url}/files/${
    req.params.hash
  }"/>
  <meta content = "#a825c2" property = "theme-color"/>
  <meta content="article" property="og:type"/>
  <link href="${config.url}/files/${
    req.params.hash
  }" rel="image_src"/>
  <meta name="twitter:image" content="${config.url}/files/${
    req.params.hash
  }"/>
  <meta name="twitter:title" content="Stars Tracker CDN"/>
  </head>
    <body>
    <div class = "centered-content">
    ${
      req.params.hash.endsWith(".mp4")
        ? `<video class = "img" src="${config.url}/files/${req.params.hash}" width="640px" height="380px" autoplay></video>`
        : `<img class = "img" src = "${config.url}/files/${req.params.hash}"</img>`
    }
    </div>
    <footer>
    <img class = "logo" src = "https://blogs.starstracker.xyz/img/logo.png" />
    <h2>Stars Tracker Open Source</h2>
    <p>Copyright © 2020 Abh80</p></footer>
    </body>
    </html>`);
  });
};
