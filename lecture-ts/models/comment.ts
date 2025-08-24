import { Model, Sequelize, DataTypes } from 'sequelize';

class Comment extends Model {
    public id!: number;
    public content!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly UserId!: number;
    public readonly CommunityId!: number;

    static initiate(sequelize: Sequelize) {
        return this.init({
            content: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db: any) {
        db.Comment.belongsTo(db.User, { foreignKey: 'UserId', targetKey: 'id' });
        db.Comment.belongsTo(db.Community, { foreignKey: 'CommunityId', targetKey: 'id' });
    }
}

export default Comment;
