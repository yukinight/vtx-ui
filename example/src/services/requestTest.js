//处理异步请求
import request from '../utils/request';
import qs from 'qs';
//获取路线编号(新增时使用)
export async function query(params) {
	return request(
		'/api/users',
		{
			method: 'POST',
			body: params
		}
	)
}