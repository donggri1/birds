
import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import  User  from './user';
import  Post  from './post'; // Post 모델 import 추가

// Notification 모델 클래스 정의
class Notification extends Model {
  // 모델의 속성들을 public으로 선언
  public readonly id!: number;
  public type!: 'follow' | 'comment' | 'like';
  public content!: string;
  public read!: boolean;
  public link!: string | null;
  public postId!: number | null; // postId 속성 추가

  // 관계 설정에 사용될 연관 객체 선언
  public static associations: {
    Sender: Association<Notification, User>;
    Receiver: Association<Notification, User>;
    Post: Association<Notification, Post>; // Post 연관 객체 추가
  };

  // 모델 초기화 함수
  static initialize(sequelize: Sequelize) {
    this.init({
      // 알림 종류 (follow, comment, like)
      type: {
        type: DataTypes.ENUM('follow', 'comment', 'like'),
        allowNull: false,
      },
      // 알림 내용
      content: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      // 읽음 여부 (기본값: false)
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // 알림 클릭 시 이동할 링크
      link: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // postId는 모델 정의에 명시적으로 추가하지 않아도 관계 설정 시 자동으로 생성되지만,
      // 타입스크립트에서 명확하게 사용하기 위해 선언해주는 것이 좋습니다.
    }, {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  // 다른 모델과의 관계 설정
  static associate() {
    // User 모델과 1:N 관계 설정 (알림 보낸 사람)
    this.belongsTo(User, {
      foreignKey: 'senderId',
      as: 'Sender',
    });
    // User 모델과 1:N 관계 설정 (알림 받는 사람)
    this.belongsTo(User, {
      foreignKey: 'recipientId', // recipientId로 수정
      as: 'Receiver',
    });
    // Post 모델과 1:N 관계 설정
    this.belongsTo(Post, {
      foreignKey: 'postId',
    });
  }
}

export { Notification };
