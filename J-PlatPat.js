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
	"lastUpdated": "2020-08-06 13:48:47"
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
	return "patent";
	if (url.indexOf("/PU") != -1) {
		return "patent";
	}
	return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "patent") {
		var newItem = new Zotero.Item("patent");
		newItem.title = "Test Pattent"
		newItem.complete();
	}
}
