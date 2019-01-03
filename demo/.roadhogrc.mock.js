global.names = ['11','33','yw','xc','wc','ztq','yyz','swh'];
export default {
    'POST /apis/repete': (req, res)=>{
        let bl = names.indexOf(req.body.name) > -1;
        let t = Math.random()*2000;
        setTimeout(function () {
            res.end(JSON.stringify({
                msg: '',
                result: 0,
                data: !bl
            }));
        }, t);
    }
};
