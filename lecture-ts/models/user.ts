import  Sequelize ,{BelongsTo, BelongsToManyAddAssociationMixin, CreationOptional, NonAttribute} from 'sequelize';
import Post from './post';



class User extends Sequelize.Model{

    
    declare id : CreationOptional<number>;
    declare email: string;
    declare nick: string;
    declare password: string;
    declare provider: string;
    declare snsId: string;
    declare createdAt: CreationOptional<Date>;
    declare updateAt : CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;


    // 'Followings'는 내가 팔로우하는 사람들의 배열입니다.
    declare Followings:NonAttribute< User[]>;
    // 'Followers'는 나를 팔로우하는 사람들의 배열입니다.
    declare Followers: NonAttribute<User[]>;


    declare addFollowing : BelongsToManyAddAssociationMixin<User,number>; // User가 여러개의 Following을 가질 수 있음, addFollowing 메서드로 Following을 추가할 수 있음
    static initiate(sequelize : Sequelize.Sequelize){
        User.init({
            email:{
                type :Sequelize.STRING(40),
                allowNull:true,
                unique:true,
            },
            nick:{
                type:Sequelize.STRING(15),
                allowNull:false,
            },
            password:{
                type :Sequelize.STRING(100),
                allowNull:true,
            },
            provider:{
                type : Sequelize.ENUM('local','kakao'),
                allowNull:false,
                defaultValue:'local',
            },
            snsId:{
                type:Sequelize.STRING(30),
                allowNull:true,
            }
        },{
            sequelize,
            timestamps:true, // createAt, updateAt 컬럼을 만들어줌
            underscored:false,
            modelName:'User',
            tableName:'users',
            paranoid:true, // deleteAt 컬럼을 만들어줌
            charset:'utf8',
            collate:'utf8_general_ci',
        })

    }

    static associate(db: any){
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Comment); // Comment와의 관계 추가
        db.User.belongsToMany(db.User,{
            foreignKey:'followingId',
            as : 'Followers',
            through:'Follow',
        })
        db.User.belongsToMany(db.User,{
            foreignKey:'followerId',
            as:'Followings',
            through:'Follow',
        })
    }
}

export default  User;