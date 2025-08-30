import Sequelize from 'sequelize';
import User from './user';
import Post from './post';
import Hashtag from './hashtag';
import Community from './community';
import Comment from './comment';
import { Notification } from './notification'; // Notification 모델 import 추가
import configObj from '../config/config';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV as 'production' | 'test' || 'development';
const config = configObj[env];
const sequelize = new Sequelize.Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

interface DbType{
    sequelize : Sequelize.Sequelize;
    [key:string]:any;
}


const db = {
  sequelize,
  User,
  Post,
  Hashtag,
  Community,
  Comment,
  Notification, // db 객체에 Notification 추가
};

User.initiate(sequelize);
Post.initiate(sequelize);
Hashtag.initiate(sequelize);
Community.initiate(sequelize);
Comment.initiate(sequelize);
Notification.initialize(sequelize); // Notification 모델 초기화

User.associate(db);
Post.associate(db);
Hashtag.associate(db);
Community.associate(db);
Comment.associate(db);
Notification.associate(); // Notification 모델 관계 설정

export { User, Post, Hashtag, Community, Comment, Notification, sequelize }; // export에 Notification 추가

export type dbType = typeof db;
export default db;