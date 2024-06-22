import { Sequelize } from "sequelize";
import db from "../config/database.js";
import user from "./user.js";
const { DataTypes } = Sequelize;
const post = db.define(
  "post",
  {
    PostId: {
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
    Content: DataTypes.STRING,
    MediaType: DataTypes.STRING,
    Timestamp: DataTypes.STRING,
    Image: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default post;
(async () => {
  await db.sync();
})();
