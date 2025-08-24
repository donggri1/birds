import IUser from '../models/user';


declare global{
    namespace Express {

        interface User extends IUser{}

         namespace Multer { // Multer 네임스페이스 안에  서 File 인터페이스 확장
            interface File {
                location :  string; // S3에서 제공하는 파일 URL
            }
        }
    }

    interface Error{
      status: number;
    }
}

export {};