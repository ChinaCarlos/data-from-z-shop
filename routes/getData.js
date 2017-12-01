var http = require('http')
var cheerio = require('cheerio');
var superagent = require('superagent');
var async = require('async');
var iconv = require('iconv-lite')
const htmlparser2 = require('htmlparser2');
var eventproxy = require('eventproxy');
//获取从字符串中提取的商品ID函数
  function getGoodsId(str){
   let pattern = /\{(.+?)\}/g;
   let objStr = str.match(pattern)[0];
   let goods = eval("("+objStr+")");
   return goods.goodsId
  }
// 获取对应商品列表
function getGoodsList(pageSize){
  var reusltGoodsListData = [];
  var promise = new Promise(function(resolve,reject){
    http.get(`http://www.zol.com/list/c34_${pageSize}.html`, function(sres) {
    var chunks = [];
    sres.on('data', function(chunk) {
      chunks.push(chunk);
    });
    sres.on('error',function(error){
      reject(error)
    })
    sres.on('end', function() {
      // 将二进制数据解码成 gb2312 编码数据
      let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
      const dom = htmlparser2.parseDOM(html);
      const $ = cheerio.load(dom);
      let goods = [];
      let goodsId  =$('#goodsPicList .attention')
      let goodsImg =$('#goodsPicList img')
      let goodsTitle=$('#goodsPicList .title a') 
      let goodsPrice = $('#goodsPicList .price-bar .price')
      let goodsSellCount = $('#goodsPicList .volume span em')
      let goodsCommentsCount =$('#goodsPicList .volume span a')
      for(let i =0 ;i < goodsImg.length;i++){
       let goodObj={
        goodsId:getGoodsId(goodsId.eq(i).attr('onclick')),
        goodsTitle:goodsTitle.eq(i).text(),
        goodsType:'',
        goodsDetailUrl:goodsTitle.eq(i).attr('href'),
        goodsImgUrl:goodsImg.eq(i).attr('src'),
        goodsPrice:goodsPrice.eq(i).text().toString().replace('&yen;',''),
        goodsSellCount:goodsSellCount.eq(i).text().toString().replace('&nbsp;',''),
        goodsCommentsCount:goodsCommentsCount.eq(i).text()
       }
       goods.push(goodObj)
      }
      resolve(goods)
    })
  })
 })
  return promise
}
// 获取对应商品详情
function getGoodsDetail(GoodsId,getDetailDataUrl,GoodsDetailPrice){
  var GoodsDetailPromise = new Promise((resolve,reject) => {
    http.get(getDetailDataUrl, function(sres) {
    var chunks = [];
    sres.on('data', function(chunk) {
      chunks.push(chunk);
    });
    sres.on('error',function(error){
      reject(error)
      console.log('goodsDetail  promise is error')
    })
    sres.on('end', function() {
      // 将二进制数据解码成 gb2312 编码数据
      let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
      const dom = htmlparser2.parseDOM(html);
      const $ = cheerio.load(dom);
      let goodsListImgsUrl = [];
      let IntroduceImgs = [];
      let goodsWrapper = $('#zs-big-pic img').attr('src')
      let goodsId  = getGoodsId($('.zs-store-buy').eq(0).attr('onclick'))
      let goodsImgs =$('.zs-focus-list ul li a img')
      let goodsTitle=$('.zs-commodity-title').eq(0).text() 
      let goodsSubTitle=$('.subheading').eq(0).text()
      let goodsShop = $('#zs_shop_url').text()
      let goodsSellCount = $('#a-buy-record em').text()
      let goodsCommentsCount =$('#a-buy-review em').text()
      let goodsRate = $('.zs-comment-goodsrate .goods-num em b').text()
      let goodsIntroduceImgs = $('.zs-goods-content img')
      let goodsBaseInfo =$('.zs-parameter table').html()
      // 店家热卖
      let hotGoods = [];
      let hotGoodsItems = $('.zs-modbox .zs-product-list li')
      for(let i =0 ;i < goodsImgs.length;i++){
       goodsListImgsUrl.push(goodsImgs.eq(i).attr('src'))
      }
      for(let i =0;i < goodsIntroduceImgs.length;i++){
        IntroduceImgs.push(goodsIntroduceImgs.eq(i).attr('src'))
      }
      console.log(hotGoodsItems.length)
      for(let i =0 ;i<hotGoodsItems.length ;i++){
        let hotItemObj={
          getDetailUrl:hotGoodsItems.eq(i).find('a').attr('href'),
          imgUrl:hotGoodsItems.eq(i).find('a img').attr('src'),
          goodsPrice:hotGoodsItems.eq(i).find('.zs-price span').text(),
          goodTitle:hotGoodsItems.eq(i).find('.zs-title').text(),
        }
        hotGoods.push(hotItemObj)
      }
      let goodsObj={
        goodsId:GoodsId,
        goodsTitle:$('.zs-commodity-title').text(),
        goodsSubTitle:goodsSubTitle,
        goodsType:'移动手机',
        goodsShop:goodsShop,
        goodsWrapper:goodsWrapper,
        goodsListImgUrls:goodsListImgsUrl,
        goodsIntroduceImgs:IntroduceImgs,
        goodsPrice:GoodsDetailPrice,
        goodsRate:goodsRate,
        goodsSellCount:goodsSellCount,
        goodsCommentsCount:goodsCommentsCount,
        goodsBaseInfo:goodsBaseInfo,
        hotGoods:hotGoods
       }
      resolve(goodsObj)
    });
  });
 })
  return GoodsDetailPromise
}

module.exports = {
  getGoodsList,
  getGoodsDetail
}


