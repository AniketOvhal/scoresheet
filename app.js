const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Score = require("./models/score");
const sequelize = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "access.log"),
	{ flags: "a" }
);
app.set("view engine", "ejs");
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

app.get("/", (req, res) => {
	res.render("login", { error: req.session.error });
	req.session.error = null; // Clear the error message
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ where: { username, password } });
	if (user) {
		req.session.user = user;
		res.redirect("/scores");
	} else {
		req.session.error = "Invalid username or password";
		res.redirect("/");
	}
});

app.get("/scores", async (req, res) => {
	if (!req.session.user) {
		return res.redirect("/login");
	}

	// Fetch current scores from the database

	const scores = await Score.findAll();
	res.render("scores", { scores }); // Pass the scores to the view
});

app.post("/update-score", async (req, res) => {
	const { court, teamA, teamB, scoreA, scoreB } = req.body;
	console.log(court, teamA, teamB, scoreA, scoreB);
	// Check if the score entry already exists for the given court and teams
	const existingScore = await Score.findOne({
		where: {
			court: court,
			// teamA: teamA,
			// teamB: teamB,
		},
	});

	if (existingScore) {
		// Update the existing score
		existingScore.scoreA = scoreA;
		existingScore.scoreB = scoreB;
		existingScore.teamA = teamA;
		existingScore.teamB = teamB;
		await existingScore.save();
	} else {
		// Create a new score entry
		await Score.create({
			court: court,
			teamA: teamA,
			teamB: teamB,
			scoreA: scoreA,
			scoreB: scoreB,
		});
	}

	// Redirect to the scores page after updating
	res.redirect("/scores");
});

app.get("/view-matches", async (req, res) => {
	
	const scores = await Score.findAll();
	res.render("viewMatch", { scores });
});

app.listen(PORT, async () => {
	await sequelize.sync();
	console.log(`Server is running on http://localhost:${PORT}`);
});
