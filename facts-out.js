import { readFileSync, writeFileSync } from "node:fs"

let inList = readFileSync("facts-in.txt").toString().split("\n")
console.log(inList)
var out_obj = {
    facts: []
}


let construct_obj = {}
for (let i = 0; i < inList.length; i++) {

    if (inList[i].charAt(inList[i].length - 1) == ":") {
        out_obj.facts.push({})
        Object.assign(out_obj.facts[out_obj.facts.length - 1], construct_obj)
        construct_obj = {}
        construct_obj.facts = []
        construct_obj.topic = inList[i].substring(0, inList[i].length - 1)
    } else {
        construct_obj.facts.push(inList[i])
    }
}
out_obj.facts.splice(0, 1)
console.log(JSON.stringify(out_obj))
writeFileSync("server/facts.json", JSON.stringify(out_obj))