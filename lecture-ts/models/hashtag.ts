import  Sequelize , {Model , CreationOptional, BelongsTo, BelongsToManyGetAssociationsMixin} from 'sequelize';
import Post from './post';
class Hashtag extends Model{

    declare id:  number ;
    declare title:string;
    declare createdAt: CreationOptional<Date>;
    declare updateAt : CreationOptional<Date>;

    declare getPosts : BelongsToManyGetAssociationsMixin<Post>; // Hashtag가 여러개의 Post를 가질 수 있음, getPosts 메서드로 Post를 가져올 수 있음

    static initiate(sequelize : Sequelize.Sequelize){
        Hashtag.init({
                id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    title: {
                        type: Sequelize.STRING(15),
                        allowNull: false,
                        unique: true,
                    },
                    createdAt: Sequelize.DATE,
                    updatedAt: Sequelize.DATE,
                    }, {
                    sequelize,
                    timestamps: true,
                    underscored: false,
                    modelName: 'Hashtag',
                    tableName: 'hashtags',
                    paranoid: false,
                    charset: 'utf8mb4',
                    collate: 'utf8mb4_general_ci',
                    });

    }

    static associate(db: any){
        db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
    }
}

export default Hashtag;