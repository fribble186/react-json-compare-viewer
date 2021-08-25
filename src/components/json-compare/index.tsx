/**
 * 可以高亮显示两段 json 的不同的字段
 * 换行和 indent 部分参考了 json-format 的代码（原来只能换行和加上indent）
 */
 import React from 'react';
 import { diff } from 'json-diff';
 import './index.css';
 
 /**
  * 得到两段 json 不同的字段
  * @param old_json 原来的 json
  * @param new_json 新的 json
  * @returns ADD 增加的字段 DELETE 删除的字段 UPDATE 更新的字段
  * 字段都是列表，这样可以携带环境信息，比如['user', 'name', 'first_name']=>user.name.first_name
  */
 const getComparation = (old_json: any, new_json: any) => {
   const ADD: string[][] = [];
   const DELETE: string[][] = [];
   const UPDATE: string[][] = [];
   const diffObj = diff(old_json, new_json);
   /**
    * 递归找到不同字段的对应类型和环境信息
    * @param obj 经过处理的 diff json
    * @param context 当前所处的位置
    */
   const travel = (obj: any = diffObj, context: string[] = []) => {
     Object.keys(obj).forEach((keyName) => {
       if (keyName.indexOf('__added') !== -1) {
         ADD.push([...context, keyName.split('__added')[0]]);
       } else if (keyName.indexOf('__deleted') !== -1) {
         DELETE.push([...context, keyName.split('__deleted')[0]]);
       } else if (obj[keyName].__old && obj[keyName].__new) {
         UPDATE.push([...context, keyName]);
       } else {
         const _context = [...context, keyName].slice();
         travel(obj[keyName], _context);
       }
     });
   };
   travel();
   return { ADD, DELETE, UPDATE };
 };
 
 /**
  * 正常格式化一段 json 加加空格 加加 indent
  * json-format 的代码，基本上没动
  * @param json 字面意思，就一段 json
  * @param indentType indent 这里可以自定义，比如说4个空格，一个 tab
  * @returns
  */
 const JSONFormat = (json: any, indentType: any) => {
   let p: any[] = [];
   const push = (m: any) => {
     return `\\${p.push(m)}\\`;
   };
   const pop = (_: any, i: number) => {
     return p[i - 1];
   };
   const tabs = (count: any) => {
     return new Array(count + 1).join(indentType);
   };
 
   p = [];
   let out = '';
   let indent = 0;
 
   // Extract backslashes and strings
   // 用正则提出来最后再装回去
   json = json
     .replace(/\\./g, push)
     .replace(/(".*?"|'.*?')/g, push)
     .replace(/\s+/, '');
   // Indent and insert newlines
   for (let i = 0; i < json.length; i += 1) {
     const c = json.charAt(i);
 
     switch (c) {
       case '{':
       case '[':
         indent += 1;
         out += `${c}\n${tabs(indent)}`;
         break;
       case '}':
       case ']':
         indent -= 1;
         out += `\n${tabs(indent)}${c}`;
         break;
       case ',':
         out += `,\n${tabs(indent)}`;
         break;
       case ':':
         out += ': ';
         break;
       default:
         out += c;
         break;
     }
   }
 
   // Strip whitespace from numeric arrays and put backslashes
   // and strings back in
   out = out
     .replace(/\[[\d,\s]+?\]/g, (m) => {
       return m.replace(/\s/g, '');
     })
     .replace(/\\(\d+)\\/g, pop) // strings
     .replace(/\\(\d+)\\/g, pop); // backslashes in strings
 
   return out;
 };
 
 /**
  * @param old_json 原来的 json
  * @param new_json 新的 json
  * @returns 返回一个 div 对应高亮显示不同的字段
  */
 const JsonFormat = (old_json: any, new_json: any) => {
   const { ADD, DELETE, UPDATE } = getComparation(old_json, new_json); // 获得增加，删除和更新的字段和字段的环境
   const indentType = new Array(4 + 1).join(' '); // 自定义 indent
   const old_data = JSONFormat(JSON.stringify(old_json), indentType); // 获取原来 json 的格式化字符串
   const new_Data = JSONFormat(JSON.stringify(new_json), indentType); // 获取新 json 的格式化字符串
   const randomIndex: string = Math.random().toString();
   const context: string[] = [];
   const ADD_COLUMNS: number[] = [];
   const DELETE_COLUMNS: number[] = [];
 
   // 得到原来 json 的 dom 列表
   // 记录原来 json 被删除的行是哪些
   const old_json_columns = old_data.split('\n').map((item, index) => {
     let className = "normalColumn";
     // 根据 indent 获得当前所在的环境
     if (item.indexOf('"') / 4 > context.length) {
       context.push(item.replace(/\s+/g, '').replace(/"/g, '').split(':')[0]);
     } else if (item.indexOf('"') / 4 === context.length) {
       context[context.length - 1] = item
         .replace(/\s+/g, '')
         .replace(/"/g, '')
         .split(':')[0] as string;
     } else {
       context.pop();
     }
 
     // 根据当前所在的环境得到这行是更新，添加还是删除，对应不同的样式
     if (UPDATE.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "updateColumn";
     }
     if (ADD.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "addColumn";
     }
     if (DELETE.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "deleteColumn";
       DELETE_COLUMNS.push(index);
     }
     return (
       <div className={className} key={`old_${randomIndex}_${index + 1}`}>
         {item}
       </div>
     );
   });
 
   // 得到新 json 的 dom 列表
   // 记录新 json 添加的行是哪些
   const new_json_columns = new_Data.split('\n').map((item, index) => {
     let className = "normalColumn";
     const needEmpty = false;
     if (item.indexOf('"') / 4 > context.length) {
       context.push(item.replace(/\s+/g, '').replace(/"/g, '').split(':')[0]);
     } else if (item.indexOf('"') / 4 === context.length) {
       context[context.length - 1] = item
         .replace(/\s+/g, '')
         .replace(/"/g, '')
         .split(':')[0] as string;
     } else {
       context.pop();
     }
     if (UPDATE.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "updateColumn";
     }
     if (ADD.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "addColumn";
       ADD_COLUMNS.push(index);
     }
     if (DELETE.filter((column: any) => JSON.stringify(column) === JSON.stringify(context)).length) {
       className = "deleteColumn";
     }
     return (
       <div className={className} key={`new_${randomIndex}_${index + 1}`}>
         {item}
         {needEmpty ? <div /> : null}
       </div>
     );
   });
 
   // 已经得到删除的行和新添加的行的对应 index
   // 按照 index 从小到大排序，在新老 json 间交叉填入空行
   const CROSS = [
     ...ADD_COLUMNS.map((index) => {
       return { type: 'ADD', index };
     }),
     ...DELETE_COLUMNS.map((index) => {
       return { type: 'DELETE', index };
     }),
   ].sort((a, b) => a.index - b.index);
   let ADD_DRIFT = 0;
   let DELETE_DRIFT = 0;
   CROSS.forEach((corss) => {
     if (corss.type === 'ADD') {
       old_json_columns.splice(
         corss.index + DELETE_DRIFT,
         0,
         <div className={"addColumn"}> </div>,
       );
       ADD_DRIFT += 1;
     }
     if (corss.type === 'DELETE') {
       new_json_columns.splice(
         corss.index + ADD_DRIFT,
         0,
         <div className={"deleteColumn"}> </div>,
       );
       DELETE_DRIFT += 1;
     }
   });
 
   return (
     <div style={{ display: 'flex', flexDirection: 'column' }}>
       {old_json_columns.map((_: any, column_index: number) => (
         <div
           key={`json_format_${column_index + 1}`}
           className={"column"}
           style={{ display: 'flex', flexDirection: 'row' }}
         >
           <div style={{ flex: 1 }}>{old_json_columns[column_index]}</div>
           <div style={{ flex: 1 }}>{new_json_columns[column_index]}</div>
         </div>
       ))}
     </div>
   );
 };
 
 export default JsonFormat;
 