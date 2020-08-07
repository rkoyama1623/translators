{
	"translatorID": "d71e9b6d-2baa-44ed-acb4-13fe2fe592c1",
	"label": "J-PlatPat",
	"creator": "Ryo Koyama",
	"target": "^https?://(www\\.)?j-platpat\\.inpit\\.go\\.jp",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-08-07 05:55:43"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Ryo Koyama

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.indexOf("/p0200") != -1) {
		return "patent";
	}
	return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "patent") {
		var item = new Zotero.Item("patent");
		// set valid url
		doc.querySelector('a#docuTitleArea_btnUrl').click()
		var url = doc.querySelector('a#lnkUrl').innerText;
		if (url !== null) item.url = url;
		doc.querySelector('a#btnClose').click();

		/*
		dataList is a list of innerHTML.
		ex)
		["(19)【発行国】日本国特許庁(JP)",
		 "(12)【公報種別】公開特許公報(A)",
		 ...,
		 "<span class="monospaced-font">&nbsp;&nbsp;&nbsp;Ａ４…sp;&nbsp;23/08&nbsp;&nbsp;&nbsp;&nbsp;　　　Ｚ</span>"]
		*/
		var dataList = doc.querySelector('rti').innerHTML.split('<br>');

		// set title
		var title = getInfo(dataList, '【発明の名称】') || getInfo(dataList, '[Title of the invention]') ||doc.querySelector('h2').innerText ||"";
		item.title = ZU.cleanTags(title);

		// set inventors
		var inventors = getInfoOffsetAll(dataList, '【発明者】', 1, '【氏名】') || getInfoOffsetAll(dataList, '[Inventor]', 1, '[Name]') || [];
		for (let i=0; i<inventors.length; i++) {
			var inventor = ZU.cleanTags(inventors[i]); // remove html tag
			inventor = inventor.replace('，',',');  // Zenkaku -> Hankaku
			inventor = inventor.replace(/\s|&nbsp;/g,' '); // replace &nbsp; to space
			inventor = inventor.replace(/ +/g,' '); // remove multiple space
			var tmp_inventor = inventor.replace(' ',','); // replace space to comma
			tmp_inventor = tmp_inventor.replace(/,+/g,','); // remove multiple comma

			if (tmp_inventor.split(',').length == 2) { // 'FirstName, SecondName'
				item.creators.push(ZU.cleanAuthor(tmp_inventor, 'inventor', true));
			} else {// Name. Name, Name, ....
				item.creators.push({'firstName':'', 'lastName':inventor, 'creatorType': 'inventor'});
			}
		}

		// set issue Date
		var issueDate = getInfo(dataList, '【発行日】') || getInfo(dataList, '[Publication date]') ||"";
		if (issueDate !== undefined) item.issueDate = ZU.cleanTags(issueDate);

		// set filingDate
		var filingDate = getInfo(dataList, '【出願日】') || getInfo(dataList, '[Filing date]') || "";
		item.filingDate = ZU.cleanTags(filingDate);

		// set patent number
		var patentNumber = getInfo(dataList, '【特許番号】') || getInfo(dataList, '[Patent number]') || "";
		item.patentNumber = ZU.cleanTags(patentNumber);

		// set assinee
		var assinee = getInfoOffsetAll(dataList, '【特許権者】',2,'【氏名又は名称】') || getInfoOffsetAll(dataList, '[Patentee]', 2, '[Name]') || [""];
		item.assinee = ZU.cleanTags(assinee[0]);

		// set application number
		var applicationNumber = getInfo(dataList, '【出願番号】') || getInfo(dataList, '[Application number]') || "";
		item.applicationNumber = ZU.cleanTags(applicationNumber);

		// set country
		var country = getInfo(dataList, '【発行国】') || getInfo(dataList, '[Publication country]') || "";
		item.country = ZU.cleanTags(country);

		// set abstract
		var boxes = doc.querySelectorAll('a.l-toggle__header.js-toggle-active.js-toggle-href-active')
		for (let i=0; i<boxes.length; i++) {
			var box = boxes[i];
			var boxTitle = box.querySelector('h3').innerText;
			// find overview box
			if (boxTitle.indexOf('要約') != -1 || boxTitle.indexOf('Overview') != -1) {
				var txfElement = box.parentElement.querySelector('txf');
				// if overview box is closed, emulate click and open the box
				if (txfElement === null) {
					box.click();
					txfElement = box.parentElement.querySelector('txf');
					box.click();
				}
				if (txfElement !== null) item.abstract = txfElement.innerText;
				break;
			}
		}

		// set classificaton
		var classifications = [];
		var inFiDescription = false;
		for (let i=0; i<dataList.length; i++) {
			var data = dataList[i];
			data = zenkaku2hankaku(data);
			if (data.indexOf('【FI】') != -1 || data.indexOf('[FI]') != -1) {
				inFiDescription = true;
				continue;
			}
			if (inFiDescription && (data.indexOf('【') != -1 || data.indexOf('[') != -1 )) {
				inFileDescriion = false;
				break;
			}
			if (inFiDescription && (data.indexOf('【') == -1 || data.indexOf('[') == -1 )) {
				data = data.replace(/\s|&nbsp;/g,' '); // replace &nbsp; to space
				data = data.replace(/ +/g,' '); // remove multiple space
				classifications.push(data);
			}
		}
		if (classifications.length>0) {
			item.notes.push({note: "<h2>Classifications</h2>\n" + classifications.join("<br/>\n")});
		}

		// complete item
		item.complete();
	}
}

/*
    Example:
	key = '[name]'
	dataList = ['[name]Bob', '[name]John', '[title]awsom invent']
	getInfo(dataList, key) // return ['Bob']
*/
function getInfo(dataList, key) {
	for (let i=0; i<dataList.length; i++) {
		var data = dataList[i];
		var iKey = data.indexOf(key);
		if (iKey != -1) {
			return data.slice(iKey+key.length);
		}
	}
	return undefined;
}

/*
    Example:
	key = '[name]'
	dataList = ['[name]Bob', '[name]John', '[title]awsom invent']
	getInfoAll(dataList, key) // return ['Bob', 'John']
*/
function getInfoAll(dataList, key) {
	var arr = [];
	for (let i=0; i<dataList.length; i++) {
		var data = dataList[i];
		var iKey = data.indexOf(key);
		if (iKey != -1) {
			arr.push(data.slice(iKey+key.length));
		}
	}
	if (arr.length !== 0) {
		return arr;
	}
	return undefined;
}

/*
    Example:
	key = '[inventor]'
	dataList = ['[inventor]', [name]Bob', '[inventor]', '[name]Ema']
	getInfoOffsetAll(dataList, key, 1) // return ['[name]Bob', '[name]Ema']
	getInfoOffsetAll(dataList, key, 1, '[name]') // return ['Bob', 'Ema']
*/
function getInfoOffsetAll(dataList, key, offset, key2='') {
	var arr = [];
	for (let i=0; i<dataList.length; i++) {
		var data = dataList[i];
		var iKey = data.indexOf(key);
		if (iKey != -1) {
			var data2 = dataList[i+offset];
			var iKey2 = data2.indexOf(key2);
			arr.push(data2.slice(iKey2+key2.length));
		}
	}
	if (arr.length !== 0) {
		return arr;
	}
	return undefined;
}

function zenkaku2hankaku(str) {
	return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
		return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
	});
}
