# A SIMPLE REACT COMPONENT WHICH CAN COMPARE TWO JSON VISUALLY 

it is easy for you to use this component to show the differece of two json

u can customize the styles by cover the css class

## USAGE
1. install

`yarn add react-json-compare-viewer"`

2. quote

`import JsonFormat from 'react-json-compare-viewer'`

3. use

`<div>{ JsonFormat( {a: 1}, {a: 2} ) }</div>`

## ATTENTION
if u r use webpack5, u may encounter an error which say process is not defined. 

because webpack5 do not include polyfills for nodejs

u can try add the following code to webpack config after `yarn add process`

```js
...
plugins: [
    ...
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    ...
]
```
