import { Sequelize } from "sequelize";
import db from "../config/database.js";
import user from "./user.js";
const { DataTypes } = Sequelize;
const savedPost = db.define(
  "savedpost",
  {
    savedPostId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
    postId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default savedPost;
(async () => {
  await db.sync();
})();
