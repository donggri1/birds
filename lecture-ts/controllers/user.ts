import  User  from  '../models/user';
import  {follow as followService} from  '../services/user';

import { RequestHandler } from 'express';

const follow :RequestHandler = async(req ,res,next )=>{
    try{
        const result = await followService(req.user!.id, req.params.id);
        if(result === 'ok'){
            
            res.send('success');
        }else if(result === 'no User'){
            res.status(404).send('no User');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
};

export { follow };