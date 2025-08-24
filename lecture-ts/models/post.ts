import  Sequelize , {Model,CreationOptional, BelongsToManyAddAssociationMixin , ForeignKey } from 'sequelize';
import User from './user';
import Hashtag from './hashtag';
import { Hash } from 'crypto';


class Post extends  Model{

    declare id : CreationOptional<number>;
    declare content: string;
    declare img?: string;
    declare createdAt: CreationOptional<Date>;
    declare updateAt : CreationOptional<Date>;
    declare UserId: ForeignKey<User['id']>;
    declare addHashtags: BelongsToManyAddAssociationMixin<Hashtag, number>; // Post가 여러개의 Hashtag를 가질 수 있음, addHashtag 메서드로 Hashtag를 추가할 수 있음

    static initiate(sequelize : Sequelize.Sequelize){
        Post.init({
            content:{
                type:Sequelize.STRING(140),
                allowNull:false,
            },
            img:{
                type:Sequelize.STRING(200),
                allowNull:true,
            }
        },{
            sequelize,
            timestamps:true,
            underscored:false,
            modelName:'Post',
            tableName:'posts',
            paranoid:false,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        })
    }

    static associate(db: any){
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'});
    }
}

export default  Post;