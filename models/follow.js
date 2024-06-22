import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;
const follower = db.define(
  "follows",
  {
    followerId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    followeeId:{
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
    
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default follower;
(async () => {
  await db.sync();
})();
