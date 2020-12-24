import { stripscript } from '@/utils/charhandle';
export default function useShare(options,m,params){

   let filterSpecialChar = (value) => {
      value.validateCode = stripscript(value.validateCode);
   };

   return {
      filterSpecialChar,
   };
}