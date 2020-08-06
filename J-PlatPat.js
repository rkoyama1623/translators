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
	"lastUpdated": "2020-08-06 11:45:31"
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
		setValidUrl(doc, item);
		/*
		dataList is a list of innerHTML.
		ex)
		["(19)【発行国】日本国特許庁(JP)",
		 "(12)【公報種別】公開特許公報(A)",
		 ...,
		 "<span class="monospaced-font">&nbsp;&nbsp;&nbsp;Ａ４…sp;&nbsp;23/08&nbsp;&nbsp;&nbsp;&nbsp;　　　Ｚ</span>"]
		*/
		dataList = doc.querySelector('rti').innerHTML.split('<br>');
		// set valid meaningful title
		title = getInfo(dataList, '【発明の名称】') || getInfo(dataList, '[Title of the invention]') ||doc.querySelector('h2').innerText;
		item.title = ZU.cleanTags(title);
		
		item.creators.push(ZU.cleanAuthor("LastName, FirstName", 'inventor', true));
		item.complete();
	}
}


/*
	emulate click the URL button,
	get the valid URL from the poped up,
	emulate click the close button,
	and set the url into the given zotero item.
*/
function setValidUrl(doc, item) {
	doc.querySelector('a#docuTitleArea_btnUrl').click()
	url = doc.querySelector('a#lnkUrl').innerText
	doc.querySelector('a#btnClose').click()
	item.url = url;
	return;
}


/*
	key = '[name]'
	dataList = ['[name]Bob', '[name]John', '[title]awsom invent']
	getInfo(dataList, key) // return ['Bob']
*/
function getInfo(dataList, key) {
	for (let i=0; i<dataList.length; i++) {
		data = dataList[i];
		iKey = data.indexOf(key);
		if (iKey != -1) {
			return data.slice(iKey+key.length);
		}
	}
	return undefined;
}

/*
	key = '[name]'
	dataList = ['[name]Bob', '[name]John', '[title]awsom invent']
	getInfoAll(dataList, key) // return ['Bob', 'John']
*/
function getInfoAll(dataList, key) {
	arr = [];
	for (let i=0; i<dataList.length; i++) {
		data = dataList[i];
		iKey = data.indexOf(key);
		if (iKey != -1) {
			arr.push(data.slice(iKey+key.length));
		}
	}
	return arr;
}

