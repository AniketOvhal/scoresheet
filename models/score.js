const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Score = sequelize.define("Score", {
	court: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	teamA: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	teamB: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	scoreA: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	scoreB: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

module.exports = Score;
