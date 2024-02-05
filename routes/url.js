import {handleGetAllUrl, handleShortUrl, handleGetRedirectUrl, handleDeleteUrl, handleGetUrlData} from '../controllers/URL.js'
import checkUserAuth from '../middlewares/checkUserAuth.js';
import  express  from 'express';
const router = express.Router();

router.route('/')
.get(checkUserAuth,handleGetAllUrl)
.post(checkUserAuth,handleShortUrl)

router.route('/get/data/:id').get(checkUserAuth,handleGetUrlData)

router.route('/get/:id')
.get(handleGetRedirectUrl)
.delete(handleDeleteUrl)

export default router;