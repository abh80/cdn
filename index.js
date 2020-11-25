const jwt = require("jsonwebtoken");

const express = require("express");
const bodyParser = require("body-parser");
const createHash = require("hash-generator");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
app.listen(process.env.PORT ? process.env.PORT : 3012);
app.use(bodyParser.json());
app.use("/files", express.static("./cdn"));
app.use("/file", express.static("./test"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  fileUpload({
    safeFileNames: true,
    preserveExtension: true,
  })
);
const route = require("./router/route");
route(app);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/auth", (req, res) => {
  const token = jwt.sign({ name: "YOUR_NAME" }, "secret");
  res.status(200).send(
    JSON.stringify({
      message: { token: token },
    })
  ); // logs token
});
app.post("/upload", (req, res) => {
  if (!req.body.token) {
    res.status(401).send(
      JSON.stringify({
        error: {
          message: "No access token was Posted",
        },
      })
    );
    return;
  }
  try {
    var decoded = jwt.verify(req.body.token, "secret");
    if (decoded.name !== process.env.NAME)
      return res
        .status(401)
        .send(JSON.stringify({ error: { message: "Invalid token" } }));
  } catch {
    res
      .status(401)
      .send(JSON.stringify({ error: { message: "Invalid token" } }));
  }
  if (!req.files.file) {
    res.status(415).send(
      JSON.stringify({
        error: {
          message: "No file was uploaded",
        },
      })
    );
    return;
  }
  const file = req.files.file;
  const ext = file.name.toString().split(".")[1];
  const hash = createHash(10); // to make unique
  const uploadPath = __dirname + "/cdn/" + hash + "." + ext;
  file.mv(uploadPath, function (error) {
    if (error) {
      res.status(403).send(
        JSON.stringify({
          error: {
            message: error,
          },
        })
      );
      return;
    }
    res.status(200).send(
      JSON.stringify({
        file: {
          url: "https://" + req.headers["host"] + "/file/" + hash + "." + ext,
          delete_url:
            "https://" +
            req.headers["host"] +
            "/delete?file=" +
            hash +
            "." +
            ext +
            "&token=" +
            req.body.token,
        },
      })
    );
  });
});
app.get("/delete", (req, res) => {
  if (!req.query.file || !req.query.token) {
    return res.status(401).send(
      JSON.stringify({
        error: {
          message: "Unauthorized",
        },
      })
    );
    return;
  }
  try {
    var decoded = jwt.verify(req.query.token, "secret");
    if (decoded.name !== process.env.NAME)
      return res
        .status(401)
        .send(JSON.stringify({ error: { message: "Invalid token" } }));
  } catch {
    return res
      .status(401)
      .send(JSON.stringify({ error: { message: "Invalid token" } }));
  }
  const file = req.query.file;
  const filePath = __dirname + "/cdn/" + file;
  const exists = fs.existsSync(filePath);
  if (!exists) {
    res.status(404).send(
      JSON.stringify({
        error: {
          message: "File does not exists",
        },
      })
    );
    return;
  }
  fs.unlink(filePath, function (error) {
    if (error) {
      res.status(500).send(
        JSON.stringify({
          error: { message: error },
        })
      );
    }
  });
  res.status(200).send({
    message: "Deleted File!",
  });
});
app.get("/*", (req, res) => res.status(404).sendFile(__dirname + "/404.html"));
