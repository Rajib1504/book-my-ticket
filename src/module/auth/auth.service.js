import pool from "../common/config/db.config";

const register = async(req,res)=>{
      const {name,email,password} = req.body;
      try {
            const userCheck =await pool.query("SELECT * FROM users WHERE email =$1",[email]);
            if(userCheck.rowCount> 0){
                  
            }
      } catch (error) {
            
      }
}