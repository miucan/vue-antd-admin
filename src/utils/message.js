import { Message } from 'ant-design-vue';

export function message(message,type='success'){
  Message[type](message);
}
