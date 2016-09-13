/// <reference path="./include.d.ts" />

var ew = require('node-xlsx');
var fs = require('fs');

/** 工具方法 - 根据列名获取列Index */
function getColumnIndex(columns, name) {
    var ci = -1;
    columns.forEach(function (columnName, index, array) {
        if (columnName === name) {
            ci = index;
        }
    });
    return ci;
}

/** 获取某种UI控件的测试JSON */
function getTestJson(sheetName) {

    var filePath = 'issuedGUI.xlsx';

    var sheets = ew.parse(fs.readFileSync(filePath));

    var cSheet;

    sheets.forEach(function (sheet, index, array) {
        if (sheet.name == sheetName) {
            cSheet = sheet;
        }
    });

    if (!cSheet) {
        console.log('Unable to find sheet ' + sheetName);
        process.exit();
    }

    var data = cSheet.data;

    var columns = data[0];

    var composedArray = []; 

    data.forEach(function(row, index, array) {
        if(index === 0) {
            return;
        }
        var composedJson = '{';
        row.forEach(function(cell, index, array) {
            var key = columns[index];
            composedJson+= '"' + key + '":"' + cell + '"';
            if(index < array.length - 1) {
                composedJson+=',';
            }
        });
        composedJson+='}';
        // console.log(composedJson);
        composedArray.push(JSON.parse(composedJson));
    });
    

    return composedArray;
    // var columnUrlIndex = getColumnIndex(columns, 'Url');
    // var selectorIndex = getColumnIndex(columns, 'Selector');
    // var expectColorIndex = getColumnIndex(columns, 'Expect Color');
    // var expectFontSizeIndex = getColumnIndex(columns, 'Expect Font Size');

}

module.exports = getTestJson;