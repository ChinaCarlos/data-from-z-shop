const express = require('express');
const http = require('http')
const cheerio = require('cheerio');
const superagent = require('superagent');
const async = require('async');
const iconv = require('iconv-lite')
const htmlparser2 = require('htmlparser2');
const eventproxy = require('eventproxy');
const router = express.Router();
const getGoodsData =require('./getData.js')
 //获取从字符串中提取的商品ID函数
  function getGoodsId(str){
   let pattern = /\{(.+?)\}/g;
   let objStr = str.match(pattern)[0];
   let goods = eval("("+objStr+")");
   return goods.goodsId
  }
  //全局跨域
//   router.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   
//     next();
// });
/* GET home page. */
router.get('/', function(req, res, next) {
  let pageSize =req.query.pageSize
  //跨域
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
 //  爬去商品列表的数据
   let GoodsListPromise = getGoodsData.getGoodsList(pageSize)
   GoodsListPromise.then(data =>{
    res.send(data)
   }).catch(error =>{
    console.log('promise is error')
   })
//爬取商品列表数据结束

});

// 获取详情页路由
router.post('/detail',(req,res,next)=>{
  let id = req.body.goodsId
  let price = req.body.goodsPrice
  let Dataurl = req.body.goodsDetailUrl
  //设置跨域
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  //爬取商品详情数据根据商品的goodsDetailUrl属性,价格，类型
  //获取提交的参数
  
  let detailPromise = getGoodsData.getGoodsDetail(id,Dataurl,price)
  detailPromise.then(data => {
    res.send(data)
  }).catch(error => {
    console.log('detail promise is error router')
  })
// 获取商品详情数据结束

})


module.exports = router;
