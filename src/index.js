import React from "react";
import ReactDOM from "react-dom";
import JsonFormat from "./components/json-compare"

ReactDOM.render(<div>{JsonFormat({a:1, b:2 }, {a:2, c:2})}</div>, document.getElementById("root"));
