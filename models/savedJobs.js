import { Sequelize } from "sequelize";
import db from "../config/database.js";
import user from "./user.js";
const { DataTypes } = Sequelize;
const savedJobs = db.define(
  "savedjob",
  {
    savedJobId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
    jobId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default savedJobs;
(async () => {
  await db.sync();
})();
