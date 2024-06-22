import { Sequelize } from "sequelize";
import db from "../config/database.js";
import post from "./post.js";
const { DataTypes } = Sequelize;
const user = db.define(
  "user",
  {
    UserId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    UserName: DataTypes.STRING,
    UserEmail: DataTypes.STRING,
    UserPassword: DataTypes.STRING,
    UserAddress: DataTypes.STRING,
    AboutModel: DataTypes.STRING,
    ModelBust: DataTypes.STRING,
    ModelHips: DataTypes.STRING,
    ModelWaist: DataTypes.STRING,
    UserPassword: DataTypes.STRING,
    UserDOB: DataTypes.STRING,
    UserHeight: DataTypes.STRING,
    UserWeight: DataTypes.STRING,
    UserGender: DataTypes.STRING,
    profile:DataTypes.STRING,
    face_shape : DataTypes.STRING
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
user.hasMany(post,{foreignKey:'UserId'})

export default user;
(async () => {
  await db.sync();
})();
