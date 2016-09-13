/// <reference path="../include.d.ts" />

/** 文字类型的验证 */

var chai = require('chai');
var expect = chai.expect;
var webdriver = require('selenium-webdriver');
var excelReader = require('../excelProcessor.js');
var async = require('async');
var by = webdriver.By;

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/** rgb 转换为 16进制 */
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


describe("GUI文字规范", function () {
    var taskList;
    var base;

    before(function () {
        taskList = excelReader("文字");
        base = excelReader("文字映射");
    });

    it("基础文字规范验证", function (done) {
        var driver = new webdriver.Builder().forBrowser('chrome').usingServer('http://192.168.12.104:7777/wd/hub').build();
        async.mapSeries(taskList, function (task, callback) {
            if(task["禁用"] == "y") {
                callback();
            }
            var type = task["类型"];
            var url = task["查询链接"];
            var selector = task["CSS选择器"];
            var expectedColor;
            var expectedSize;
            base.forEach(function(t, index, array) {
                if(t["序号"] === type) {
                    expectedColor = t["颜色"];
                    expectedSize = t["字号"];
                }
            });

            // var expectedColor = task["期望的颜色"];
            // var expectedSize = task["期望的字体大小"];

            driver.get(url).then(function () {
                driver.findElement(by.css(selector)).then(function (element) {
                    element.getCssValue('color').then(function (color) {
                        var rawColor = color.replace(/rgba\(/g, '').replace(/,\s\d\)/g, '');
                        var colorArray = rawColor.split(',');
                        var r = parseInt(colorArray[0].trim());
                        var g = parseInt(colorArray[1].trim());
                        var b = parseInt(colorArray[2].trim());
                        var rgbHex = rgbToHex(r, g, b);

                        expect(rgbHex, url + ' - ' + selector + ' - Color is wrong ').equal(expectedColor);
                    }).then(function () {
                        element.getCssValue('font-size').then(function (font) {
                            expect(font, url + ' - ' + selector + ' - font is wrong ').equal(expectedSize);
                            callback();
                        });
                    });

                });
            });

        }, function (err) {
            if (err) console.log(err);
            driver.quit();
            done();
        });
    });
});