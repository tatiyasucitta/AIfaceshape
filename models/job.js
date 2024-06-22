import { Sequelize } from "sequelize";
import db from "../config/database.js";
const { DataTypes } = Sequelize;
const job = db.define(
  "job",
  {
    jobId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    UserId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user', // 'Users' refers to table name
         key: 'UserId' // 'id' refers to column name in Users table
    }
    },

    jobTitle: DataTypes.STRING,
    company: DataTypes.STRING,
    fee: DataTypes.INTEGER,
    jobLocation: DataTypes.STRING,
    durationUnit: DataTypes.STRING,
    durationAmount: DataTypes.INTEGER,
    jobDescription: DataTypes.STRING,
    jobRequirements: DataTypes.STRING,
    companyProfile : DataTypes.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
export default job;
(async () => {
  await db.sync();
})();
