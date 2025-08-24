import { Model,DataType, Sequelize, DataTypes} from 'sequelize';
import  User from './user';


class Community extends Model {

    public id! : number; 
    public title! : string; 
    public content! : string; 
    public img? : string; // 이미지 파일 경로, 선택적 필드이므로 ? 사용


    public readonly createdAt! : Date; 
    public readonly updatedAt! : Date; 

    public readonly UserId! : number; 

    static initiate(sequelize: Sequelize) {
        return this.init({
            title:{
                type : DataTypes.STRING(100),
                allowNull : false,
            },
            content:{
                type : DataTypes.TEXT,
                allowNull: false,
            },
            img: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
        },{
            sequelize,
            timestamps :true, 
            underscored :false, // true -> snake_case, false -> camelCase
            modelName : 'Community', 
            tableName : 'communities',
            paranoid : false, // true -> deletedAt 컬럼이 생김, false -> 생기지 않음
            charset : 'utf8mb4', 
            collate : 'utf8mb4_general_ci', // 한글 저장을 위해 utf8mb4 사용
        });
    };

    static associate(db:any) { // db 객체를 받아서 관계를 설정
        db.Community.belongsTo(db.User, {foreignKey : 'UserId', targetKey : 'id'}); // User와 1:N 관계 설정
        db.Community.hasMany(db.Comment, { foreignKey: 'CommunityId', sourceKey: 'id' });
        // Community 모델은 User 모델에 belongsTo 관계를 가짐
        // foreignKey는 Community 모델의 UserId 컬럼을 참조하고, targetKey는 User 모델의 id 컬럼을 참조
    }



}; 

export default Community;
