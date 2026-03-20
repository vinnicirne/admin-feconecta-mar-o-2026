function l(o,e){if(!e.length)return;const n=Object.keys(e[0]),s=[n.join(","),...e.map(r=>n.map(i=>JSON.stringify(r[i]??"")).join(","))].join(`
`),a=new Blob([s],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(a),t=document.createElement("a");t.href=c,t.download=o,t.click(),URL.revokeObjectURL(c)}export{l as e};
