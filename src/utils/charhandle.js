/**
 *   过滤特殊字符
 */


export function stripscript(str) {
      var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）& ;—|{}【】‘；：”“'。，、？]")
      var res = "";
      for (var i = 0; i < str.length; i++) {
              res = res + str.substr(i, 1).replace(pattern, '');
      }
      return res;
}

export function isEmpty(value){
  return (value == "" || value == null)?true:false;
}
